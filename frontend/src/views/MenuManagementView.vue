<!-- frontend/src/views/MenuManagementView.vue -->
<template>
  <div class="min-h-screen p-6 space-y-6 animate-fade-in-up">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Menu Permissions
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          역할(Role)별 메뉴 접근 권한을 관리합니다.
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="saveChanges"
          class="px-4 py-2 text-sm font-bold text-white transition-all bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 flex items-center"
        >
          <i class="pi pi-save mr-2"></i>Save Changes
        </button>
      </div>
    </div>

    <div class="border rounded-2xl bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 backdrop-blur-sm overflow-hidden shadow-sm">
      
      <div class="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/80 overflow-x-auto scrollbar-hide">
        <button 
          v-for="role in roles" 
          :key="role"
          @click="selectedRole = role"
          class="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap"
          :class="selectedRole === role 
            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' 
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          {{ role }}
        </button>
      </div>

      <div class="p-4">
        <TreeTable :value="menuNodes" class="p-treetable-sm custom-treetable" :autoLayout="true">
          <Column field="label" header="Menu Name" expander>
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i :class="[slotProps.node.data.icon, 'text-slate-400']"></i>
                <span class="font-medium text-slate-700 dark:text-slate-200">
                  {{ slotProps.node.data.label }}
                </span>
                <span v-if="slotProps.node.data.statusTag" 
                      class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {{ slotProps.node.data.statusTag }}
                </span>
              </div>
            </template>
          </Column>
          
          <Column field="routerPath" header="Path">
            <template #body="slotProps">
               <span v-if="slotProps.node.data.routerPath" class="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                 {{ slotProps.node.data.routerPath }}
               </span>
               <span v-else class="text-xs text-slate-300 dark:text-zinc-600">-</span>
            </template>
          </Column>

          <Column header="Access" class="w-32 text-center">
             <template #body="slotProps">
                <div @click="togglePermission(slotProps.node)" 
                     class="relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-200 ease-in-out"
                     :class="hasPermission(slotProps.node) ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-zinc-700'"
                >
                  <span class="inline-block w-4 h-4 transform bg-white rounded-full transition duration-200 ease-in-out ml-1 shadow-sm"
                        :class="hasPermission(slotProps.node) ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </div>
             </template>
          </Column>
        </TreeTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

// [수정] 사용하지 않는 MenuData 인터페이스 삭제됨

// Mock Data (실제 API 연동 시 axios/http 호출로 대체 필요)
const roles = ref(['USER', 'ENGINEER', 'MANAGER', 'ADMIN', 'GUEST']);
const selectedRole = ref('USER');

// PrimeVue TreeTable Node 구조
const menuNodes = ref([
  {
    key: '1',
    data: { id: 1, label: 'Dashboards', icon: 'pi pi-home', routerPath: '/' },
    children: [
       { key: '1-1', data: { id: 2, label: 'Overview', icon: 'pi pi-chart-bar', routerPath: '/' } },
       { key: '1-2', data: { id: 3, label: 'Wafer Map', icon: 'pi pi-map', routerPath: '/waferflatdata', statusTag: 'NEW' } }
    ]
  },
  {
    key: '2',
    data: { id: 4, label: 'Equipment', icon: 'pi pi-server', routerPath: '/equipment-explorer' },
    children: []
  },
  {
    key: '3',
    data: { id: 5, label: 'Analysis', icon: 'pi pi-chart-line', routerPath: null },
    children: [
      { key: '3-1', data: { id: 6, label: 'Error Analytics', icon: 'pi pi-exclamation-circle', routerPath: '/error-analytics' } },
      { key: '3-2', data: { id: 7, label: 'Lamp Life', icon: 'pi pi-clock', routerPath: '/lamp-life' } }
    ]
  }
]);

// 권한 상태 관리 (Role 별 허용된 Menu ID 목록)
const permissions = ref<Record<string, number[]>>({
  'USER': [1, 2, 3],
  'ENGINEER': [1, 2, 3, 4, 5, 6, 7],
  'MANAGER': [1, 2, 3, 4, 5, 6, 7],
  'ADMIN': [1, 2, 3, 4, 5, 6, 7],
  'GUEST': [1, 2]
});

const hasPermission = (node: any) => {
  const menuId = node.data.id;
  const currentRolePerms = permissions.value[selectedRole.value] || [];
  return currentRolePerms.includes(menuId);
};

const togglePermission = (node: any) => {
  const menuId = node.data.id;
  const currentRole = selectedRole.value;
  
  if (!permissions.value[currentRole]) {
    permissions.value[currentRole] = [];
  }

  const index = permissions.value[currentRole].indexOf(menuId);
  if (index === -1) {
    // 권한 추가
    permissions.value[currentRole].push(menuId);
  } else {
    // 권한 제거
    permissions.value[currentRole].splice(index, 1);
  }
};

const saveChanges = async () => {
  // TODO: 실제 API 호출 (http.post('/api/menu/permissions', ...))
  console.log('Saving permissions:', permissions.value);
  alert('Permissions saved successfully!');
};

onMounted(() => {
  // TODO: Load Roles and Menus from API
});
</script>

<style scoped>
/* Glassmorphism Table Overrides */
:deep(.p-treetable) .p-treetable-tbody > tr > td {
  @apply border-b border-slate-100 dark:border-zinc-800 bg-transparent text-sm py-4;
}

:deep(.p-treetable) .p-treetable-thead > tr > th {
  @apply bg-slate-50/50 dark:bg-zinc-900/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-800;
}

:deep(.p-treetable-toggler) {
  @apply text-slate-400 hover:text-indigo-500 w-6 h-6 mr-2 transition-colors;
}

:deep(.p-treetable .p-treetable-tbody > tr.p-highlight) {
  @apply bg-indigo-50/30 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-300;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
