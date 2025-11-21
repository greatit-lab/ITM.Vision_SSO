<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-2xl"
    :class="[
      isOpen ? 'w-60' : 'w-20',
      'bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10',
    ]"
  >
    <div
      class="h-24 flex items-center relative group transition-all duration-300"
      :class="isOpen ? 'px-5 justify-between' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3.5 overflow-hidden">
        <div
          class="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white flex-shrink-0"
        >
          <i class="pi pi-bolt text-lg"></i>
        </div>
        <div
          class="flex flex-col transition-opacity duration-300"
          :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'"
        >
          <span
            class="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap"
            >ITM Dash</span
          >
          <span
            class="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase whitespace-nowrap"
            >Enterprise</span
          >
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-slate-300 transition-all shadow-sm z-50 opacity-0 group-hover:opacity-100"
      >
        <i
          class="pi text-[10px]"
          :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
      <div
        class="px-4 mb-2 mt-2 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
        :class="{ 'opacity-0 h-0 overflow-hidden': !isOpen }"
      >
        Main Dashboard
      </div>

      <router-link
        to="/"
        class="nav-item group"
        :class="{ 'ml-6': isOpen }"
        active-class="active"
        :title="!isOpen ? 'Dashboard' : ''"
      >
        <i
          class="pi pi-objects-column text-lg flex-shrink-0 transition-colors"
        ></i>
        <span
          class="whitespace-nowrap font-bold transition-all duration-300"
          :class="isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0 overflow-hidden'"
          >Overview</span
        >
        <div class="active-indicator"></div>
      </router-link>

      <div
        class="px-4 mt-8 mb-2 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
        :class="{ 'opacity-0 h-0 overflow-hidden': !isOpen }"
      >
        Analysis
      </div>

      <router-link
        to="/waferflatdata"
        class="nav-item group"
        :class="{ 'ml-6': isOpen }"
        active-class="active"
        :title="!isOpen ? 'Wafer Data' : ''"
      >
        <i class="pi pi-chart-pie text-lg flex-shrink-0 transition-colors"></i>
        <span
          class="whitespace-nowrap font-bold transition-all duration-300"
          :class="isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0 overflow-hidden'"
          >Wafer Data</span
        >
        <div class="active-indicator"></div>
      </router-link>

      <router-link
        to="/equipment-explorer"
        class="nav-item group"
        :class="{ 'ml-6': isOpen }"
        active-class="active"
        :title="!isOpen ? 'Equip Specs' : ''"
      >
        <i class="pi pi-server text-lg flex-shrink-0 transition-colors"></i>
        <span
          class="whitespace-nowrap font-bold transition-all duration-300"
          :class="isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0 overflow-hidden'"
          >Equip Specs</span
        >
        <div class="active-indicator"></div>
      </router-link>

      <router-link
        to="/performance-trend"
        class="nav-item group"
        :class="{ 'ml-6': isOpen }"
        active-class="active"
        :title="!isOpen ? 'Performance' : ''"
      >
        <i class="pi pi-wave-pulse text-lg flex-shrink-0 transition-colors"></i>
        <span
          class="whitespace-nowrap font-bold transition-all duration-300"
          :class="isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0 overflow-hidden'"
          >Performance</span
        >
        <div class="active-indicator"></div>
      </router-link>

      <router-link
        to="/error-analytics"
        class="nav-item group"
        :class="{ 'ml-6': isOpen }"
        active-class="active"
        :title="!isOpen ? 'Alerts' : ''"
      >
        <i class="pi pi-bell text-lg flex-shrink-0 transition-colors"></i>
        <span
          class="whitespace-nowrap font-bold transition-all duration-300"
          :class="isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0 overflow-hidden'"
          >Alert History</span
        >
        <div class="active-indicator"></div>
      </router-link>
    </nav>

    <div
      class="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
      :class="isOpen ? '' : 'flex justify-center px-0'"
    >
      <div
        class="flex items-center gap-3.5 p-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md group"
      >
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-200 dark:to-slate-300 flex items-center justify-center text-white dark:text-slate-800 font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
        >
          A
        </div>
        <div
          class="overflow-hidden transition-all duration-300"
          :class="isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'"
        >
          <p
            class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate"
          >
            Administrator
          </p>
          <p
            class="text-[11px] text-slate-500 dark:text-slate-400 truncate font-semibold"
          >
            System Manager
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isOpen = ref(true);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isOpen.value })
  );
};
</script>

<style scoped>
/* 네비게이션 아이템 기본 스타일 */
.nav-item {
  @apply relative flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 transition-all duration-300 ease-out hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 overflow-hidden;
}

/* 사이드바 접혔을 때 (.w-20) 아이콘 중앙 정렬 및 들여쓰기 제거 */
aside.w-20 .nav-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
  margin-left: 0 !important; /* 들여쓰기 강제 제거 */
}

/* 활성 상태 스타일 */
.nav-item.active {
  @apply bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400;
}

/* 활성 상태 표시바 (왼쪽 파란색 바) 위치 미세 조정 */
.active-indicator {
  @apply absolute left-[-0.5rem] top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full scale-y-0 transition-transform duration-300;
}

.nav-item.active .active-indicator {
  @apply scale-y-100;
}

/* 스크롤바 숨기기 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
