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
      <MarkdownViewer
        v-if="article.AIReportMarkdown"
        :source="article.AIReportMarkdown"
        :dark="isDark"
        engine="markdown-it"
        class="q-mb-md"
      />
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
import { ref, onMounted, watchEffect } from 'vue';
import { Dark } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import api from 'src/services/api';
import type { NewsArticle } from 'src/types/news';
import MarkdownViewer from 'src/components/MarkdownViewer/MarkdownViewer.vue';

const route = useRoute();
const router = useRouter();
const article = ref<NewsArticle | null>(null);
const isDark = ref(Dark.isActive);

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

function isArticleState(state: unknown): state is { article: NewsArticle } {
  return !!state && typeof state === 'object' && 'article' in state;
}

onMounted(async () => {
  const state = router.options.history.state;
  if (isArticleState(state)) {
    article.value = state.article;
  }
  if (!article.value) {
    const id = route.params.id;
    if (!id) return;
    try {
      article.value = await api.getNewsById(String(id));
    } catch {
      article.value = null;
    }
  }
});

watchEffect(() => {
  isDark.value = Dark.isActive;
});
</script>

<style lang="scss">
.ai-summary-markdown {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.98em;
  margin-top: 4px;
  line-height: 1.7;
  word-break: keep-all;
}
</style>

<!--
NOTE: If you see a postcss or vite error about 'Unknown word article.Title',
it is likely because there is a stray <style> tag (or <style> block) above the <template> in your .vue file, or a missing <template> root tag.
Make sure your <template> comes first, then <script>, then <style>.
Also, check for any accidental .vue file import in a .css or .scss file.
-->
