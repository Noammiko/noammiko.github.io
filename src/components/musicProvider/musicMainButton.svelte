<script lang="ts">
  import { handleOpenLink, lookupBrand, provider, getSelectedProvider } from "./music";
  import type { MusicProvider } from "./types";
  import Button from "../ui-svelte/button/button.svelte";

  const { items }: { items: Array<MusicProvider> } = $props();

  let currentProvider = $derived(getSelectedProvider(items, $provider));
  const providerBrand = $derived(lookupBrand($provider));

  function handleClick() {
    handleOpenLink(currentProvider.url, currentProvider.nativeUrl);
  }
</script>

{#if !currentProvider}
  <span>No provider selected</span>
{:else}
  <Button onclick={handleClick} class="w-full">
    <span>Open in {providerBrand.label}</span>
  </Button>
{/if}
