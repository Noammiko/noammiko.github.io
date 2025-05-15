<script lang="ts">
  import Bundle from "./bundle.svelte";

  import TimeRemaining from "./TimeRemaining.svelte";
  import { getPricesAndBundles, getCurrentPricesAndBundles } from "./sheetdb";
  import type { Price } from "./types";
  import { onMount } from "svelte";

  let { default: currentPrice }: { default: Price } = $props();
  console.log(currentPrice);

  onMount(async () => {
    const data = await getPricesAndBundles();
    if (data != undefined && data.length > 0) {
      currentPrice = getCurrentPricesAndBundles(data);
    }
  });
</script>

{#if currentPrice.sale}
  <div class="uppercase text-center mb-6 md:mb-12 font-matchbox">
    <h2 class="text-xl md:text-4xl text-yellow-500 font-bold">
      Limited time <span>{currentPrice.sale.name}</span>!
    </h2>
    <p class="text-lg md:text-2xl text-red-500">
      Sale ends
      <TimeRemaining targetTime={currentPrice.sale.end} />
    </p>
  </div>
{/if}

<!-- Bundles Section -->
<div class="grid lg:grid-cols-3 gap-8 mb-16">
  {#each currentPrice.deals as deal, idx}
    <Bundle {deal} glow={idx === 1} />
  {/each}
</div>

<!-- TODO: make buttons change the email default text -->
