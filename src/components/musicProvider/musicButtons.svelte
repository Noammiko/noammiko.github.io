<script lang="ts">
  import { getSelectedProvider, handleOpenLink,provider } from "./music";
  import MusicProviderComp from "./musicProvider.svelte";
  import type { MusicProvider, Platform } from "./types";

  import Button from "../ui-svelte/button/button.svelte";

  const { items }: { items: Array<MusicProvider> } = $props();

  function handleClick(selectedProvider: MusicProvider) {
    $provider = selectedProvider.provider;
    const currentProvider = getSelectedProvider(items)
    handleOpenLink(currentProvider.url, currentProvider.nativeUrl);
  }
</script>

{#if items.length > 0}
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <!-- forward button -->
      <div class="flex-1 overflow-hidden mx-2">
        <div class="overflow-x-auto py-2 flex gap-2 scrollbar-hide">
          {#each items as item}
            <Button
              variant="outline"
              size="sm"
              class="whitespace-nowrap flex-shrink-0 text-black bg-white align-center"
              onclick={() => handleClick(item)}
            >
              <MusicProviderComp provider={item.provider} className="items-center" />
            </Button>
          {/each}
        </div>
      </div>

      <!-- backward button -->
    </div>
  </div>
{/if}
