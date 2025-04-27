<script lang="ts">
  import "iconify-icon";
  import Spinner from "./SpinnerRect.svelte";

  interface Link {
    href?: string;
    type: keyof typeof brands;
    ariaLabel?: string;
  }

  let { links }: { links: Link[] } = $props();

  const brands = {
    apple: { icon: "simple-icons:applemusic", ariaLabel: "Apple Music" },
    deezer: { icon: "fa-brands:deezer", ariaLabel: "Deezer" },
    instagram: { icon: "fa-brands:instagram", ariaLabel: "Instagram" },
    spotify: { icon: "fa-brands:spotify", ariaLabel: "Spotify" },
    tiktok: { icon: "fa-brands:tiktok", ariaLabel: "TikTok" },
    youtube: { icon: "fa-brands:youtube", ariaLabel: "YouTube" },
    location: {icon:"tabler:map-share", ariaLabel: "Location"},
  } as const;
</script>

<Spinner
  revolutionTimeSeconds={3}
  lineWidth={5}
  lineLength={25}
  cornerRadius={6}
  showPath={false}
  classNames="bg-inherit p-5 rounded-md w-full flex justify-between text-white text-4xl"
  height={76}
  lineColour="rgb(69 10 10)"
>
  {#each links as value}
    {#if value.href}
      <a
        href={value.href}
        aria-label={value.ariaLabel ?? brands[value.type].ariaLabel}
      >
        <iconify-icon class="align-middle" inline={true} icon={brands[value.type].icon}></iconify-icon>
      </a>
    {:else}
      <span
        aria-disabled="true"
        role="button"
        aria-label={value.ariaLabel ?? brands[value.type].ariaLabel}
        class="pointer-events-none"
      >
        <iconify-icon class="text-white/30 align-middle" inline={true} icon={brands[value.type].icon}
        ></iconify-icon>
      </span>
    {/if}
  {/each}
</Spinner>
