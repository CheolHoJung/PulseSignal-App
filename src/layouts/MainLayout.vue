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
          <ul>
            <li>
              <router-link to="/">메인</router-link>
            </li>
          </ul>
        </nav>
      </div>
      <div v-show="sidebarMini" class="notion-sidebar-mini-icons">
        <router-link to="/">
          <q-icon name="home" />
        </router-link>
      </div>
    </q-drawer>
    <q-page-container class="notion-main">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const leftDrawerOpen = ref(true);
const sidebarMini = ref(false);
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
</style>
