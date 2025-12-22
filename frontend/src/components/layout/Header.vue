<!-- frontend/src/components/layout/Header.vue -->
<template>
  <header
    class="sticky top-0 z-40 w-full h-9 transition-all duration-300 border-b shadow-sm bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-xl border-slate-200 dark:border-zinc-800"
  >
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center gap-4">
        <h2 class="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {{ pageTitle }}
        </h2>
      </div>

      <div class="flex items-center gap-3">
        
        <button class="relative p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
           <i class="pi pi-bell text-lg"></i>
           <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-zinc-900"></span>
        </button>

        <button 
          v-if="authStore.isAdmin"
          @click="router.push({ name: 'admin-menus' })"
          class="p-2 text-slate-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          v-tooltip.bottom="'Menu Management'"
        >
           <i class="pi pi-cog text-lg"></i>
        </button>

        <div class="h-4 border-l border-slate-300 dark:border-zinc-700 mx-1"></div>

        <button
          @click="toggleTheme"
          class="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden shadow-inner border border-slate-300 dark:border-zinc-700 transition-colors focus:outline-none"
          title="Toggle Theme"
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

        <div class="relative ml-2" ref="dropdownRef">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-2.5 pl-2 pr-1 py-1 transition-all duration-200 rounded-full group hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
          >
            <span class="hidden text-sm font-bold text-slate-700 dark:text-slate-200 sm:block">
              {{ authStore.userName }}
            </span>
            <div
              class="flex items-center justify-center w-7 h-7 text-xs font-bold text-white shadow-md rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-white dark:ring-zinc-900 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/30 transition-all"
            >
              {{ authStore.userInitial }}
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
              <div class="py-1">
                <button
                  @click="openProfileSettings"
                  class="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 transition-colors dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                >
                  <i class="mr-3 text-slate-400 pi pi-user"></i> Profile Settings
                </button>
              </div>
              <div class="py-1 border-t border-slate-100 dark:border-zinc-800">
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
      <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="notification.show" class="fixed top-20 right-5 z-[10000] pointer-events-none">
          <div class="flex items-center gap-3 px-4 py-3 bg-white border shadow-2xl dark:bg-zinc-900 rounded-xl border-emerald-500/50 dark:border-emerald-500/30 ring-1 ring-black/5">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <i class="pi pi-check text-sm font-bold"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800 dark:text-white">Saved Successfully</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ notification.message }}</p>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="isProfileModalOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeProfileSettings"></div>
          
          <div class="relative w-full max-w-md p-6 bg-white dark:bg-[#121212] rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 transform transition-all scale-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Settings</h3>
              <button @click="closeProfileSettings" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="mb-6 space-y-3">
              <div class="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div class="flex items-center gap-4 mb-3">
                  <div class="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg">
                     {{ authStore.userInitial }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white text-lg">{{ authStore.userName }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ authStore.user?.email }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700">
                    <span class="block text-slate-400 font-semibold mb-0.5">Department</span>
                    <span class="text-slate-700 dark:text-slate-200 font-medium">{{ authStore.user?.departmentName || '-' }}</span>
                  </div>
                   <div class="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700">
                    <span class="block text-slate-400 font-semibold mb-0.5">Role</span>
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold">{{ authStore.user?.role || 'User' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="saveProfileSettings" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Default Site</label>
                <select 
                  v-model="selectedSite"
                  @change="handleSiteChange"
                  class="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm appearance-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700"
                >
                  <option value="" disabled>Select Site</option>
                  <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Default SDWT</label>
                <select 
                  v-model="selectedSdwt"
                  :disabled="!selectedSite"
                  class="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700"
                >
                  <option value="" disabled>Select SDWT</option>
                   <option v-for="sdwt in sdwts" :key="sdwt" :value="sdwt">{{ sdwt }}</option>
                </select>
              </div>

              <div class="pt-4 flex gap-3">
                <button 
                  type="button" 
                  @click="closeProfileSettings"
                  class="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  :disabled="isSaving || !selectedSite || !selectedSdwt"
                  class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-95"
                >
                  <i v-if="isSaving" class="pi pi-spin pi-spinner"></i>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
// [수정] useRouter 추가
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard"; 
import http from "@/api/http"; 

const route = useRoute();
// [수정] router 인스턴스 생성
const router = useRouter();
const authStore = useAuthStore();
const dropdownRef = ref<HTMLElement | null>(null);

const isDropdownOpen = ref(false);
const isDark = ref(false);
const isProfileModalOpen = ref(false);
const isSaving = ref(false);
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const selectedSite = ref("");
const selectedSdwt = ref("");

// Notification State
const notification = ref({ show: false, message: '' });

const pageTitle = computed(() => {
  const name = route.name?.toString();
  if (!name || name === "home") return "Overview";
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value;
const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false;
  }
};
const handleLogout = () => authStore.logout();

const openProfileSettings = async () => {
  isDropdownOpen.value = false;
  isProfileModalOpen.value = true;
  
  if (authStore.user?.site) selectedSite.value = authStore.user.site;
  if (authStore.user?.sdwt) selectedSdwt.value = authStore.user.sdwt;

  try {
    if (sites.value.length === 0) sites.value = await dashboardApi.getSites();
    if (selectedSite.value) {
        await handleSiteChange(); 
        if (authStore.user?.sdwt) selectedSdwt.value = authStore.user.sdwt;
    }
  } catch (e) {
    console.error("Failed to load sites", e);
  }
};

const closeProfileSettings = () => isProfileModalOpen.value = false;

const handleSiteChange = async () => {
  selectedSdwt.value = ""; 
  if (!selectedSite.value) return;
  try {
    sdwts.value = await dashboardApi.getSdwts(selectedSite.value);
  } catch (e) {
    console.error("Failed to load sdwts", e);
  }
};

const showNotification = (msg: string) => {
  notification.value = { show: true, message: msg };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const saveProfileSettings = async () => {
  if (!selectedSite.value || !selectedSdwt.value) return;
  isSaving.value = true;
  try {
    await http.post('/auth/context', {
      site: selectedSite.value,
      sdwt: selectedSdwt.value
    });
    
    if (authStore.user) {
        const updatedUser = { 
            ...authStore.user, 
            site: selectedSite.value, 
            sdwt: selectedSdwt.value 
        };
        authStore.setUser(updatedUser);
    }
    
    closeProfileSettings();
    showNotification(`${selectedSite.value} / ${selectedSdwt.value}`);

    if (route.name === 'home') {
        window.location.reload();
    }
  } catch (e) {
    console.error("Failed to save context", e);
    alert("Failed to save settings.");
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
  if (document.documentElement.classList.contains("dark")) {
    isDark.value = true;
  }
});
onUnmounted(() => document.removeEventListener("click", closeDropdown));
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
