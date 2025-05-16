<script lang="ts">
  import * as sanitizeHtml from "sanitize-html";

  const { text }: { text: string } = $props();

  function formatText(text: string) {
    const underline = /__(.+)__/g;
    const bold = /\*\*(.+)\*\*/g;
    const note = /\*(.+)\*/g;
    text = text.replaceAll(
      underline,
      '<u class="text-red-400 underline">$1</u>',
    );
    text = text.replaceAll(bold, '<b class="text-green-400 font-bold">$1</b>');
    text = text.replaceAll(
      note,
      '<b class="text-sm italic text-gray-400 mt-1 ml-1">$1</b>',
    );
    text = text
      .split("\\n")
      .map((c) => c.trim())
      .join("<br/>");
    return text;
  }

  // TODO: sanitize html
  const renderedHtml = formatText(text);
</script>

<span>{@html renderedHtml}</span>
