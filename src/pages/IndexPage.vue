<template>
  <q-page padding>
    <div class="q-my-md">
      <div class="text-h4 q-mb-md">PulseSignal News</div>
    </div>

    <q-separator spaced />

    <div v-if="isLoading" class="row q-gutter-md justify-center q-mt-lg">
      <div v-for="n in 5" :key="n" class="col-12">
        <q-card flat bordered>
          <q-item>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" width="70%" animation="fade" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" width="30%" animation="fade" />
              </q-item-label>
              <q-skeleton type="QRange" height="60px" animation="fade" class="q-mt-sm" />
            </q-item-section>
          </q-item>
        </q-card>
      </div>
    </div>

    <q-banner
      v-else-if="error"
      inline-actions
      dense
      class="text-white bg-red q-my-md rounded-borders"
    >
      <template v-slot:avatar>
        <q-icon name="error_outline" />
      </template>
      {{ error }}
      <template v-slot:action>
        <q-btn flat dense color="white" label="Retry" @click="fetchNewsData(1)" />
      </template>
    </q-banner>

    <div v-else-if="newsList.length > 0">
      <q-list separator>
        <q-item
          v-for="article in newsList"
          :key="article.ID || article.URL"
          clickable
          v-ripple
          tag="div"
          @click="goToDetail(article.ID)"
          class="q-py-md list-item-hover"
        >
          <q-item-section>
            <q-item-label
              lines="1"
              class="text-weight-bold text-subtitle1"
              :class="isDark ? 'text-white' : ''"
            >
              {{ article.Title }}
            </q-item-label>
            <q-item-label
              caption
              class="q-mb-sm flex items-center"
              :class="isDark ? 'text-blue-3' : 'text-grey-7'"
            >
              <q-icon
                name="apartment"
                size="xs"
                class="q-mr-xs"
                :color="isDark ? 'blue-3' : 'grey-7'"
              />{{ article.Source }}
              <q-icon
                name="event"
                size="xs"
                class="q-ml-sm q-mr-xs"
                :color="isDark ? 'blue-3' : 'grey-7'"
              />{{ formatDisplayDate(article.CollectedAt) }}
            </q-item-label>
            <q-item-label
              class="text-body2 ai-summary-text"
              :class="isDark ? 'text-grey-5' : 'text-grey-8'"
            >
              <template v-if="article.AISummary">
                <div style="padding-left: 12px">
                  <span class="text-weight-bold">[핵심 요약]</span>
                  <div
                    class="ai-summary-text"
                    style="
                      white-space: pre-line;
                      display: inline-block;
                      vertical-align: middle;
                      max-width: 100%;
                    "
                  >
                    {{ getSummaryParts(article.AISummary, article.AIReportMarkdown).core }}
                  </div>
                </div>
              </template>
              <template v-else> AI 요약이 아직 준비되지 않았습니다. </template>
            </q-item-label>
          </q-item-section>
          <q-item-section side top class="q-ml-md">
            <q-icon name="open_in_new" :color="isDark ? 'blue-3' : 'primary'" />
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-pa-lg flex flex-center" v-if="totalPages > 1">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          direction-links
          flat
          :color="isDark ? 'grey-4' : 'primary'"
          :active-color="isDark ? 'blue-10' : 'primary'"
          :active-text-color="isDark ? 'white' : 'white'"
          @update:model-value="onPageChange"
        />
      </div>
    </div>

    <q-card v-else flat class="q-pa-xl text-center text-grey-6 bg-grey-2 rounded-borders q-mt-lg">
      <q-icon name="upcoming" size="3em" />
      <div class="text-subtitle1 q-mt-sm">No news to display.</div>
      <q-btn label="Refresh" color="primary" @click="fetchNewsData(1)" class="q-mt-md" unelevated />
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

<style lang="scss" scoped>
.ai-summary-markdown {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.98em;
  color: #222;
  margin-top: 4px;
  line-height: 1.7;
  word-break: keep-all;
}

.ai-summary-text {
  white-space: pre-line; // Renders \n as line breaks
  line-height: 1.6;
}

.list-item-hover:hover {
  background-color: $grey-2;
  color: inherit;
}

body.body--dark .list-item-hover:hover {
  background-color: #23272e !important;
  color: #fff !important;
}

.ai-summary-block {
  margin-bottom: 12px;
}
</style>
