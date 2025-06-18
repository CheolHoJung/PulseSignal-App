<template>
  <q-page>
    <div v-if="isLoading">
      <div v-for="n in 5" :key="n">
        <q-card>
          <q-item>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
              <q-skeleton type="QRange" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>
    <div v-else-if="error">
      <q-banner>
        <template v-slot:avatar>
          <q-icon name="error_outline" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn label="Retry" @click="fetchNewsData(1)" />
        </template>
      </q-banner>
    </div>
    <div v-else-if="newsList.length > 0">
      <q-list>
        <q-item
          v-for="article in newsList"
          :key="article.ID || article.URL"
          clickable
          @click="goToDetail(article.ID)"
        >
          <q-item-section>
            <q-item-label>
              {{ article.Title }}
            </q-item-label>
            <q-item-label caption>
              <q-icon name="apartment" />{{ article.Source }} <q-icon name="event" />{{
                formatDisplayDate(article.CollectedAt)
              }}
            </q-item-label>
            <q-item-label>
              <template v-if="article.AISummary">
                <div>
                  <span>[핵심 요약]</span>
                  <div>
                    {{ getSummaryParts(article.AISummary, article.AIReportMarkdown).core }}
                  </div>
                </div>
              </template>
              <template v-else> AI 요약이 아직 준비되지 않았습니다. </template>
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-icon name="open_in_new" />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-if="totalPages > 1">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          direction-links
          @update:model-value="onPageChange"
        />
      </div>
    </div>
    <q-card v-else>
      <q-icon name="upcoming" />
      <div>No news to display.</div>
      <q-btn label="Refresh" @click="fetchNewsData(1)" />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Dark } from 'quasar';
import api from 'src/services/api';
import type { NewsArticle } from 'src/types/news';
import { useRouter } from 'vue-router';
import { marked } from 'marked';

const newsList = ref<NewsArticle[]>([]);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

const currentPage = ref<number>(1);
const rowsPerPage = ref<number>(15);
const totalNewsCount = ref<number>(0);

const totalPages = computed(() => {
  return Math.ceil(totalNewsCount.value / rowsPerPage.value);
});

const router = useRouter();

const isDark = computed(() => Dark.isActive);

const fetchNewsData = async (pageToFetch: number) => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.getNews(pageToFetch, rowsPerPage.value);
    // Just assign as is, do not touch AIReportMarkdown
    newsList.value = response.articles;
    totalNewsCount.value = response.total;
    currentPage.value = response.page;
  } catch (err) {
    const errorObj = err as { message?: string };
    error.value = errorObj.message || 'An unknown error occurred.';
    newsList.value = [];
    totalNewsCount.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const onPageChange = (newPage: number) => {
  void fetchNewsData(newPage);
};

const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return (
    date.toLocaleDateString('ko-KR', {
      // Using Korean locale for date display
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
};

function getSummaryParts(summaryXml: string, aiReportMarkdown?: string) {
  // If AIReportMarkdown exists, still use core_summary for preview in list
  let coreSummary = '';
  try {
    if (typeof DOMParser !== 'undefined' && DOMParser) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(summaryXml, 'text/xml');
      coreSummary = xmlDoc.getElementsByTagName('core_summary')[0]?.textContent?.trim() || '';
    }
  } catch {
    // fallback: try regex
    const m = summaryXml.match(/<core_summary>([\s\S]*?)<\/core_summary>/i);
    if (m && typeof m[1] === 'string') coreSummary = m[1].trim();
  }
  // Show only core_summary as preview in list
  return {
    core: coreSummary,
    rest: coreSummary ? `<div class='ai-summary-block'><div>${coreSummary}</div></div>` : '',
    full: aiReportMarkdown
      ? (() => {
          const mdRaw = aiReportMarkdown.trim();
          let md = mdRaw;
          if (md.startsWith('```markdown')) {
            md = md
              .replace(/^```markdown[\r\n]+/, '')
              .replace(/```\s*$/, '')
              .trim();
          }
          return marked(md);
        })()
      : `<pre style="white-space:pre-wrap;">${summaryXml}</pre>`,
  };
}

const goToDetail = (id: string) => {
  const articleObj = newsList.value.find((a) => String(a.ID) === String(id));
  if (id && articleObj) {
    // Proxy가 아닌 순수 객체로 변환
    const plainArticle = JSON.parse(JSON.stringify(articleObj));
    void router.push({ path: `/news/${id}`, state: { article: plainArticle } });
  }
};

onMounted(() => {
  void fetchNewsData(currentPage.value);
});
</script>

<style scoped></style>
