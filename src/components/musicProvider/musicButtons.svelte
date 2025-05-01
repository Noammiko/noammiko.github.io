<script lang="ts">
  import { getSelectedProvider, handleOpenLink, provider } from "./music";
  import MusicProviderComp from "./musicProvider.svelte";
  import type { MusicProvider } from "./types";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import type { EmblaOptionsType } from "embla-carousel";

  import Button from "../ui-svelte/button/button.svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";

  let emblaApi;
  let options: EmblaOptionsType = {
    dragFree: true,
  };

  function onInit(event) {
    emblaApi = event.detail;
    console.log(emblaApi.slideNodes()); // Access API
  }

  const { items }: { items: Array<MusicProvider> } = $props();

  const filteredItems = $derived(
    items.filter((item) => item.provider !== $provider),
  );

  function handleClick(selectedProvider: MusicProvider) {
    $provider = selectedProvider.provider;
    const currentProvider = getSelectedProvider(items);
    handleOpenLink(currentProvider.url, currentProvider.nativeUrl);
  }
</script>

{#if items.length > 0}
  <div
    class="overflow-hidden"
    use:emblaCarouselSvelte={{ options }}
    onemblaInit={onInit}
  >
    <div class="flex gap-1">
      {#each filteredItems as item (item.provider)}
        <div
          class="flex-shirnk-0"
          in:fly={{ y: 150, duration: 170, delay: 30 }}
          animate:flip={{ duration: 200, delay: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            class="whitespace-nowrap text-black bg-white align-center"
            onclick={() => handleClick(item)}
          >
            <MusicProviderComp
              provider={item.provider}
              className="items-center"
            />
          </Button>
        </div>
      {/each}
    </div>
  </div>
{/if}
