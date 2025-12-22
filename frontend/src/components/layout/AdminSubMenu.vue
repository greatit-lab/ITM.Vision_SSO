<!-- frontend/src/components/layout/AdminSubMenu.vue -->
<template>
  <div class="w-full bg-white border-b dark:bg-[#09090b] border-slate-200 dark:border-zinc-800">
    <div class="px-6">
      <nav class="flex gap-6 -mb-px" aria-label="Tabs">
        <router-link
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.routeName }"
          class="flex items-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap"
          :class="[
            isActive(tab.routeName)
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300'
          ]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
// [수정] 사용하지 않는 computed 제거
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  {
    name: 'menu',
    label: '메뉴 및 권한 (Menu & Roles)',
    routeName: 'admin-menus',
    icon: 'pi pi-sitemap'
  },
  {
    name: 'users',
    label: '사용자 및 보안 (User & Security)',
    routeName: 'admin-users',
    icon: 'pi pi-users'
  },
  {
    name: 'infra',
    label: '인프라 관리 (Infrastructure)',
    routeName: 'admin-infra',
    icon: 'pi pi-server'
  },
  {
    name: 'system',
    label: '시스템 설정 (System Config)',
    routeName: 'admin-system',
    icon: 'pi pi-cog'
  }
];

const isActive = (routeName: string) => {
  // route.meta.parent는 중첩된 하위 페이지에서 상위 탭을 활성화 상태로 유지하기 위한 용도입니다.
  // (meta 타입 정의에 따라 as any 혹은 옵셔널 체이닝 ?. 사용 권장)
  return route.name === routeName || (route.meta as any)?.parent === routeName;
};
</script>
