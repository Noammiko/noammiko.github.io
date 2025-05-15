<script lang="ts">
  import { Temporal } from "@js-temporal/polyfill";
  import { onMount } from "svelte";
  const {
    // targetTimeString,
    targetTime,
    smallestUnit = "seconds",
    highestUnit = "days",
  }: {
    // targetTimeString: string;
    targetTime: Temporal.Instant;
    smallestUnit?: Temporal.SmallestUnit<Temporal.DateTimeUnit>;
    highestUnit?: Temporal.LargestUnit<Temporal.DateTimeUnit>;
  } = $props();

  // const targetTime = Temporal.Instant.from(targetTimeString);
  let remaining: Temporal.Duration = $state(null);

  let loaded = $state(false);
  onMount(() => {
    loaded = true;
    function update() {
      const now = Temporal.Now.instant();
      remaining = now
        .until(targetTime)
        .round({ largestUnit: highestUnit, smallestUnit: smallestUnit });
    }
    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  });

  const order = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "weeks",
    "months",
    "years",
  ];
</script>

{#if remaining == null}
  <span
    >{targetTime.toLocaleString("en", {
      dateStyle: "long",
    })}</span
  >
{:else}
  <div class="flex flex-row-reverse gap-4 justify-center units">
    {#each order.slice(order.indexOf(smallestUnit), order.indexOf(highestUnit) + 1) as unit}
      <div class="flex flex-col unit-container">
        <p class="text-xl md:text-3xl">
          {remaining[unit].toString().padStart(2, "0")}
        </p>
        <span class="text-sm tracking-tight">{unit}</span>
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  // add a semi colen infront of every div except the first
  .units {
    .unit-container {
      position: relative;

      // Add colon before each div except the last one (which is first in flex-row-reverse)
      &:not(:first-child)::before {
        content: ":";
        @media (width >= 48rem /* 768px */) {
          font-size: 2rem;
        }
        font-size: 1.5rem;

        position: absolute;
        right: -1rem; // Position to the right of each unit
        top: 50%; // Center vertically
        transform: translateY(
          -80%
        ); // Adjust for visual centering with the digits
        line-height: 1;
      }
    }
  }
</style>
