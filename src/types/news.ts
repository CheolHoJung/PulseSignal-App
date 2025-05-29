export interface NewsArticle {
  ID: string;
  Title: string;
  AISummary: string;
  AIReportMarkdown?: string; // Optional field for markdown support
  Source: string;
  URL: string;
  CollectedAt: string;
}

export interface NewsApiResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}
