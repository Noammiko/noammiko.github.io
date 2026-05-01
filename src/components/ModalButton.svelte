<script lang="ts">
  import Modal from "./Modal.svelte";
  import Button from "./ui-svelte/button/button.svelte";
  import type {
    ButtonVariant,
    ButtonSize,
  } from "./ui-svelte/button/button.svelte";

  const {
    text = "",
    aria_label,
    closeMessage = "hide",
    classNames,
    id,
    header,
    children,
    variant,
    size,
    ...opts
  }: {
    text?: string;
    aria_label?: string;
    closeMessage?: string;
    classNames?: string;
    id?: string;
    header?: () => any;
    children?: () => any;
    variant?: ButtonVariant;
    size?: ButtonSize;
  } = $props();

  let showModal = $state(false);
</script>

<Button
  onclick={() => (showModal = true)}
  aria-label={aria_label}
  class={classNames}
  {...opts}
>
  {text}
</Button>

<Modal bind:showModal {closeMessage} {children} {header} {id} />
