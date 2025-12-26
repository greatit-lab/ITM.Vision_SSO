<!-- frontend/src/components/layout/Header.vue -->
<template>
  <header
    class="sticky top-0 z-40 w-full h-9 transition-all duration-300 border-b shadow-sm bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-xl border-slate-200 dark:border-zinc-800"
  >
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center gap-4">
        <h2 class="text-base font-bold tracking-tight text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <template v-if="pageTitleParts.parent">
            <span class="font-medium">{{ pageTitleParts.parent }}</span>
            <span class="text-slate-300 dark:text-slate-600 font-light">/</span>
          </template>
          <span class="font-medium">{{ pageTitleParts.current }}</span>
        </h2>
      </div>

      <div class="flex items-center gap-3">
        <button 
          class="relative p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          v-tooltip.bottom="pendingRequestCount > 0 ? `${pendingRequestCount}건의 승인 대기 요청` : '알림 없음'"
        >
           <i class="pi pi-bell text-lg"></i>
           <span 
             v-if="pendingRequestCount > 0"
             class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-zinc-900 animate-pulse"
           ></span>
        </button>

        <button 
          v-if="authStore.isAdmin"
          @click="handleAdminClick"
          class="p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          v-tooltip.bottom="'Management Settings'"
        >
           <i class="pi pi-cog text-lg"></i>
        </button>

        <div class="h-4 border-l border-slate-300 dark:border-zinc-700 mx-1"></div>

        <button
          @click="toggleTheme"
          class="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden shadow-inner border border-slate-300 dark:border-zinc-700 transition-colors focus:outline-none"
        >
          <div class="absolute top-1/2 left-2 transform -translate-y-1/2 transition-all duration-500"
               :class="isDark ? 'opacity-40 scale-75' : 'opacity-100 scale-100'">
            <i class="pi pi-sun text-amber-500 text-xs"></i>
          </div>
          <div class="absolute top-1/2 right-2 transform -translate-y-1/2 transition-all duration-500"
               :class="!isDark ? 'opacity-40 scale-75' : 'opacity-100 scale-100'">
            <i class="pi pi-moon text-indigo-400 text-xs"></i>
          </div>
          <div
            class="absolute top-0.5 left-0.5 w-6 h-6 bg-white dark:bg-zinc-900 rounded-full shadow-md transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center z-10"
            :class="isDark ? 'translate-x-[28px]' : 'translate-x-0'"
          >
             <i class="pi text-[10px]" :class="isDark ? 'pi-moon text-indigo-500' : 'pi-sun text-amber-500'"></i>
          </div>
        </button>

        <div class="relative ml-2">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-2.5 pl-2 pr-1 py-1 transition-all duration-200 rounded-full group hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
            v-tooltip.bottom="authStore.user?.departmentName || 'No Department'"
          >
            <span class="hidden text-sm font-bold text-slate-700 dark:text-slate-200 sm:block">
              {{ authStore.userName }}
            </span>
            <div
              class="flex items-center justify-center w-7 h-7 text-xs font-bold text-white shadow-md rounded-full ring-2 ring-white dark:ring-zinc-900 transition-all"
              :class="getUserAvatarColor(authStore.user?.userId)"
            >
              {{ userAvatarInitial }}
            </div>
            <i class="text-[10px] pi pi-chevron-down text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
          </button>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 translate-y-2"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 w-52 mt-2 origin-top-right bg-white border shadow-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none z-50 overflow-hidden"
            >
              <div class="py-1" v-if="!authStore.isDemo">
                <button
                  @click="openProfileSettings"
                  class="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 transition-colors dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                >
                  <i class="mr-3 text-slate-400 pi pi-user"></i> Profile Settings
                </button>
              </div>
              
              <div 
                class="py-1" 
                :class="{ 'border-t border-slate-100 dark:border-zinc-800': !authStore.isDemo }"
              >
                <button
                  @click="handleLogout"
                  class="flex items-center w-full px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <i class="mr-3 pi pi-sign-out"></i> Sign out
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="isProfileModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeProfileSettings"></div>
          <div class="relative w-full max-w-md p-6 bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 transform transition-all scale-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Settings</h3>
              <button @click="closeProfileSettings" class="text-slate-400 hover:text-slate-600 transition-colors">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="mb-6 space-y-3">
              <div class="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 flex items-center justify-center text-white rounded-full text-xl font-bold shadow-lg"
                       :class="getUserAvatarColor(authStore.user?.userId)">
                     {{ userAvatarInitial }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white text-lg">{{ authStore.userName }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ authStore.user?.email }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100">
                    <span class="block text-slate-400 font-semibold mb-0.5">Department</span>
                    <span class="text-slate-700 dark:text-slate-200 font-medium">{{ authStore.user?.departmentName || '-' }}</span>
                  </div>
                   <div class="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100">
                    <span class="block text-slate-400 font-semibold mb-0.5">Role</span>
                    <span class="font-bold" :class="getRoleTextColor(authStore.user?.role)">{{ authStore.user?.role || 'User' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="saveProfileSettings" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Default Site</label>
                <select v-model="selectedSite" @change="handleSiteChange" class="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none text-sm appearance-none cursor-pointer">
                  <option value="" disabled>Select Site</option>
                  <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Default SDWT</label>
                <select v-model="selectedSdwt" :disabled="!selectedSite" class="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none text-sm appearance-none cursor-pointer disabled:opacity-50">
                   <option value="" disabled>Select SDWT</option>
                   <option v-for="sdwt in sdwts" :key="sdwt" :value="sdwt">{{ sdwt }}</option>
                </select>
              </div>
              <div class="pt-4 flex gap-3">
                <button type="button" @click="closeProfileSettings" class="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">Cancel</button>
                <button type="submit" :disabled="isSaving || !selectedSite || !selectedSdwt" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-70">
                  <i v-if="isSaving" class="pi pi-spin pi-spinner mr-2"></i>
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useMenuStore } from "@/stores/menu"; 
import { dashboardApi } from "@/api/dashboard"; 
import * as AdminApi from "@/api/admin";
import http from "@/api/http"; 
import type { MenuNode } from "@/api/menu"; 

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menuStore = useMenuStore(); 

const isDropdownOpen = ref(false);
const isDark = ref(false);
const isProfileModalOpen = ref(false);
const isSaving = ref(false);
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const selectedSite = ref("");
const selectedSdwt = ref("");
const pendingRequestCount = ref(0);

// UserId의 첫 글자(대문자) 반환
const userAvatarInitial = computed(() => {
  const userId = authStore.user?.userId;
  return userId ? userId.charAt(0).toUpperCase() : 'U';
});

// UserId의 알파벳에 따라 고유한 색상(Gradient) 반환
const getUserAvatarColor = (userId?: string) => {
  if (!userId) return 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/30';
  
  const charCode = userId.charAt(0).toUpperCase().charCodeAt(0);
  const colorIndex = charCode % 8; // 8가지 색상 팔레트 순환

  const gradients = [
    'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30',      // 0: Red/Rose
    'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30',// 1: Orange
    'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30',   // 2: Amber/Yellow
    'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30', // 3: Green
    'bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/30',      // 4: Teal
    'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30',      // 5: Blue
    'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30', // 6: Indigo
    'bg-gradient-to-br from-violet-500 to-violet-600 shadow-violet-500/30', // 7: Purple
  ];

  return gradients[colorIndex];
};

// 권한별 텍스트 색상
const getRoleTextColor = (role?: string) => {
  const r = role?.toUpperCase();
  if (r === 'ADMIN' || r === 'SUPERADMIN') return 'text-rose-600 dark:text-rose-400';
  if (r === 'MANAGER') return 'text-indigo-600 dark:text-indigo-400';
  if (r === 'USER') return 'text-emerald-600 dark:text-emerald-400';
  if (r === 'GUEST') return 'text-amber-600 dark:text-amber-400';
  return 'text-slate-600';
}

// 페이지 타이틀 분리 계산
const pageTitleParts = computed(() => {
  const findBreadcrumb = (nodes: MenuNode[], targetPath: string, parents: string[]): string | null => {
    for (const node of nodes) {
      const nodePath = (node.routerPath || '').replace(/\/$/, '');
      const target = targetPath.replace(/\/$/, '');
      if (nodePath && nodePath === target) {
        return [...parents, node.label].join(' / ');
      }
      if (node.children && node.children.length > 0) {
        const found = findBreadcrumb(node.children, targetPath, [...parents, node.label]);
        if (found) return found;
      }
    }
    return null;
  };

  let fullTitle = "Overview";
  const path = route.path;

  // 1. 관리자 페이지 매핑
  if (path.startsWith('/admin')) {
    if (path.includes('/menus')) fullTitle = "Management / Menus";
    else if (path.includes('/users')) fullTitle = "Management / Users";
    else if (path.includes('/infra')) fullTitle = "Management / Infra";
    else if (path.includes('/system')) fullTitle = "Management / System";
    else fullTitle = "Management";
  } 
  // 2. DB 메뉴 탐색
  else if (menuStore.menus.length > 0) {
    const breadcrumb = findBreadcrumb(menuStore.menus, route.path, []);
    if (breadcrumb) fullTitle = breadcrumb;
  }

  if (fullTitle.includes(" / ")) {
    const parts = fullTitle.split(" / ");
    const current = parts.pop();
    return { parent: parts.join(" / "), current: current };
  }
  return { parent: null, current: fullTitle };
});

const handleAdminClick = () => {
  if (authStore.isSuperAdmin) router.push({ name: 'admin-menus' });
  else router.push({ name: 'admin-users' });
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
};

const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value;
const handleLogout = () => authStore.logout();

const openProfileSettings = async () => {
  isDropdownOpen.value = false;
  isProfileModalOpen.value = true;
  if (authStore.user?.site) selectedSite.value = authStore.user.site;
  try {
    if (sites.value.length === 0) sites.value = await dashboardApi.getSites();
    if (selectedSite.value) await handleSiteChange(); 
    if (authStore.user?.sdwt) selectedSdwt.value = authStore.user.sdwt;
  } catch (e) { console.error(e); }
};

const closeProfileSettings = () => isProfileModalOpen.value = false;
const handleSiteChange = async () => {
  selectedSdwt.value = ""; 
  if (!selectedSite.value) return;
  try { sdwts.value = await dashboardApi.getSdwts(selectedSite.value); } catch (e) { console.error(e); }
};

const saveProfileSettings = async () => {
  if (!selectedSite.value || !selectedSdwt.value) return;
  isSaving.value = true;
  try {
    await http.post('/auth/context', { site: selectedSite.value, sdwt: selectedSdwt.value });
    if (authStore.user) {
      authStore.setUser({ ...authStore.user, site: selectedSite.value, sdwt: selectedSdwt.value });
    }
    closeProfileSettings();
    if (route.name === 'home') window.location.reload();
  } catch (e) { alert("Failed to save settings."); } 
  finally { isSaving.value = false; }
};

const fetchNotifications = async () => {
  if (authStore.isAdmin) {
    try {
      const res = await AdminApi.getGuestRequests();
      pendingRequestCount.value = res.data.filter((req: any) => req.status === 'PENDING').length;
    } catch (e) { console.error(e); }
  }
};

onMounted(() => {
  if (document.documentElement.classList.contains("dark")) isDark.value = true;
  fetchNotifications();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
