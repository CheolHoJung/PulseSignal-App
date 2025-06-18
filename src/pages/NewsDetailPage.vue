<template>
  <q-page>
    <q-btn class="notion-btn" icon="arrow_back" label="목록으로" @click="$router.back()" />
    <q-card v-if="article">
      <div>{{ article.Title }}</div>
      <div>
        <q-icon name="apartment" />{{ article.Source }} <q-icon name="event" />{{
          formatDisplayDate(article.CollectedAt)
        }}
        <q-btn
          class="notion-btn"
          icon="open_in_new"
          label="원문 보기"
          :href="article.URL"
          target="_blank"
        />
      </div>
      <q-separator />
      <MarkdownViewer
        v-if="article.AIReportMarkdown"
        :source="article.AIReportMarkdown"
        :dark="isDark"
        engine="markdown-it"
      />
      <div
        v-else-if="getSummaryParts(article.AISummary).rest"
        v-html="getSummaryParts(article.AISummary).rest"
      />
    </q-card>
    <q-card v-else>
      <q-icon name="error_outline" />
      <div>기사를 찾을 수 없습니다.</div>
      <q-btn class="notion-btn" label="목록으로" @click="$router.back()" />
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

<style scoped>
.notion-btn {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 18px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
  color: #222;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: none;
  transition: background 0.15s, border 0.15s;
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.notion-btn:hover {
  background: #f5f5f5;
  border-color: #ddd;
}
</style>

<!--
NOTE: If you see a postcss or vite error about 'Unknown word article.Title',
it is likely because there is a stray <style> tag (or <style> block) above the <template> in your .vue file, or a missing <template> root tag.
Make sure your <template> comes first, then <script>, then <style>.
Also, check for any accidental .vue file import in a .css or .scss file.
-->
