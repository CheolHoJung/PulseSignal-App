<template>
  <component
    :is="engineComponent"
    :source="cleanMarkdown(props.source)"
    :dark="darkValue"
    class="markdown-viewer-root"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MarkdownViewerProps } from './types';
import MarkdownViewerMarkdownIt from './MarkdownViewerMarkdownIt.vue';
import MarkdownViewerVmd from './MarkdownViewerVmd.vue';

const props = defineProps<MarkdownViewerProps & { engine?: 'markdown-it' | 'vmd' }>();

const engineComponent = computed(() => {
  if (props.engine === 'vmd') {
    return MarkdownViewerVmd;
  }
  return MarkdownViewerMarkdownIt;
});

// dark prop이 undefined일 수 있으므로, boolean으로 변환
const darkValue = computed(() => props.dark === true);

const cleanMarkdown = (src: string): string => {
  if (!src) return '';
  let result = src.trim();
  if (result.startsWith('```') && result.endsWith('```')) {
    result = result
      .replace(/^```[a-zA-Z0-9]*[\r\n]?/, '')
      .replace(/```$/, '')
      .trim();
  }
  return result;
};
</script>

<style scoped>
.markdown-viewer-root {
  width: 100%;
}
</style>
