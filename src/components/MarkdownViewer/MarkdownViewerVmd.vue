<template>
  <div class="ai-summary-markdown">
    <v-md-editor v-if="cleanedSource" :model-value="cleanedSource" mode="preview" :theme="theme" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import VMdEditor from '@kangc/v-md-editor';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import type { MarkdownViewerProps } from './types';

// 테마 및 하이라이트 등록 (최초 1회만)
if (!(VMdEditor as any)._githubThemeRegistered) {
  VMdEditor.use(githubTheme, { Hljs: hljs });
  (VMdEditor as any)._githubThemeRegistered = true;
}

// highlight.js 언어 등록
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('json', json);

// 지원하지 않는 언어에 대한 fallback 설정
hljs.configure({
  languages: ['javascript', 'python', 'json'],
  ignoreUnescapedHTML: true,
});

// 언어가 없을 경우 기본 처리
hljs.getLanguage = (lang) => {
  if (!lang || !hljs.listLanguages().includes(lang)) {
    console.warn(`Unsupported language: ${lang}`);
    return undefined;
  }
  return hljs.getLanguage(lang);
};

const props = defineProps<MarkdownViewerProps>();
const theme = ref(githubTheme);

watch(
  () => props.dark,
  (val) => {
    theme.value = githubTheme; // 다크모드 확장 시 분기 가능
  },
  { immediate: true },
);

const cleanedSource = computed(() => {
  const content = props.source;
  // 코드 블록 언어 제거 또는 기본 언어로 설정
  return content.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match: string, lang: string, code: string) => {
      if (!hljs.getLanguage(lang)) {
        console.warn(`Unsupported language in code block: ${lang}`);
        return `\n\n${code}\n\n`;
      }
      return match;
    },
  );
});
</script>

<style scoped>
.ai-summary-markdown {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.98em;
  margin-top: 4px;
  line-height: 1.7;
  word-break: keep-all;
}
</style>
