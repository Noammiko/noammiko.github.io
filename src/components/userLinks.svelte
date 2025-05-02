<script lang="ts">
  import "iconify-icon";
  import Spinner from "./SpinnerRect.svelte";

  import brands from "@/lib/icons";

  interface Link {
    href?: string;
    type: keyof typeof brands;
    ariaLabel?: string;
  }

  let { links }: { links: (Link | "br")[] } = $props();


</script>

<Spinner
  revolutionTimeSeconds={3}
  lineWidth={5}
  lineLength={25}
  cornerRadius={6}
  showPath={false}
  classNames="bg-inherit p-5 rounded-md w-full flex justify-between text-primary text-4xl"
  height={76}
  lineColour="rgb(117 17 150)"
>
  {#each links as value}
    {#if value === "br"}
    <br>
    {:else if value.href}
      <a
        href={value.href}
        aria-label={value.ariaLabel ?? brands[value.type].label}
        target="_blank"
        class="hover:-translate-y-0.5"
      >
        <iconify-icon class="align-middle" inline={true} icon={brands[value.type].icon}></iconify-icon>
      </a>
    {:else}
      <span
        aria-disabled="true"
        role="button"
        aria-label={value.ariaLabel ?? brands[value.type].label}
        class="pointer-events-none"
      >
        <iconify-icon class="text-primary/30 align-middle" inline={true} icon={brands[value.type].icon}
        ></iconify-icon>
      </span>
    {/if}
  {/each}
</Spinner>
