<script lang="ts">
  import MusicProviderComp from "./musicProvider.svelte";
  import type {MusicProvider} from "./types";

  const { items }: { items: Array<MusicProvider> } = $props();
</script>

<div class="grid grid-cols-3 gap-1">
{#each items as provider}
  <MusicProviderComp provider={provider.provider} className="bg-blue-400 rounded-full p-2" />
{/each}
</div>