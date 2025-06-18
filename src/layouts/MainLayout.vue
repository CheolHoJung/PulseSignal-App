<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="notion-header" elevated>
      <div class="notion-header-inner">
        <button class="sidebar-toggle-btn" @click="sidebarMini = !sidebarMini">
          <q-icon :name="sidebarMini ? 'chevron_right' : 'chevron_left'" />
        </button>
        <div class="notion-header-title">PulseSignal</div>
        <div class="profile-avatar">PS</div>
      </div>
    </q-header>
    <q-drawer
      class="notion-sidebar"
      show-if-above
      v-model="leftDrawerOpen"
      bordered
      :width="sidebarMini ? 48 : 220"
    >
      <div v-show="!sidebarMini">
        <div class="notion-sidebar-title">PulseSignal</div>
        <nav>
          <ul style="padding:0;margin:0;">
            <li style="list-style:none;width:100%;display:flex;justify-content:center;align-items:center;">
              <router-link to="/" style="display:flex;align-items:center;gap:8px;justify-content:center;width:100%;">
                <q-icon name="home" style="font-size:20px;vertical-align:middle;" />
                <span style="white-space:nowrap;">메인</span>
              </router-link>
            </li>
            <li style="list-style:none;width:100%;display:flex;justify-content:center;align-items:center;margin-top:16px;">
              <button class="sidebar-search-btn" @click="showSearch = !showSearch" style="display:flex;align-items:center;gap:8px;justify-content:center;width:100%;">
                <q-icon name="search" style="font-size:20px;vertical-align:middle;" />
                <span style="white-space:nowrap;">검색</span>
              </button>
            </li>
          </ul>
        </nav>
        <div v-if="showSearch" class="sidebar-search-box">
          <input
            v-model="searchKeyword"
            @keyup.enter="onSearch"
            type="text"
            placeholder="뉴스 검색..."
            class="sidebar-search-input"
          />
          <button class="sidebar-search-go" @click="onSearch">
            <q-icon name="arrow_forward" />
          </button>
        </div>
      </div>
      <div v-show="sidebarMini" class="notion-sidebar-mini-icons">
        <router-link to="/">
          <q-icon name="home" />
        </router-link>
        <button class="sidebar-search-btn-mini" @click="showSearch = !showSearch">
          <q-icon name="search" />
        </button>
      </div>
      <div v-if="sidebarMini && showSearch" class="sidebar-search-box-mini">
        <input
          v-model="searchKeyword"
          @keyup.enter="onSearch"
          type="text"
          placeholder="검색..."
          class="sidebar-search-input-mini"
        />
        <button class="sidebar-search-go-mini" @click="onSearch">
          <q-icon name="arrow_forward" />
        </button>
      </div>
    </q-drawer>
    <q-page-container class="notion-main">
      <router-view :search-keyword="searchResult" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const leftDrawerOpen = ref(true);
const sidebarMini = ref(false);
const showSearch = ref(false);
const searchKeyword = ref('');
const searchResult = ref('');

function onSearch() {
  if (!searchKeyword.value.trim()) return;
  searchResult.value = searchKeyword.value.trim();
  showSearch.value = false;
}
</script>

<style scoped>
.notion-header, .notion-sidebar {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(4px);
}
.notion-header {
  border-bottom: 1px solid #eee;
  box-shadow: none;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0;
}
.notion-header-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 32px;
  gap: 16px;
}
.sidebar-toggle-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #888;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  margin-right: 8px;
}
.sidebar-toggle-btn:hover {
  background: #f5f5f5;
}
.notion-header-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
}
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f6fa;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-left: 16px;
  font-size: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.notion-sidebar {
  border-right: 1px solid #eee;
  padding: 32px 0 0 0;
  position: relative;
  transition: width 0.2s, min-width 0.2s, border 0.2s, padding 0.2s;
  overflow-x: hidden;
}
.notion-sidebar-title {
  font-size: 1.3rem;
  font-weight: 700;
  padding: 0 24px 24px 32px;
  color: #222;
  transition: opacity 0.2s;
}
.notion-sidebar nav ul {
  list-style: none;
  padding: 0 0 0 32px;
  margin: 0;
}
.notion-sidebar nav li {
  margin-bottom: 12px;
}
.notion-sidebar nav a {
  color: #222;
  text-decoration: none;
  font-size: 1rem;
  padding: 6px 0;
  display: block;
  border-radius: 4px;
  transition: background 0.15s;
}
.notion-sidebar nav a.router-link-exact-active,
.notion-sidebar nav a:hover {
  background: #f5f5f5;
}
.notion-sidebar-mini-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  gap: 16px;
}
.notion-main {
  background: #fff;
}
.sidebar-search-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 24px 8px 32px;
}
.sidebar-search-btn, .sidebar-search-btn-mini {
  border: none;
  background: none;
  cursor: pointer;
  color: #888;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  margin-left: 2px;
}
.sidebar-search-btn:hover, .sidebar-search-btn-mini:hover {
  background: #f5f5f5;
}
.sidebar-search-box {
  display: flex;
  align-items: center;
  gap: 4px;
}
.sidebar-search-input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 1rem;
  outline: none;
  background: #fafbfc;
  color: #222;
}
.sidebar-search-go {
  border: none;
  background: none;
  cursor: pointer;
  color: #888;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.sidebar-search-go:hover {
  background: #f5f5f5;
}
.sidebar-search-box-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0 8px 0;
}
.sidebar-search-input-mini {
  width: 40px;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.95rem;
  outline: none;
  background: #fafbfc;
  color: #222;
}
.sidebar-search-go-mini {
  border: none;
  background: none;
  cursor: pointer;
  color: #888;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.sidebar-search-go-mini:hover {
  background: #f5f5f5;
}
</style>
