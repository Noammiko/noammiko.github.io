<script lang="ts">
  import "iconify-icon";
  import brands, { type AvailableIcons } from "../../lib/icons";
  import { cn } from "../../lib/utils";
  import { lookupBrand } from "./music";

  const {
    provider,
    className = "",
  }: { provider: AvailableIcons; className?: string } =
    $props();

  let providing = $derived(lookupBrand(provider));
</script>

<span class={cn("flex gap-1", className)}>
  <iconify-icon icon={providing.icon} class="text-2xl"></iconify-icon>
  <span>{providing.label}</span>
</span>
