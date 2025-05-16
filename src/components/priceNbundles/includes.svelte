<script lang="ts">
  import { default as sanitizeHtml } from "sanitize-html";

  const { text }: { text: string } = $props();

  function formatText(text: string) {
    const underline = /__(.+)__/g;
    const bold = /\*\*(.+)\*\*/g;
    const note = /\*(.+)\*/g;
    text = text.replaceAll(underline, "<u>$1</u>");
    text = text.replaceAll(bold, "<b>$1</b>");
    text = text.replaceAll(note, "<span>$1</span>");
    text = text
      .split("\\n")
      .map((c) => c.trim())
      .join("<br/>");
    return text;
  }

  const renderedHtml = sanitizeHtml(formatText(text));
</script>

<div>{@html renderedHtml}</div>

<style>
  div :global {
    u {
      /* @apply text-red-400 underline; */
      color: var(--color-red-400);
      text-decoration-line: underline;
    }
    b {
      /* @apply font-bold text-green-400; */
      color: var(--color-green-400);
      font-weight: var(--font-weight-bold);
    }
    span {
      /* @apply mt-1 ml-1 text-sm text-gray-400 italic; */
      margin-top: calc(var(--spacing) * 1) /* 0.25rem = 4px */;
      margin-left: calc(var(--spacing) * 1) /* 0.25rem = 4px */;

      font-size: var(--text-sm) /* 0.875rem = 14px */;
      line-height: var(
        --tw-leading,
        var(--text-sm--line-height) /* calc(1.25 / 0.875) ≈ 1.4286 */
      );
      color: var(--color-gray-400);
      font-style: italic;
    }
  }
</style>
