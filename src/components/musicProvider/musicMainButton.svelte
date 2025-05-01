<script lang="ts">
  import { storable } from "../../lib/storable.svelte";
  import { handleOpenLink, lookupBrand } from "./music";
  import type { MusicProvider, Platform } from "./types";

  const { items }: { items: Array<MusicProvider> } = $props();

  const provider = storable<Platform>("musicProvider", "spotify");
  let currentProvider = $derived(
    items.find((item) => item.provider === $provider),
  );
  const providerBrand = $derived(lookupBrand($provider));
</script>

{#if !currentProvider}
  <span>No provider selected</span>
{:else}
  <button
    class="w-full bg-black text-white rounded-md content-center flex justify-center items-center whitespace-nowrap gap-1 p-2"
    onclick={() =>
      handleOpenLink(currentProvider.url, currentProvider.nativeUrl)}
  >
    <span>Open in {providerBrand.label}</span>
  </button>
{/if}
