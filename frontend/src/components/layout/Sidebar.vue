<!-- frontend/src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-xl bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10"
    :class="isOpen ? 'w-60' : 'w-[70px]'"
  >
    <div
      class="relative flex items-center transition-all duration-300 border-b h-14 border-slate-100 dark:border-slate-800/50"
      :class="isOpen ? 'px-5 justify-start' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex items-center justify-center flex-shrink-0 w-8 h-8">
          <img
            :src="logoUrl"
            alt="ITM Vision Logo"
            class="object-contain w-full h-full transition-all duration-300 drop-shadow-md filter hover:scale-110"
          />
        </div>

        <div
          class="flex flex-col transition-opacity duration-300"
          :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'"
        >
          <span
            class="text-sm font-extrabold leading-none tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap"
          >
            ITM Vision
          </span>
          <span
            class="text-[9px] scale-[0.9] origin-left text-indigo-500 dark:text-indigo-400 font-bold tracking-widest uppercase whitespace-nowrap mt-0.5"
          >
            Smart Factory
          </span>
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
      <div v-if="menuStore.isLoading" class="flex justify-center py-10">
        <i class="text-xl text-indigo-500 pi pi-spin pi-spinner"></i>
      </div>

      <ul v-else class="space-y-1">
        <SidebarItem
          v-for="menu in menuStore.menus"
          :key="menu.menuId"
          :item="menu"
          :is-sidebar-open="isOpen"
        />
      </ul>
    </nav>

    <div
      class="p-3 transition-all duration-300 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm"
      :class="isOpen ? '' : 'flex justify-center px-0'"
    >
      <div
        class="flex items-center gap-3 p-1.5 rounded-lg transition-all border shadow-sm group"
        :class="[
          isOpen ? 'w-full' : 'justify-center w-auto',
          hasContext 
            ? 'bg-white dark:bg-slate-700/30 border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md cursor-pointer' 
            : 'bg-transparent border-dashed border-slate-300 dark:border-slate-700'
        ]"
      >
        <div
          class="relative flex items-center justify-center w-8 h-8 text-xs font-bold text-white transition-all duration-300 rounded-full shrink-0"
          :class="roleAvatarClass"
          :title="userRole"
        >
          {{ roleInitial }}
          <span
            v-if="userRole === 'ADMIN'"
            class="absolute inset-0 rounded-full animate-ping opacity-20 bg-rose-500"
          ></span>
        </div>

        <div
          class="flex flex-col justify-center flex-1 min-w-0 overflow-hidden transition-all duration-300"
          :class="isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'"
        >
          <div v-if="hasContext">
            <p
              class="text-xs font-extrabold leading-tight truncate text-slate-700 dark:text-slate-200"
              :title="contextInfo"
            >
              {{ contextInfo }}
            </p>
            <p class="text-[9px] text-slate-400 truncate mt-0.5 font-medium">
              {{ userRole }}
            </p>
          </div>
          
          <div v-else class="flex flex-col">
            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic truncate">
              No Context Selected
            </p>
            <p class="text-[9px] text-slate-300 dark:text-slate-600">
              {{ userRole }}
            </p>
          </div>
        </div>
        
        <div v-if="!hasContext && isOpen" class="text-amber-400">
             <i class="pi pi-exclamation-circle text-xs"></i>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import logoUrl from "@/assets/ITM_Vision.png";
import SidebarItem from "./SidebarItem.vue";
import { useMenuStore } from "@/stores/menu";
import { useAuthStore } from "@/stores/auth";

const menuStore = useMenuStore();
const authStore = useAuthStore();
const isOpen = ref(true);

const userRole = computed(() => authStore.user?.role || 'USER');
const roleInitial = computed(() => userRole.value.charAt(0).toUpperCase());

const hasContext = computed(() => !!authStore.user?.site && !!authStore.user?.sdwt);

const contextInfo = computed(() => {
  if (hasContext.value) {
    return `${authStore.user?.site} / ${authStore.user?.sdwt}`;
  }
  return '';
});

const roleAvatarClass = computed(() => {
  switch (userRole.value) {
    case "ADMIN":
    case "MANAGER":
      return [
        "bg-rose-500",
        "shadow-[0_0_12px_rgba(244,63,94,0.6)]",
        "ring-2 ring-white dark:ring-zinc-800",
        "border border-rose-400",
      ];
    default:
      return [
        "bg-slate-500",
        "border border-slate-300 dark:border-slate-600",
        "shadow-sm",
      ];
  }
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isOpen.value })
  );
};

onMounted(async () => {
  if (!authStore.isAuthenticated) return;
  if (menuStore.menus.length === 0) {
    await menuStore.loadMenus();
  }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
