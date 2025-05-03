<script lang="ts">
  import { getSelectedProvider, handleOpenLink, provider } from "./music";
  import MusicProviderComp from "./musicProvider.svelte";
  import type { MusicProvider } from "./types";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";

  import Button from "../ui-svelte/button/button.svelte";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";

  let emblaApi: EmblaCarouselType;
  let options: EmblaOptionsType = {
    dragFree: true,
  };

  const {
    items,
    webOnly = false,
  }: { items: Array<MusicProvider>; webOnly?: boolean } = $props();

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
    handleOpenLink({
      track: currentProvider,
      preferredPlatform: webOnly ? "web" : "auto",
    });
  }

  let canScrollNext = $state(false);
  let canScrollPrev = $state(false);
  function loadEmbla(detail: CustomEvent<EmblaCarouselType>) {
    emblaApi = detail.detail;
    canScrollPrev= emblaApi.canScrollPrev()
    canScrollNext= emblaApi.canScrollNext()

    emblaApi.on("scroll", (event) => {
      canScrollNext = event.canScrollNext();
      canScrollPrev = event.canScrollPrev();
    });
  }
</script>

{#if items.length > 0}
  <!-- embla -->
  <div class="relative overflow-hidden">
    <Button
      class="z-10 absolute left-0 top-1/2 -translate-y-1/2 {canScrollPrev
        ? ''
        : 'pointer-events-none'}"
      variant="secondary"
      disabled={!canScrollPrev}
      onclick={() => emblaApi.scrollPrev()}><ChevronLeft /></Button
    >

    <!-- embla viewport -->
    <!-- @ts-ignore -->
    <div
      use:emblaCarouselSvelte={{ options } as any}
      onemblaInit={loadEmbla}
      class="mx-4 rounded-full overflow-hidden"
    >
      <!-- embla container -->
      <div class="flex gap-1 -z-10 mx-11">
        {#each filteredItems as item (item.provider)}
          <!-- embla slide -->
          <div
            class="flex-shirnk-0 h-full"
            in:fly={{ y: 150, duration: 170, delay: 30 }}
            animate:flip={{ duration: 200, delay: 0 }}
          >
            <Button
              href={item.url}
              target="_blank"
              variant="outline"
              size="sm"
              class="whitespace-nowrap mt-1"
              onclick={(e) => {
                e.preventDefault();
                handleClick(item);
              }}
            >
              <MusicProviderComp
                provider={item.provider as any}
                className="items-center"
              />
            </Button>
          </div>
        {/each}
      </div>
    </div>
    <Button
      class="z-10 absolute right-0 top-1/2 -translate-y-1/2 {canScrollNext
        ? ''
        : 'pointer-events-none'}"
      variant="secondary"
      onclick={() => emblaApi.scrollNext()}
      disabled={!canScrollNext}><ChevronRight /></Button
    >
  </div>
{/if}
