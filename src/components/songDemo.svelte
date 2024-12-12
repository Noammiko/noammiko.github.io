<script lang="ts">
  import { storable } from "@/lib/storable.svelte";
  import Modal from "@/components/Modal.svelte";

  const providers = {
    spotify: "Spotify",
    apple: "Apple Music",
    youtube: "YouTube",
    deezer: "Deezer",
    // tidal: "Tidal",
  };

  const provider = storable("musicProvider", "spotify");
  let showProviders = $state(false);
</script>

<div class="h-full flex gap-2">
  <div class=" bg-gray-600 grow rounded">{providers[$provider]}</div> 
  <button
    class="w-8 bg-gray-600 rounded content-center"
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
        class="w-full bg-gray-600 rounded content-center"
        onclick={() => {
          provider.set(key);
          showProviders = false;
        }}>{value}</button
      >
    {/each}
  </div>
</Modal>
