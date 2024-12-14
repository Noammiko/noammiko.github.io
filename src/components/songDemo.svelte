<script lang="ts">
  import { storable } from "@/lib/storable.svelte";
  import Modal from "./Modal.svelte";
  import { onMount } from "svelte";
  import "iconify-icon";

  interface Provider {
    name: string;
    icon: string;
    color: string;
  }
  const providers: { [key: string]: Provider } = {
    spotify: { name: "Spotify", icon: "fa-brands:spotify", color: "#1db954" },
    apple: {
      name: "Apple Music",
      icon: "simple-icons:applemusic",
      color: "#000",
    },
    youtube: { name: "YouTube", icon: "fa-brands:youtube", color: "#ff0000" },
    deezer: { name: "Deezer", icon: "fa-brands:deezer", color: "#00c9ff" },
    // tidal: { name: "Tidal", icon: "fa-brands:tidal", color: "#ff8800" },
  } as const;

  const provider = storable<keyof typeof providers>("musicProvider", "spotify");
  let showProviders = $state(false);

  let loaded = $state(false);
  onMount(() => {
    loaded = true;
  });
</script>

<div class="h-full flex gap-2">
  <div
    class=" bg-red-700 grow rounded place-content-center flex gap-3 items-center"
  >
    {#if loaded}
      <iconify-icon icon={providers[$provider].icon} class="text-3xl"
      ></iconify-icon>
      <span>{providers[$provider].name}</span>
    {:else}
      loading...
    {/if}
  </div>
  <button
    class="w-8 bg-red-700 rounded content-center"
    onclick={() => (showProviders = true)}
  >
    <span class="[writing-mode:vertical-lr] [text-orientation:mixed]"
      >providers</span
    >
  </button>
</div>

<Modal bind:showModal={showProviders} closeMessage="hide">
  {#snippet header()}
    <h2 class="text-white">Select a Music Provider</h2>
  {/snippet}
  <div class="flex flex-col gap-2">
    {#each Object.entries(providers) as [key, value]}
      <button
        class="w-full bg-red-600 rounded content-center flex justify-center items-center gap-1"
        onclick={() => {
          provider.set(key as keyof typeof providers);
          showProviders = false;
        }}
        ><iconify-icon icon={value.icon}></iconify-icon><span>{value.name}</span
        ></button
      >
    {/each}
  </div>
</Modal>
