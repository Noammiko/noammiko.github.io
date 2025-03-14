<script lang="ts">
  import Modal from "./Modal.svelte";

  let showModal = $state(false);
</script>

<button
  class="bg-red-700 rounded content-center border-red-600 border-2"
  onclick={() => (showModal = true)}
>
  Bundles and Deals
</button>

<Modal bind:showModal closeMessage="hide">
  {#snippet header()}
    <h2 class="text-white">Select a Music Provider</h2>
  {/snippet}
  <div class="text-white">
    <div>
      <b>1 SONG BUNDLE</b>
      <p>
        $119.50 Includes 2 hours of studio time + Pro Mix + Pro master ($150
        value)
      </p>
    </div>
    <br />

    <div>
      <b>2 SONGS BUNDLE</b>
      <p>
        $199.50 Includes 3 hours of studio time + 2 Pro mix’s + 2 Pro masters
        ($270 value)
      </p>
    </div>
    <br />

    <div>
      <b>Current rates</b>
      <p>$29.95 hourly recording rate</p>
      <p>$60 Professional Mix</p>
      <p>$30 Professional Master</p>
    </div>
    <br />

    <div>
      <b>Mix and master combo discount</b>
      <p>$75 includes Mix and master ($90 value)</p>

      <p>$50 for an existing beat</p>

      <p>$100 for custom beat</p>

      <p>Exclusive prices are negotiable</p>
    </div>
  </div>
</Modal>
