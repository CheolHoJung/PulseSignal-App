<template>
  <q-page>
    <template v-if="props.searchKeyword">
      <div v-if="searchLoading">검색 중...</div>
      <div v-else-if="searchError">{{ searchError }}</div>
      <div v-else-if="searchResult.length > 0">
        <q-list>
          <q-item
            v-for="article in searchResult"
            :key="article.ID || article.URL"
            clickable
            @click="goToDetail(article.ID)"
          >
            <q-item-section>
              <q-item-label>{{ article.Title }}</q-item-label>
              <q-item-label caption>
                <q-icon name="apartment" />{{ article.Source }} <q-icon name="event" />{{ formatDisplayDate(article.CollectedAt) }}
              </q-item-label>
              <q-item-label>
                <template v-if="article.AISummary">
                  <div>
                    <span>[핵심 요약]</span>
                    <div>{{ getSummaryParts(article.AISummary, article.AIReportMarkdown).core }}</div>
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
        <div v-if="searchTotal > searchLimit">
          <q-pagination
            v-model="searchPage"
            :max="Math.ceil(searchTotal / searchLimit)"
            :max-pages="7"
            direction-links
            @update:model-value="fetchSearchResult"
          />
        </div>
      </div>
      <div v-else>검색 결과가 없습니다.</div>
    </template>
    <template v-else>
      <!-- 기존 뉴스 목록 렌더링 -->
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
              <q-item-label>{{ article.Title }}</q-item-label>
              <q-item-label caption>
                <q-icon name="apartment" />{{ article.Source }} <q-icon name="event" />{{ formatDisplayDate(article.CollectedAt) }}
              </q-item-label>
              <q-item-label>
                <template v-if="article.AISummary">
                  <div>
                    <span>[핵심 요약]</span>
                    <div>{{ getSummaryParts(article.AISummary, article.AIReportMarkdown).core }}</div>
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
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from 'src/services/api';
import type { NewsArticle } from 'src/types/news';
import { marked } from 'marked';

const props = defineProps<{ searchKeyword?: string }>();

const newsList = ref<NewsArticle[]>([]);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

const currentPage = ref<number>(1);
const rowsPerPage = ref<number>(15);
const totalNewsCount = ref<number>(0);
const totalPages = computed(() => Math.ceil(totalNewsCount.value / rowsPerPage.value));

const searchResult = ref<NewsArticle[]>([]);
const searchLoading = ref(false);
const searchError = ref<string | null>(null);
const searchTotal = ref(0);
const searchPage = ref(1);
const searchLimit = ref(15);

const route = useRoute();
const router = useRouter();

async function fetchNewsData(pageToFetch: number) {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.getNews(pageToFetch, rowsPerPage.value);
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
}

async function fetchSearchResult(page = 1) {
  if (!props.searchKeyword) {
    searchLoading.value = false;
    searchError.value = null;
    searchResult.value = [];
    searchTotal.value = 0;
    return;
  }
  searchLoading.value = true;
  searchError.value = null;
  try {
    const response = await api.searchNews(props.searchKeyword, page, searchLimit.value);
    // null 또는 undefined 방지: articles가 배열이 아니면 빈 배열로 처리
    searchResult.value = Array.isArray(response.articles) ? response.articles.filter(Boolean) : [];
    searchTotal.value = typeof response.total === 'number' ? response.total : 0;
    searchPage.value = typeof response.page === 'number' ? response.page : 1;
  } catch (err) {
    const errorObj = err as { message?: string };
    searchError.value = errorObj.message || '검색 중 오류가 발생했습니다.';
    searchResult.value = [];
    searchTotal.value = 0;
  } finally {
    searchLoading.value = false;
  }
}

function onPageChange(newPage: number) {
  if (props.searchKeyword) {
    fetchSearchResult(newPage);
  } else {
    void fetchNewsData(newPage);
  }
}

onMounted(() => {
  if (props.searchKeyword) {
    fetchSearchResult(1);
  } else {
    void fetchNewsData(currentPage.value);
  }
});

watch(() => props.searchKeyword, (val) => {
  if (val) {
    fetchSearchResult(1);
  }
});

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
  let coreSummary = '';
  try {
    if (typeof DOMParser !== 'undefined' && DOMParser) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(summaryXml, 'text/xml');
      coreSummary = xmlDoc.getElementsByTagName('core_summary')[0]?.textContent?.trim() || '';
    }
  } catch {
    const m = summaryXml.match(/<core_summary>([\s\S]*?)<\/core_summary>/i);
    if (m && typeof m[1] === 'string') coreSummary = m[1].trim();
  }
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

function goToDetail(id: string) {
  const articleObj = newsList.value.find((a) => String(a.ID) === String(id));
  if (id && articleObj) {
    // Proxy가 아닌 순수 객체로 변환
    const plainArticle = JSON.parse(JSON.stringify(articleObj));
    void router.push({ path: `/news/${id}`, state: { article: plainArticle } });
  }
};
</script>

<style scoped></style>
