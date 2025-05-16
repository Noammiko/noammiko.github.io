<script lang="ts">
  import { Button } from "@/components/ui-svelte/button";

  const { current = 0, max = 5 } = $props();

  const progress = $derived(Math.max(0, Math.min(1, current / max)));
</script>

<div
  class="border-2 border-yellow-500/50 group hover:border-yellow-500/90 transition rounded-lg p-6 relative bg-gradient-to-b from-black to-gray-900"
>
  <div
    class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 group-hover:bg-yellow-500/90 text-black px-4 py-1 text-sm rounded font-bold"
  >
    LIMITED OFFER
  </div>
  <h3 class="text-2xl font-bold text-center mb-4">First-Time Tryout Session</h3>
  <p class="text-3xl font-bold text-center text-green-400 mb-2">FREE</p>
  <p class="text-sm text-center mb-4">(for new clients only)</p>
  <div class="bg-yellow-500/10 rounded-lg p-3 mb-6">
    <p class="text-center font-semibold text-yellow-500 mb-2">
      {current}/{max} spots left this week
    </p>
    <div class="w-full bg-gray-800 rounded-full h-2.5 mb-1">
      <div
        class="bg-yellow-500 h-2.5 rounded-full"
        style="width: {(progress * 100).toFixed(2)}%"
      ></div>
    </div>
    <div class="flex justify-between text-xs text-gray-400">
      <span>0</span>
      <span>5</span>
    </div>
  </div>

  <div
    class="italic text-gray-300 text-sm mb-6 border-l-2 border-yellow-500 pl-3"
  >
    <p>Come check out the studio and experience what I do best.</p>
    <p class="mt-2">
      I'm confident you'll be back, because I'm the engineer your music needs!
    </p>
  </div>

  <h4 class="text-xl font-bold text-center mb-4 underline">INCLUDES</h4>
  <ul class="space-y-2 mb-8">
    <li class="flex items-start">
      <span class="text-yellow-500 mr-2">•</span>
      <span>30 min of studio time</span>
    </li>
    <li class="flex items-start">
      <span class="text-yellow-500 mr-2">•</span>
      <span>30-second clip of your song</span>
    </li>
    <li class="flex items-start">
      <span class="text-yellow-500 mr-2">•</span>
      <span>Basic Studio Mix</span>
    </li>
  </ul>
  <Button
    class="w-full bg-yellow-500 text-black font-bold py-3 hover:bg-yellow-600 transition-colors"
    disabled={progress == 1}
  >
    Secure Your Spot
  </Button>
</div>
