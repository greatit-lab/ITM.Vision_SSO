<!-- frontend/src/App.vue -->
<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-[#09090B] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-500"
  >
    <Sidebar v-if="!isLoginPage" />

    <main
      class="flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      :class="!isLoginPage ? (isSidebarOpen ? 'ml-60' : 'ml-[70px]') : 'w-full'"
    >
      <Header v-if="!isLoginPage" />

      <div class="relative flex-1" :class="{ 'px-5 pt-2 pb-0': !isLoginPage }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/layout/Sidebar.vue";
import Header from "@/components/layout/Header.vue";

const route = useRoute();
const isSidebarOpen = ref(true);

// 현재 경로가 '/login'인지 확인하는 계산 속성
const isLoginPage = computed(() => route.path === "/login");

const handleSidebarToggle = (event: Event) => {
  const customEvent = event as CustomEvent;
  isSidebarOpen.value = customEvent.detail;
};

onMounted(() => {
  window.addEventListener("sidebar-toggle", handleSidebarToggle);
});

onUnmounted(() => {
  window.removeEventListener("sidebar-toggle", handleSidebarToggle);
});
</script>

<style>
/* 스크롤바 커스터마이징 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

/* 라우터 뷰 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
