import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  getNews(page: number, limit: number) {
    return apiClient.get(`/news?page=${page}&limit=${limit}`);
  },
};