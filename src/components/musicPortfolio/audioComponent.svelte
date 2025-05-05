<script lang="ts">
  import { playing } from "./utils.js";

  const song = $derived(
    $playing === null
      ? {
          file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          title: "test",
        }
      : $playing,
  );

  import AudioPlayer from "./audioPlayer.svelte";
</script>

<AudioPlayer
  title={song.title}
  src={song.file}
  close={() => ($playing = null)}
/>
