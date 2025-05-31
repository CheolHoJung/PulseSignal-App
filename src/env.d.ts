declare module 'vue3-markdown-it';
declare module 'markdown-it-mermaid';
declare module '@kangc/v-md-editor';
declare module '@kangc/v-md-editor/lib/theme/github.js';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

interface Window {
  mermaid: {
    init: (config: unknown, nodes: NodeListOf<Element>) => void;
    initialize: (config: { theme: string }) => void;
    // 필요시 mermaid.render 등 추가 선언 가능
  };
}
