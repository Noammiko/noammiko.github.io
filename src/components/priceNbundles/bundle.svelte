<script lang="ts">
  import { Button } from "@/components/ui-svelte/button";
  import { Badge } from "@/components/ui-svelte/badge";
  import type { Deal } from "./types";
  const { deal, glow }: { deal: Deal; glow: boolean } = $props();

  function formatText(text: string) {
    const underline = /__(.+)__/g;
    const bold = /\*\*(.+)\*\*/g;
    text = text.replace(underline, '<u class="text-red-400 underline">$1</u>');
    text = text.replace(bold, '<b class="text-green-400 font-bold">$1</b>');
    return text;
  }
</script>

<div
  class="bg-black/30 backdrop-blur-sm p-6 rounded-lg group transition relative {glow
    ? 'border-2 border-red-500/50 hover:border-red-500/90 transform scale-105 shadow-lg shadow-red-900/50'
    : 'border border-red-500/30 hover:border-red-500/70'}"
>
  {#if deal.tag}
    <Badge
      class="absolute -top-3 right-4 bg-red-500 group-hover:bg-primary/80 uppercase rounded-md"
      >{deal.tag}</Badge
    >
  {/if}

  <h2 class="text-3xl font-bold text-center mb-2">{deal.name}</h2>
  <div class="flex flex-col items-center gap-2 mb-4 relative">
    <span class="text-3xl font-bold text-green-400">${deal.price}</span>
    {#if deal.valuePrice}
      <span class="text-xl text-yellow-400">
        (${deal.valuePrice} Value) {#if deal.discountTag}<span
            class="bg-red-600 text-white text-[12px] font-bold px-2 py-1 rounded-full"
            >{deal.discountTag}% OFF</span
          >{/if}
      </span>
    {/if}
  </div>

  <h3 class="text-2xl text-center mb-4 underline">Includes</h3>

  <ul class="space-y-3 list-disc list-inside marker:text-red-400">
    {#each deal.includes as included}
      <li>
        <span class="relative left-[-8px]">{@html formatText(included)}</span>
      </li>
    {/each}
  </ul>
  <div class="mt-6">
    <a href="#book-session">
      <Button class="w-full bg-red-600 hover:bg-red-700">Book Now</Button>
    </a>
  </div>
</div>

<!--
<div
  class="bg-black/30 backdrop-blur-sm p-6 rounded-lg group border border-red-500/30 hover:border-red-500/70 transition relative"
>
</div>

<div
  class="bg-black/30 backdrop-blur-sm p-6 rounded-lg border-2 group border-red-500/50 hover:border-red-500/90 transition transform scale-105 shadow-lg shadow-red-900/50 relative"
>
  <h2 class="text-3xl font-bold text-center mb-2">2 Songs Bundle</h2>
  <div class="flex flex-col items-center gap-2 mb-4 relative">
    <span class="text-3xl font-bold text-green-400">$199.95</span>
    <span class="text-xl text-yellow-400">
      ($360 Value) <span
        class="bg-red-600 text-white text-[12px] font-bold px-2 py-1 rounded-full"
        >45% OFF</span
      >
    </span>
  </div>
  <h3 class="text-2xl text-center mb-4 underline">Includes</h3>
  <ul class="space-y-3">
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>4 hours of studio time</span>
    </li>
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>2 Professional Mixes</span>
    </li>
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>2 Professional Masters</span>
    </li>
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>
        <>Unlimited</span> Mix & Master Revisions
      </span>
    </li>
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>
        <span class="">Bonus: 2</span>
        <span class="">FREE</span> Short Music Video s for
        IG & TikTok (Optional)
      </span>
    </li>
  </ul>
  <div class="mt-6">
    <a href="#book-session">
      <Button className="w-full bg-red-600 hover:bg-red-700">Book Now</Button>
    </a>
  </div>
</div>

<div
  class="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-red-500/30 hover:border-red-500/70 transition"
>
  <h2 class="text-3xl font-bold text-center mb-2">Mix & Master Bundle</h2>
  <div class="flex justify-center items-baseline gap-2 mb-4">
    <span class="text-3xl font-bold text-green-400">$74.95</span>
    <span class="text-xl text-yellow-400">($90 Value)</span>
  </div>
  <h3 class="text-2xl text-center mb-4 underline">Includes</h3>
  <ul class="space-y-3">
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>1 Professional Mix</span>
    </li>
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>1 Professional Master</span>
    </li>
    <li class="flex items-start">
      <span class="text-red-400 mr-2">•</span>
      <span>
        <span class="text-red-400 underline">Unlimited</span> Mix & Master Revisions
      </span>
    </li>
  </ul>
  <div class="mt-6">
    <a href="#book-session">
      <Button className="w-full bg-red-600 hover:bg-red-700">Book Now</Button>
    </a>
  </div>
</div> -->

<style>
</style>
