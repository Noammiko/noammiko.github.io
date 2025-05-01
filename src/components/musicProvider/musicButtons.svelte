<script lang="ts">
  import { getSelectedProvider, handleOpenLink, provider } from "./music";
  import MusicProviderComp from "./musicProvider.svelte";
  import type { MusicProvider } from "./types";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";

  import Button from "../ui-svelte/button/button.svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";

  let emblaApi: EmblaCarouselType;
  let options: EmblaOptionsType = {
    dragFree: true,
  };

  const { items }: { items: Array<MusicProvider> } = $props();

  const filteredItems = $derived(
    items.filter((item) => item.provider !== $provider),
  );

  function handleClick(selectedProvider: MusicProvider) {
    const last = $provider;
    $provider = selectedProvider.provider;

    setTimeout(() => {
      const idx = items
        .map((item) => item.provider)
        .filter((item) => item !== selectedProvider.provider)
        .indexOf(last);

      if (emblaApi.slidesInView().indexOf(idx) === -1) {
        emblaApi.scrollTo(idx);
      }
    }, 210);

    const currentProvider = getSelectedProvider(items);
    handleOpenLink(currentProvider.url, currentProvider.nativeUrl);
  }
</script>

{#if items.length > 0}
  <div
    class="overflow-hidden"
    use:emblaCarouselSvelte={{ options }}
    onemblaInit={(event) => (emblaApi = event.detail)}
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
