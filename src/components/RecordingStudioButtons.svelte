<script lang="ts">
  import Modal from "./Modal.svelte";

  let showBundleModal = $state(false);
</script>

<div class="grid grid-cols-2 gap-4 p-2 md:max-w-96 md:justify-self-center">
  <button
    onclick={() => (showBundleModal = true)}
    aria-label="Current Prices"
    class="h-28 min-w-32 bg-black/40 border-red-950 border-4 rounded-xl place-content-center"
  >
    Current Prices
  </button>
  <a
    href="mailto:Noamtoven@gmail.com?subject=Studio%20session%20booking%20request"
    aria-label="Book session"
    class="h-28 min-w-32 bg-black/40 border-red-950 border-4 rounded-xl place-content-center"
  >
    Book session
  </a>
  <a
    href="https://www.dropbox.com/scl/fo/ax0yrpp4165iir4knepsc/ANeBbvSW7TndxePfg5WMwt8?rlkey=bth1wuyms1trg2it5eah3t26u&e=1&st=qu9wz6so&dl=0"
    aria-label="Portfolio"
    target="_blank"
    class="h-28 min-w-32 bg-black/40 border-red-950 border-4 rounded-xl place-content-center"
  >
    Portfolio
  </a>
  <a
    href="/gallery"
    aria-label="Gallary"
    class="h-28 min-w-32 bg-black/40 border-red-950 border-4 rounded-xl place-content-center"
  >
    Gallary
  </a>
</div>

<Modal bind:showModal={showBundleModal} closeMessage="hide">
  {#snippet header()}
    <h2 class="text-white text-2xl">Rates And Bundles</h2>
  {/snippet}
  <div class="text-white">
    <div>
      <b class="text-xl">1 SONG BUNDLE</b>
      <p>$119.50</p>
      <p>Includes 2 hours of studio time + Pro Mix + Pro master ($150 value)</p>
    </div>
    <br />

    <div>
      <b class="text-xl">2 SONGS BUNDLE</b>
      <p>$199.50</p>
      <p>
        Includes 3 hours of studio time + 2 Pro mix’s + 2 Pro masters ($270
        value)
      </p>
    </div>
    <br />

    <div>
      <b class="text-xl">Current rates</b>

      <p>$29.95 hourly recording rate</p>
      <p>$60 Professional Mix</p>
      <p>$30 Professional Master</p>
    </div>
    <br />

    <div>
      <b class="text-xl">Mix and master combo discount</b>
      <p>$75 includes Mix and master ($90 value)</p>

      <b class="text-xl">Instrumentals/Beats</b>
      <p>$50 for an existing beat</p>

      <p>$100 for custom beat</p>

      <p>Exclusive prices are negotiable</p>
    </div>
  </div>
</Modal>
