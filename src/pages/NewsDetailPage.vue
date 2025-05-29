<template>
  <q-page padding>
    <q-btn flat icon="arrow_back" label="목록으로" @click="$router.back()" class="q-mb-md" />
    <q-card v-if="article" class="q-pa-lg">
      <div class="text-h5 text-weight-bold q-mb-sm">{{ article.Title }}</div>
      <div class="text-caption text-grey-7 q-mb-md flex items-center">
        <q-icon name="apartment" size="xs" class="q-mr-xs" />{{ article.Source }}
        <q-icon name="event" size="xs" class="q-ml-sm q-mr-xs" />{{
          formatDisplayDate(article.CollectedAt)
        }}
        <q-btn
          color="primary"
          icon="open_in_new"
          label="원문 보기"
          :href="article.URL"
          target="_blank"
          flat
          size="sm"
          class="q-ml-sm q-px-sm q-py-none"
          style="height: 24px; font-size: 0.92em"
        />
      </div>
      <q-separator spaced />
      <div v-if="article.AIReportMarkdown" class="ai-summary-markdown q-mb-md">
        <MarkdownIt v-if="markdownItOptions.md" :source="markdownText" :md="markdownItOptions.md" />
      </div>
      <div
        v-else-if="getSummaryParts(article.AISummary).rest"
        class="ai-summary-markdown q-mb-md"
        v-html="getSummaryParts(article.AISummary).rest"
      />
    </q-card>
    <q-card v-else flat class="q-pa-xl text-center text-grey-6 bg-grey-2 rounded-borders q-mt-lg">
      <q-icon name="error_outline" size="3em" />
      <div class="text-subtitle1 q-mt-sm">기사를 찾을 수 없습니다.</div>
      <q-btn label="목록으로" color="primary" @click="$router.back()" class="q-mt-md" unelevated />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from 'src/services/api';
import type { NewsArticle } from 'src/types/news';

import MarkdownItCore from 'markdown-it';
import { ref as vueRef } from 'vue';
import { defineAsyncComponent } from 'vue';
const MarkdownIt = defineAsyncComponent(() => import('vue3-markdown-it'));

const route = useRoute();
const router = useRouter();
const article = ref<NewsArticle | null>(null);

const markdownItOptions = vueRef<{ md: MarkdownItCore | null }>({ md: null });

function formatDisplayDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return (
    date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) +
    ' ' +
    date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

const markdownText = computed(() => {
  if (!article.value?.AIReportMarkdown) return '';
  const src = article.value.AIReportMarkdown.trim();
  // 코드펜스(\`\`\`...)로 감싸진 경우 첫 줄과 마지막 줄만 제거
  const lines = src.split(/\r?\n/);
  if (lines.length > 0 && lines[0]?.startsWith('```')) {
    lines.shift();
  }
  if (lines.length > 0 && lines[lines.length - 1]?.trim() === '```') {
    lines.pop();
  }
  return lines.join('\n').trim();
});

function getSummaryParts(summaryXml: string, aiReportMarkdown?: string) {
  if (aiReportMarkdown) {
    return {
      core: '',
      rest: `<div class='ai-summary-markdown'>${aiReportMarkdown.trim()}</div>`,
    };
  }
  return {
    core: '',
    rest: `<pre style="white-space:pre-wrap;">${summaryXml}</pre>`,
  };
}

// 타입 가드 함수 추가
function isArticleState(state: unknown): state is { article: NewsArticle } {
  return !!state && typeof state === 'object' && 'article' in state;
}

onMounted(async () => {
  // 1. 라우터 state로 article이 넘어온 경우 우선 사용
  const state = router.options.history.state;
  if (isArticleState(state)) {
    article.value = state.article;
  }

  // 머메이드 플러그인 import 및 등록 (브라우저에서만, await import + catch)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const { default: markdownItMermaid } = await import('markdown-it-mermaid');
      const md = new MarkdownItCore({
        html: true,
        linkify: true,
        typographer: true,
      });
      md.use(markdownItMermaid);
      markdownItOptions.value.md = md;
    } catch {
      // mermaid 로딩 실패 시에도 마크다운만 렌더링
      markdownItOptions.value.md = new MarkdownItCore();
    }
  }

  // 2. fallback: 기존 API에서 찾아오기
  if (!article.value) {
    const id = route.params.id;
    if (!id) return;
    try {
      const response = await api.getNews(1, 1000);
      article.value = response.articles.find((a) => String(a.ID) === String(id)) || null;
    } catch {
      article.value = null;
    }
  }
});
</script>

<style scoped lang="scss">
.ai-summary-markdown {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.98em;
  margin-top: 4px;
  line-height: 1.7;
  word-break: keep-all;
  // 배경색/글자색은 상위(q-card)에서 상속
}
</style>
