<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated :class="isDark ? 'bg-grey-10 text-grey-2' : ''">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title :class="isDark ? 'text-white' : 'text-dark'">PulseSignal</q-toolbar-title>

        <q-space />

        <q-toggle
          v-model="isDark"
          checked-icon="dark_mode"
          unchecked-icon="light_mode"
          color="primary"
          size="md"
          class="q-mr-md"
          :label="isDark ? '다크' : '라이트'"
          @update:model-value="toggleDarkMode"
        />
        <div class="text-grey-6 text-caption q-mr-md">Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :class="isDark ? 'bg-grey-10 text-grey-2' : 'bg-grey-1'"
    >
      <q-list padding>
        <q-item-label
          header
          :class="isDark ? 'text-grey-4' : 'text-grey-7'"
          class="text-weight-bold q-mb-sm q-mt-sm"
          >Menu</q-item-label
        >
        <q-item clickable to="/" exact class="rounded-borders q-mb-xs menu-item">
          <q-item-section avatar>
            <q-icon name="home" :color="isDark ? 'grey-2' : 'primary'" size="md" />
          </q-item-section>
          <q-item-section :class="isDark ? 'text-grey-2' : 'text-body1 text-weight-medium'"
            >Main</q-item-section
          >
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Dark } from 'quasar';

const leftDrawerOpen = ref(false);
const isDark = ref(Dark.isActive);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleDarkMode(val: boolean) {
  Dark.set(val);
  isDark.value = val;
}
</script>

<style scoped lang="scss">
.menu-item {
  transition: background 0.2s;

  &:hover {
    background: $grey-2;
    color: inherit;
  }
}

body.body--dark .menu-item:hover {
  background-color: #23272e !important;
  color: #fff !important;
}

.q-drawer {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}
</style>
