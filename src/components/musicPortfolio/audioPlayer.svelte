<script>
  import { onMount } from "svelte";

  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "@/components/ui-svelte/card";
  import { Button } from "@/components/ui-svelte/button";
  import {Slider} from "@/components/ui-svelte/slider";

  // import { X, Play, Pause, Volume2, Volume1, VolumeX, Rewind, FastForward } from "@lucide/svelte";
  import X from "@lucide/svelte/icons/x";
  import Play from "@lucide/svelte/icons/play";
  import Pause from "@lucide/svelte/icons/pause";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import Volume1 from "@lucide/svelte/icons/volume-1";
  import VolumeX from "@lucide/svelte/icons/volume-x";
  import Rewind from "@lucide/svelte/icons/rewind";
  import FastForward from "@lucide/svelte/icons/fast-forward";

  /**
   * @type {{ src: string; title: string, seekAmount?: number, close: () => void }}
   */
  const { src, title, seekAmount = 10, close } = $props();

  let isPlaying = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let volume = $state(1);
  let isMuted = $state(false);

  /** @type {HTMLAudioElement} */
  let audio = $state(null);

  function togglePlayPause() {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    isPlaying = !isPlaying;
  }

  /**
   * @param {number[]} value
   */
  function handleVolumeChange(value) {
    volume = value[0];
    if (volume === 0) {
      isMuted = true;
    } else {
      isMuted = false;
    }
  }

  /**
   * @param {number[]} value
   */
  function handleSeek(value) {
    audio.currentTime = value[0];
  }

  function seekBackward() {
    audio.currentTime = Math.max(0, audio.currentTime - seekAmount);
  }

  function seekForward() {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + seekAmount);
  }

  /**
   * @param {number} time
   */
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  onMount(() => {
    if (!audio) {
      console.warn("Audio element not found");
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    audio.addEventListener(
      "timeupdate",
      () => (currentTime = audio.currentTime),
      { signal },
    );
    audio.addEventListener(
      "durationchange",
      () => (duration = audio.duration),
      { signal },
    );
    audio.addEventListener(
      "loadedmetadata",
      () => (duration = audio.duration),
      { signal },
    );
    audio.addEventListener("ended", () => (isPlaying = false), { signal });

    return () => {
      abortController.abort();
    };
  });

  $effect(() => {
    // audio.volume = isMuted ? 0 : volume;
    audio.volume = volume;
    audio.muted = isMuted;
  });
  
  $effect(() => {
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  });
</script>

<Card class="w-full max-w-md">
  <CardHeader class="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
    <CardTitle class="text-base font-medium truncate pr-2">{title}</CardTitle>
    <Button variant="ghost" size="icon" on:click={() => close()} class="h-8 w-8">
      <X class="h-4 w-4" />
      <span class="sr-only">Close</span>
    </Button>
  </CardHeader>
  <CardContent class="px-4 pb-4 pt-0">
    <audio bind:this={audio} {src}></audio>

    <div class="space-y-4">
      <div
        class="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <Slider
        value={[currentTime]}
        max={duration || 100}
        step={0.1}
        onValueChange={handleSeek}
        class="w-full"
      />

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={()=>{isMuted=!isMuted}}
            class="h-8 w-8"
          >
            {#if isMuted}
              <VolumeX class="h-4 w-4" />
            {:else if volume < 0.5}
              <Volume1 class="h-4 w-4" />
            {:else}
              <Volume2 class="h-4 w-4" />
            {/if}
            <span class="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            class="w-20"
          />
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={seekBackward}
            class="h-9 w-9"
          >
            <Rewind class="h-5 w-5" />
            <span class="sr-only">Rewind 10 seconds</span>
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            class="h-10 w-10 rounded-full"
          >
            {#if isPlaying}
              <Pause class="h-5 w-5" />
            {:else}
              <Play class="h-5 w-5 ml-0.5" />
            {/if}
            <span class="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={seekForward}
            class="h-9 w-9"
          >
            <FastForward class="h-5 w-5" />
            <span class="sr-only">Forward 10 seconds</span>
          </Button>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
