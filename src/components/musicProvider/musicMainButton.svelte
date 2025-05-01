<script lang="ts">
  import {
    handleOpenLink,
    lookupBrand,
    provider,
    getSelectedProvider,
  } from "./music";
  import type { MusicProvider } from "./types";
  import Button from "../ui-svelte/button/button.svelte";
  import { ExternalLink } from "@lucide/svelte";

  const { items }: { items: Array<MusicProvider> } = $props();

  let currentProvider = $derived(getSelectedProvider(items, $provider));
  const providerBrand = $derived(lookupBrand($provider));

  function handleClick() {
    handleOpenLink(currentProvider.url, currentProvider.nativeUrl);
  }
</script>

{#if !currentProvider}
  <Button onclick={handleClick} disabled class="w-full text-lg text-red-200">
    No provider selected
  </Button>
{:else}
  <Button onclick={handleClick} class="w-full gap-2 text-lg">
    <iconify-icon icon={providerBrand.icon} class="text-3xl"></iconify-icon>
    Open in {providerBrand.label}
    <ExternalLink class="w-4 h-4 -mt-2" />
  </Button>
{/if}
