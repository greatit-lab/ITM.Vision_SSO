<!-- frontend/src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-xl bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10"
    :class="isOpen ? 'w-60' : 'w-[70px]'"
  >
    <div
      class="relative flex items-center h-16 transition-all duration-300 border-b border-slate-100 dark:border-slate-800/50"
      :class="isOpen ? 'px-5 justify-start' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div
          class="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-indigo-500/20"
        >
          <i class="text-sm pi pi-bolt"></i>
        </div>
        <div
          class="flex flex-col transition-opacity duration-300"
          :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'"
        >
          <span
            class="text-base font-extrabold leading-none tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap"
            >ITM Dash</span
          >
          <span
            class="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase whitespace-nowrap mt-0.5"
            >Enterprise</span
          >
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="absolute z-50 flex items-center justify-center w-5 h-5 transition-all duration-200 transform -translate-y-1/2 bg-white border rounded-full shadow-sm cursor-pointer -right-3 top-1/2 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:scale-110 hover:border-indigo-200 dark:hover:border-indigo-500/50"
        :title="isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
      >
        <i
          class="pi text-[8px]"
          :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
      <div class="mb-3">
        <div
          class="mb-1 px-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
          :class="{ 'opacity-0 h-0 overflow-hidden': !isOpen }"
        >
          Main
        </div>
        <router-link
          to="/"
          class="flex items-center px-3 py-2 overflow-hidden text-sm font-bold transition-all duration-200 ease-out rounded-lg cursor-pointer select-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
          :class="{ 'justify-center px-0': !isOpen }"
          active-class="text-indigo-600 shadow-sm bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
          :title="!isOpen ? 'Overview' : ''"
        >
          <i class="pi pi-objects-column text-[17px] flex-shrink-0"></i>
          <span
            class="transition-all duration-300 whitespace-nowrap"
            :class="
              isOpen
                ? 'opacity-100 ml-2.5 w-auto translate-x-0'
                : 'opacity-0 w-0 ml-0 -translate-x-2.5'
            "
          >
            Overview
          </span>
        </router-link>
      </div>

      <div v-for="group in menuGroups" :key="group.id" class="mb-1">
        <button
          @click="toggleGroup(group.id)"
          class="w-full flex items-center justify-between px-2 py-1 mb-0.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          :class="{ hidden: !isOpen }"
        >
          <span>{{ group.label }}</span>
          <i
            class="pi pi-chevron-down text-[9px] transition-transform duration-300"
            :class="openGroups[group.id] ? 'rotate-180' : ''"
          ></i>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out space-y-0.5"
          :class="
            openGroups[group.id] ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          "
        >
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center py-2 pl-6 pr-3 overflow-hidden text-sm font-bold transition-all duration-200 ease-out rounded-lg cursor-pointer select-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
            :class="{ 'justify-center px-0': !isOpen }"
            active-class="text-indigo-600 shadow-sm bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
            :title="!isOpen ? item.label : ''"
          >
            <i :class="[item.icon, 'text-[17px] flex-shrink-0']"></i>
            <span
              class="transition-all duration-300 whitespace-nowrap"
              :class="
                isOpen
                  ? 'opacity-100 ml-2.5 w-auto translate-x-0'
                  : 'opacity-0 w-0 ml-0 -translate-x-2.5'
              "
            >
              {{ item.label }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <div
      class="p-3 transition-all duration-300 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm"
      :class="isOpen ? '' : 'flex justify-center px-0'"
    >
      <div
        class="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md group"
      >
        <div
          class="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold text-white transition-transform rounded-full shadow-md bg-slate-800 dark:bg-slate-200 dark:text-slate-900 group-hover:scale-105"
        >
          A
        </div>
        <div
          class="overflow-hidden transition-all duration-300"
          :class="isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'"
        >
          <p
            class="text-xs font-bold truncate text-slate-700 dark:text-slate-200"
          >
            Administrator
          </p>
          <p
            class="text-[10px] text-slate-500 dark:text-slate-400 truncate font-semibold"
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

const menuGroups = [
  {
    id: "wafer",
    label: "Wafer Metrology",
    items: [
      { to: "/waferflatdata", label: "Wafer Data", icon: "pi pi-chart-pie" },
      {
        to: "/lot-uniformity-trend",
        label: "Lot Uniformity",
        icon: "pi pi-chart-line",
      },
    ],
  },
  {
    id: "itm",
    label: "ITM Monitoring",
    items: [
      {
        to: "/equipment-explorer",
        label: "Equip Specs",
        icon: "pi pi-server",
      },
      {
        to: "/performance-trend",
        label: "Performance",
        icon: "pi pi-chart-bar",
      },
      {
        to: "/process-memory",
        label: "Process Memory",
        icon: "pi pi-microchip",
      },
      { to: "/lamp-life", label: "Lamp Lifetime", icon: "pi pi-sun" },
    ],
  },
  {
    id: "advanced",
    label: "Advanced Analytics",
    items: [
      {
        to: "/prealign-analytics",
        label: "PreAlign Data",
        icon: "pi pi-compass",
      },
      { to: "/error-analytics", label: "Alert History", icon: "pi pi-bell" },
    ],
  },
];

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

const toggleGroup = (group: string) => {
  if (isOpen.value) {
    openGroups[group] = !openGroups[group];
  } else {
    isOpen.value = true;
    setTimeout(() => {
      openGroups[group] = true;
    }, 100);
  }
};
</script>

<style scoped>
/* [오류 해결] 
  스타일 태그 내용을 비웠습니다.
  모든 스타일은 위쪽 template 태그의 Tailwind Utility Class로 이동되어
  더 이상 CSS 린트 오류가 발생하지 않습니다.
*/

/* 스크롤바 숨기기 (표준 CSS) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
