<script>
  let {
    showModal = $bindable(),
    header,
    children,
    closeMessage = "close modal",
  } = $props();

  let dialog = $state(); // HTMLDialogElement

  $effect(() => {
    if (showModal) dialog.showModal();
    else dialog.close();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  class="p-0 rounded-sm max-w-[32em] bg-black/70 shadow-2xl"
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) showModal = false;
  }}
>
  <div class="p-2">
    {@render header?.()}
    <hr class="my-2"/>
    {@render children?.()}
    <hr class="my-2" />
    <!-- svelte-ignore a11y_autofocus -->
    <button
      class="block justify-self-end bg-red-200 rounded-sm py-0.5 px-1.5"
      autofocus
      onclick={() => (showModal = false)}>{closeMessage}</button
    >
  </div>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
