<template>
  <div class="ai-summary-markdown" v-html="renderedHtml" />
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { MarkdownViewerProps } from './types';
import MarkdownIt from 'markdown-it';

const props = defineProps<MarkdownViewerProps>();
const renderedHtml = ref('');

async function renderMarkdown() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    renderedHtml.value = '';
    return;
  }
  const src = props.source || '';
  const hasMermaid = /```mermaid[\s\S]*?```/m.test(src);
  try {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    renderedHtml.value = md.render(src);
    await nextTick();
    if (hasMermaid && window.mermaid) {
      window.mermaid.initialize({ theme: props.dark ? 'dark' : 'default' });
      document.querySelectorAll('.ai-summary-markdown .language-mermaid').forEach((el) => {
        el.setAttribute('data-raw', el.textContent || '');
      });
      window.mermaid.init(
        undefined,
        document.querySelectorAll('.ai-summary-markdown .language-mermaid'),
      );
    }
    highlightDiffBlocks();
  } catch (err) {
    renderedHtml.value = '';
  }
}

function highlightDiffBlocks() {
  document.querySelectorAll('.ai-summary-markdown code.language-diff').forEach((block) => {
    const html = block.innerHTML
      .split('\n')
      .map((line) => {
        if (line.startsWith('+')) return `<span class="diff-add">${line}</span>`;
        if (line.startsWith('-')) return `<span class="diff-remove">${line}</span>`;
        if (line.startsWith('@') || line.startsWith('!'))
          return `<span class="diff-meta">${line}</span>`;
        return line;
      })
      .join('\n');
    block.innerHTML = html;
  });
}

watch(
  () => [props.source, props.dark],
  () => {
    void renderMarkdown();
  },
  { immediate: true },
);
</script>

<style scoped>
/* ...existing styles... */
</style>
