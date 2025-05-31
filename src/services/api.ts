import axios from 'axios';
import type { NewsApiResponse, NewsArticle } from 'src/types/news';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Backend API URL. Adjust if necessary.
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  async getNews(page = 1, limit = 15): Promise<NewsApiResponse> {
    try {
      // Backend must have a '/news' endpoint for this to work.
      const response = await apiClient.get<NewsApiResponse>(`/news?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch news list:', error);
      // Fallback: return fake data
      const fakeArticles = [
        {
          ID: 'fake-1',
          Title: '가짜 뉴스 제목 1',
          AISummary: `<summary_analysis><core_summary>이것은 가짜 뉴스의 핵심 요약입니다.</core_summary><opportunity_factors>기회 요인 예시입니다.</opportunity_factors><risk_factors>리스크 요인 예시입니다.</risk_factors><investment_opinion>투자 의견 예시입니다.</investment_opinion></summary_analysis>`,
          AIReportMarkdown: `# 가짜 뉴스 제목 1\n\n- **핵심 요약**: 이것은 가짜 뉴스의 핵심 요약입니다.\n- **기회 요인**: 기회 요인 예시입니다.\n- **리스크 요인**: 리스크 요인 예시입니다.\n- **투자 의견**: 투자 의견 예시입니다.`,
          Source: '가짜뉴스',
          URL: 'https://example.com/fake-news-1',
          CollectedAt: new Date().toISOString(),
        },
        {
          ID: 'fake-2',
          Title: '가짜 뉴스 제목 2',
          AISummary: `<summary_analysis><core_summary>두 번째 가짜 뉴스의 요약입니다.</core_summary><opportunity_factors>두 번째 기회 요인.</opportunity_factors><risk_factors>두 번째 리스크 요인.</risk_factors><investment_opinion>두 번째 투자 의견.</investment_opinion></summary_analysis>`,
          AIReportMarkdown: `# 가짜 뉴스 제목 2\n\n- **핵심 요약**: 두 번째 가짜 뉴스의 요약입니다.\n- **기회 요인**: 두 번째 기회 요인.\n- **리스크 요인**: 두 번째 리스크 요인.\n- **투자 의견**: 두 번째 투자 의견.`,
          Source: '가짜뉴스',
          URL: 'https://example.com/fake-news-2',
          CollectedAt: new Date().toISOString(),
        },
      ];
      return {
        articles: fakeArticles,
        total: fakeArticles.length,
        page: 1,
        limit,
      };
    }
  },
  async getNewsById(id: string): Promise<NewsArticle | null> {
    try {
      const response = await apiClient.get<NewsArticle>(`/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch news detail:', error);
      return null;
    }
  },
};
