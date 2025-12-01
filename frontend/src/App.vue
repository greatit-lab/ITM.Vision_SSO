<!-- frontend/src/App.vue -->
<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-[#09090B] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-500"
  >
    <Sidebar />

    <main
      class="flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      :class="isSidebarOpen ? 'ml-60' : 'ml-[70px]'"
    >
      <Header />

      <div class="flex-1 relative px-5 pb-8 pt-3">
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
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import Header from "@/components/layout/Header.vue";

const isSidebarOpen = ref(true);

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
