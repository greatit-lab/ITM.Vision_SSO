<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-xl bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10"
    :class="isOpen ? 'w-64' : 'w-20'"
  >
    <div
      class="h-24 flex items-center relative transition-all duration-300"
      :class="isOpen ? 'px-6 justify-start' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
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
            class="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap leading-tight"
            >ITM Dash</span
          >
          <span
            class="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase whitespace-nowrap"
            >ENTERPRISE</span
          >
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-200 shadow-md z-50 transform hover:scale-110 hover:border-indigo-200 dark:hover:border-indigo-500/50 cursor-pointer"
        :title="isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
      >
        <i
          class="pi text-[10px]"
          :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-2 px-4 scrollbar-hide">
      <div class="mb-4">
        <div
          class="mb-2 px-2 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
          :class="{ 'opacity-0 h-0 overflow-hidden': !isOpen }"
        >
          Main Dashboard
        </div>

        <router-link
          to="/"
          class="nav-item"
          active-class="active"
          :title="!isOpen ? 'Overview' : ''"
        >
          <i class="pi pi-objects-column text-lg flex-shrink-0"></i>
          <span class="nav-text" :class="{ show: isOpen }">Overview</span>
        </router-link>
      </div>

      <div class="mb-2">
        <button
          @click="toggleGroup('wafer')"
          class="w-full flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          :class="{ hidden: !isOpen }"
        >
          <span>Wafer Metrology</span>
          <i
            class="pi pi-chevron-down text-[10px] transition-transform duration-300"
            :class="openGroups.wafer ? 'rotate-180' : ''"
          ></i>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out space-y-1"
          :class="
            openGroups.wafer ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          "
        >
          <router-link
            to="/waferflatdata"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Wafer Data' : ''"
          >
            <i class="pi pi-chart-pie text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }">Wafer Data</span>
          </router-link>

          <router-link
            to="/lot-uniformity-trend"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Lot Uniformity' : ''"
          >
            <i class="pi pi-chart-line text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }"
              >Lot Uniformity</span
            >
          </router-link>
        </div>
      </div>

      <div class="mb-2">
        <button
          @click="toggleGroup('itm')"
          class="w-full flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          :class="{ hidden: !isOpen }"
        >
          <span>ITM Monitoring</span>
          <i
            class="pi pi-chevron-down text-[10px] transition-transform duration-300"
            :class="openGroups.itm ? 'rotate-180' : ''"
          ></i>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out space-y-1"
          :class="openGroups.itm ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'"
        >
          <router-link
            to="/equipment-explorer"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Equip Specs' : ''"
          >
            <i class="pi pi-server text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }">Equip Specs</span>
          </router-link>

          <router-link
            to="/performance-trend"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Performance' : ''"
          >
            <i class="pi pi-chart-bar text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }">Performance</span>
          </router-link>

          <router-link
            to="/process-memory"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Process Memory' : ''"
          >
            <i class="pi pi-microchip text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }"
              >Process Memory</span
            >
          </router-link>

          <router-link
            to="/lamp-life"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Lamp Lifetime' : ''"
          >
            <i class="pi pi-sun text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }"
              >Lamp Lifetime</span
            >
          </router-link>
        </div>
      </div>

      <div class="mb-2">
        <button
          @click="toggleGroup('advanced')"
          class="w-full flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          :class="{ hidden: !isOpen }"
        >
          <span>Advanced Analytics</span>
          <i
            class="pi pi-chevron-down text-[10px] transition-transform duration-300"
            :class="openGroups.advanced ? 'rotate-180' : ''"
          ></i>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out space-y-1"
          :class="
            openGroups.advanced ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          "
        >
          <router-link
            to="/prealign-analytics"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'PreAlign Data' : ''"
          >
            <i class="pi pi-compass text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }"
              >PreAlign Data</span
            >
          </router-link>

          <router-link
            to="/error-analytics"
            class="nav-item"
            active-class="active"
            :title="!isOpen ? 'Alert History' : ''"
          >
            <i class="pi pi-bell text-lg flex-shrink-0"></i>
            <span class="nav-text" :class="{ show: isOpen }"
              >Alert History</span
            >
          </router-link>
        </div>
      </div>
    </nav>

    <div
      class="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
      :class="isOpen ? '' : 'flex justify-center px-0'"
    >
      <div
        class="flex items-center gap-3.5 p-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md group"
      >
        <div
          class="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-200 flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
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
import { ref, reactive } from "vue";

const isOpen = ref(true);

// 그룹(섹션)별 열림/닫힘 상태 관리
const openGroups = reactive<Record<string, boolean>>({
  wafer: true,
  itm: true,
  advanced: true,
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isOpen.value })
  );
};

// 그룹 토글 함수
const toggleGroup = (group: string) => {
  if (isOpen.value) {
    openGroups[group] = !openGroups[group];
  } else {
    // 사이드바가 닫혀있을 때 그룹을 클릭하면 사이드바를 엽니다.
    isOpen.value = true;
    // 약간의 딜레이 후 그룹을 엽니다 (애니메이션 자연스럽게)
    setTimeout(() => {
      openGroups[group] = true;
    }, 100);
  }
};
</script>

<style scoped>
/* 네비게이션 아이템 스타일 (줄 간격 축소: py-3.5 -> py-2.5) */
.nav-item {
  @apply flex items-center px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 font-bold transition-all duration-200 ease-out hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 overflow-hidden select-none cursor-pointer;
}

/* 활성 상태 스타일 */
.nav-item.active {
  @apply bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shadow-sm;
}

/* 텍스트 애니메이션 */
.nav-text {
  @apply whitespace-nowrap transition-all duration-300 opacity-0 w-0 ml-0 translate-x-[-10px];
}
.nav-text.show {
  @apply opacity-100 ml-3 w-auto translate-x-0;
}

/* 사이드바 닫혔을 때 아이콘 중앙 정렬 */
aside.w-20 .nav-item {
  @apply justify-center px-0;
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
