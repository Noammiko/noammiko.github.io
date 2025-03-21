<script lang="ts">
  import Modal from "./Modal.svelte";

  const {
    text = "",
    aria_label,
    closeMessage = "hide",
    classNames,
    id,
    header,
    children,
  }: {
    text?: string;
    aria_label?: string;
    closeMessage?: string;
    classNames?: string;
    id?: string;
    header?: () => any;
    children?: () => any;
  } = $props();

  let showModal = $state(false);
</script>

<button
  onclick={() => (showModal = true)}
  aria-label={aria_label}
  class={classNames}
>
  {text}
</button>

<Modal bind:showModal {closeMessage} {children} {header} {id} />
