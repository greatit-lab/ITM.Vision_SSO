<!-- frontend/src/views/admin/AdminLayout.vue -->
<template>
  <div class="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#09090B] transition-colors duration-500">
    <AdminSubMenu />

    <main class="flex-1 p-6 overflow-auto">
      <div class="mx-auto max-w-7xl animate-fade-in h-full">
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
import AdminSubMenu from '@/components/layout/AdminSubMenu.vue';
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
