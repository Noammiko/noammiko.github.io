<script lang="ts">
  import {
    handleOpenLink,
    lookupBrand,
    provider,
    getSelectedProvider,
  } from "./music";
  import type { MusicProvider } from "./types";
  import Button from "@/components/ui-svelte/button/button.svelte";
  import { ExternalLink } from "@lucide/svelte";

  const {
    items,
    webOnly = false,
  }: { items: Array<MusicProvider>; webOnly?: boolean } = $props();

  let currentProvider = $derived(getSelectedProvider(items, $provider));
  const providerBrand = $derived(lookupBrand($provider));

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    handleOpenLink({
      track: currentProvider,
      preferredPlatform: webOnly ? "web" : "auto",
    });
  }
</script>

{#if !currentProvider}
  <Button class="w-full text-lg bg-red-400 pointer-events-none cursor-default">
    No provider selected
  </Button>
{:else}
  <Button
    href={currentProvider.url}
    target="_blank"
    onclick={handleClick}
    class="w-full gap-2 text-lg"
  >
    <iconify-icon icon={providerBrand.icon} class="sm:text-3xl text-2xl"
    ></iconify-icon>
    <div class="sm:grow flex items-center justify-center gap-1">
      Open in {providerBrand.label}
      <ExternalLink class="w-4 h-4 -mt-2" />
    </div>
  </Button>
{/if}
