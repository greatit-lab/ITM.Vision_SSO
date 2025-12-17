<!-- frontend/src/components/layout/Sidebar.vue -->
<template>
  <aside
    class="flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] border-r shadow-xl bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-gray-200 dark:border-white/10"
    :class="isOpen ? 'w-60' : 'w-[70px]'"
  >
    <div
      class="h-16 flex items-center relative transition-all duration-300 border-b border-slate-100 dark:border-slate-800/50"
      :class="isOpen ? 'px-5 justify-start' : 'px-0 justify-center'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="w-11 h-11 flex-shrink-0 flex items-center justify-center">
           <img 
             :src="logoUrl" 
             alt="ITM Vision Logo" 
             class="w-full h-full object-contain drop-shadow-md filter transition-all duration-300 hover:scale-110" 
           />
        </div>

        <div
          class="flex flex-col transition-opacity duration-300"
          :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'"
        >
          <span
            class="text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap leading-none"
            >
              ITM Vision
          </span>
          <span
            class="text-[10px] scale-[0.9] origin-left text-indigo-500 dark:text-indigo-400 font-bold tracking-widest uppercase whitespace-nowrap mt-0.5"
          >
            Smart Factory
          </span>
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm z-50 transform hover:scale-110 hover:border-indigo-200 dark:hover:border-indigo-500/50 cursor-pointer"
        :title="isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
      >
        <i
          class="pi text-[8px]"
          :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"
        ></i>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-2 px-3 scrollbar-hide">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-20 text-slate-400 text-xs">
        <i class="pi pi-spin pi-spinner mb-2"></i> Loading Menus...
      </div>

      <div v-else class="mb-3">
        <div
          class="mb-1 px-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
          :class="{ 'opacity-0 h-0 overflow-hidden': !isOpen }"
        >
          Main
        </div>
        <router-link
          to="/"
          class="flex items-center py-2 rounded-lg text-sm font-bold transition-all duration-200 ease-out text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 overflow-hidden select-none cursor-pointer"
          :class="isOpen ? 'pl-6 pr-3' : 'justify-center px-0'"
          active-class="bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300"
          :title="!isOpen ? 'Overview' : ''"
        >
          <i class="pi pi-objects-column text-[17px] flex-shrink-0"></i>
          <span
            class="whitespace-nowrap transition-all duration-300"
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
            openGroups[group.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          "
        >
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center py-2 rounded-lg text-sm font-bold transition-all duration-200 ease-out text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 overflow-hidden select-none cursor-pointer"
            :class="isOpen ? 'pl-6 pr-3' : 'justify-center px-0'"
            active-class="bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-300"
            :title="!isOpen ? item.label : ''"
          >
            <i :class="[item.icon, 'text-[17px] flex-shrink-0']"></i>
            <span
              class="whitespace-nowrap transition-all duration-300"
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
      class="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300"
      :class="isOpen ? '' : 'flex justify-center px-0'" 
    >
      <div
        class="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md group"
        :class="isOpen ? 'w-full' : 'justify-center w-auto'"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 text-xs shrink-0 relative"
          :class="roleAvatarClass"
          :title="authStore.user?.role || 'User'"
        >
          {{ authStore.userInitial }}
          
          <span 
            v-if="authStore.user?.role === 'ADMIN'"
            class="absolute inset-0 rounded-full animate-ping opacity-20 bg-rose-500"
          ></span>
        </div>

        <div
          class="overflow-hidden transition-all duration-300 flex-1 min-w-0 flex flex-col justify-center"
          :class="isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'"
        >
          <p class="text-sm font-extrabold text-slate-700 dark:text-slate-200 truncate leading-tight">
            {{ authStore.user?.name || 'Guest' }}
          </p>
          <p class="text-[10px] text-slate-400 truncate" :title="authStore.user?.department">
            {{ authStore.user?.department || 'No Dept' }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { menuApi, type MenuDto } from "@/api/menu";
import logoUrl from "@/assets/ITM_Vision.png";

const authStore = useAuthStore();
const isOpen = ref(true);
const isLoading = ref(false);

// 프론트엔드 메뉴 그룹 타입 정의
interface MenuItem {
  to: string;
  label: string;
  icon: string;
}
interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

const menuGroups = ref<MenuGroup[]>([]);
const openGroups = reactive<Record<string, boolean>>({});

// 권한별 아바타 스타일 (Auth Store 연동)
const roleAvatarClass = computed(() => {
  const role = authStore.user?.role;
  switch (role) {
    case 'ADMIN': 
      return [
        'bg-rose-500', 
        'shadow-[0_0_12px_rgba(244,63,94,0.6)]', 
        'ring-2 ring-white dark:ring-zinc-800',  
        'border border-rose-400'
      ];
    case 'MANAGER': 
      return [
        'bg-amber-500', 
        'ring-2 ring-amber-300/80 dark:ring-amber-600', 
        'ring-offset-1 ring-offset-white dark:ring-offset-zinc-900', 
        'shadow-md'
      ];
    default: 
      return [
        'bg-slate-500', 
        'border border-slate-300 dark:border-slate-600',
        'shadow-sm'
      ];
  }
});

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isOpen.value })
  );
};

const toggleGroup = (groupId: string) => {
  if (isOpen.value) {
    openGroups[groupId] = !openGroups[groupId];
  } else {
    // 닫혀있을 때 그룹을 클릭하면 사이드바를 염
    isOpen.value = true;
    setTimeout(() => {
      openGroups[groupId] = true;
    }, 100);
  }
};

// 백엔드 API를 통해 메뉴 로드
const fetchMenus = async () => {
  isLoading.value = true;
  try {
    const rawMenus = await menuApi.getMyMenus();
    
    // 백엔드 트리 구조(MenuDto) -> 프론트 그룹 구조(MenuGroup) 변환
    // 상위 메뉴(parentId=null)는 그룹 헤더가 되고, 그 자식(children)은 아이템이 됩니다.
    menuGroups.value = rawMenus.map((parentMenu) => {
      const groupId = `group-${parentMenu.menuId}`;
      
      // 기본적으로 모든 그룹을 열어둠
      openGroups[groupId] = true;

      return {
        id: groupId,
        label: parentMenu.label,
        items: (parentMenu.children || []).map((child) => ({
          to: child.routerPath || '#',
          label: child.label,
          icon: child.icon || 'pi pi-circle', // 아이콘 없으면 기본값
        })),
      };
    });
  } catch (error) {
    console.error("Failed to fetch menus:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMenus();
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
