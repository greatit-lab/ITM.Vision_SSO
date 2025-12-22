<!-- frontend/src/views/admin/MenuManagementView.vue -->
<template>
  <div class="h-full flex flex-col">
    <div class="mb-4 flex items-center justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">메뉴 및 권한 관리</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          시스템 메뉴 구조와 역할별 접근 권한을 설정합니다.
        </p>
      </div>
      <div class="flex gap-2">
        <Button 
          v-if="hasSelection"
          label="권한 일괄 적용" 
          icon="pi pi-users" 
          severity="help" 
          class="p-button-sm"
          @click="openBulkRoleModal"
          v-tooltip.top="'선택한 메뉴들의 권한을 한 번에 변경합니다.'"
        />
        
        <Button 
          icon="pi pi-refresh" 
          text 
          rounded 
          severity="secondary" 
          @click="loadMenuData" 
          v-tooltip="'새로고침'"
        />
        <Button 
          icon="pi pi-plus" 
          label="Add Menu" 
          class="p-button-sm" 
          @click="openNewMenuModal" 
        />
      </div>
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      <TreeTable
        :value="menuNodes"
        :loading="isLoading"
        scrollable
        scrollHeight="flex"
        class="flex-1 w-full"
        :rowHover="true"
        v-model:selectionKeys="selectedKeys"
        selectionMode="checkbox"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center p-8 text-slate-400">
            <i class="pi pi-sitemap text-4xl mb-2 opacity-50"></i>
            <p>데이터가 없습니다.</p>
          </div>
        </template>

        <Column field="label" header="Menu Name" expander style="min-width: 320px">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <div 
                class="flex items-center justify-center w-6 h-6 rounded shrink-0"
                :class="slotProps.node.data.icon ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400' : 'bg-transparent'"
              >
                <i v-if="slotProps.node.data.icon" :class="slotProps.node.data.icon"></i>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-700 dark:text-slate-200">
                  {{ slotProps.node.data.label }}
                </span>
                <Tag 
                  v-if="slotProps.node.data.statusTag" 
                  :value="slotProps.node.data.statusTag" 
                  :severity="getStatusSeverity(slotProps.node.data.statusTag)" 
                  class="!text-[9px] !h-4 !px-1.5 uppercase"
                />
              </div>
            </div>
          </template>
        </Column>

        <Column field="routerPath" header="Router Path" style="min-width: 200px">
           <template #body="slotProps">
            <span class="text-sm font-mono text-slate-500 dark:text-slate-400">
              {{ slotProps.node.data.routerPath || '-' }}
            </span>
          </template>
        </Column>

        <Column field="sortOrder" header="Order" style="width: 80px; text-align: center;">
           <template #body="slotProps">
            <span class="text-xs font-mono text-slate-400">
              {{ slotProps.node.data.sortOrder ?? 0 }}
            </span>
          </template>
        </Column>

        <Column field="roles" header="Access Roles" style="min-width: 300px">
          <template #body="slotProps">
            <AvatarGroup class="mr-2">
              <Avatar 
                v-for="role in getSortedRoles(slotProps.node.data.roles)" 
                :key="role"
                :label="role.charAt(0).toUpperCase()"
                shape="circle"
                :class="['!text-white !font-bold !border-2 !border-white dark:!border-zinc-900', getRoleColorClass(role)]"
                v-tooltip.top="role === 'ADMIN' ? 'ADMIN (All Access)' : role"
              />
            </AvatarGroup>
          </template>
        </Column>

        <Column header="Actions" style="width: 100px; text-align: center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button 
                icon="pi pi-pencil" 
                text 
                rounded 
                severity="secondary" 
                class="!w-8 !h-8 !p-0" 
                @click="editMenu(slotProps.node)" 
              />
              <Button 
                icon="pi pi-trash" 
                text 
                rounded 
                severity="danger" 
                class="!w-8 !h-8 !p-0" 
                @click="confirmDeleteMenu(slotProps.node)" 
              />
            </div>
          </template>
        </Column>
      </TreeTable>
    </div>

    <Dialog 
      v-model:visible="isModalOpen" 
      :header="editMode ? 'Edit Menu' : 'New Menu'" 
      modal 
      class="p-fluid w-full max-w-lg"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Menu Label</label>
            <InputText v-model="form.label" class="w-full" placeholder="Ex: Dashboard" />
          </div>
          
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Icon</label>
            <Select 
              v-model="form.icon" 
              :options="iconOptions" 
              filter
              showClear
              placeholder="Select Icon (Optional)" 
              class="w-full"
              :virtualScrollerOptions="{ itemSize: 38 }"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <i :class="slotProps.value"></i>
                  <span>{{ slotProps.value }}</span>
                </div>
                <span v-else class="text-slate-400">{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center gap-2">
                  <i :class="slotProps.option" class="text-slate-500"></i>
                  <span>{{ slotProps.option }}</span>
                </div>
              </template>
            </Select>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
           <div>
            <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Router Path</label>
            <InputText v-model="form.routerPath" class="w-full" placeholder="Ex: /dashboard" />
          </div>
          <div>
             <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Sort Order</label>
             <InputNumber v-model="form.sortOrder" class="w-full" showButtons :min="0" placeholder="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 sm:col-span-1">
             <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Parent Menu (Group)</label>
             <TreeSelect 
               v-model="selectedParentKey" 
               :options="parentOptions" 
               placeholder="Select Parent" 
               class="w-full"
               :showClear="true"
             />
          </div>
          
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Status Tag</label>
            <Select
              v-model="form.statusTag"
              :options="statusTagOptions"
              editable
              showClear
              placeholder="Ex: Beta, New"
              class="w-full"
            />
          </div>
        </div>

        <div>
           <label class="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Roles</label>
           <div class="p-3 border rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
             <div class="flex flex-wrap gap-4">
               <div v-for="role in availableRoles" :key="role" class="flex items-center">
                 <Checkbox v-model="form.roles" :inputId="'role_'+role" :name="role" :value="role" />
                 <label :for="'role_'+role" class="ml-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">{{ role }}</label>
               </div>
             </div>
           </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="closeModal" />
        <Button label="Save" icon="pi pi-check" @click="saveMenu" :loading="isSaving" />
      </template>
    </Dialog>

    <Dialog 
      v-model:visible="isBulkModalOpen" 
      header="권한 일괄 적용 (Bulk Update Roles)" 
      modal 
      class="p-fluid w-full max-w-sm"
    >
      <div class="flex flex-col gap-4 mt-2">
        <p class="text-sm text-slate-600 dark:text-slate-400">
          선택된 <strong>{{ selectedCount }}</strong>개의 메뉴에 적용할 권한을 선택하세요.
          <br><span class="text-xs text-rose-500">* 기존 권한은 선택한 권한으로 덮어씌워집니다.</span>
        </p>
        <div class="p-3 border rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
          <div class="flex flex-col gap-2">
            <div v-for="role in availableRoles" :key="role" class="flex items-center">
              <Checkbox v-model="bulkRoles" :inputId="'bulk_'+role" :name="role" :value="role" />
              <label :for="'bulk_'+role" class="ml-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">{{ role }}</label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="isBulkModalOpen = false" />
        <Button label="Apply" icon="pi pi-check" @click="saveBulkRoles" :loading="isSaving" severity="help" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMenuManagementStore } from '@/stores/menuManagement'; 

import Button from 'primevue/button';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import TreeSelect from 'primevue/treeselect';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar'; 
import AvatarGroup from 'primevue/avatargroup'; 
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const menuStore = useMenuManagementStore();
const confirm = useConfirm();
const toast = useToast();

const menuNodes = ref<any[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isModalOpen = ref(false);
const isBulkModalOpen = ref(false);
const editMode = ref(false);
const selectedKeys = ref<any>({});

const form = ref({
  id: null as number | null,
  label: '',
  routerPath: '',
  parentId: null as number | null,
  icon: '', 
  sortOrder: 0,
  statusTag: '',
  roles: [] as string[]
});

const selectedParentKey = ref<string | null>(null);
const bulkRoles = ref<string[]>([]);

const availableRoles = ['MANAGER', 'USER', 'GUEST']; 
const statusTagOptions = ['Beta', 'New', 'Updated', 'Hot', 'Deprecated']; 

const iconOptions = [
  'pi pi-home', 'pi pi-th-large', 'pi pi-chart-line', 'pi pi-list', 
  'pi pi-table', 'pi pi-users', 'pi pi-cog', 'pi pi-file', 
  'pi pi-check', 'pi pi-times', 'pi pi-search', 'pi pi-bell', 
  'pi pi-calendar', 'pi pi-envelope', 'pi pi-server', 'pi pi-database',
  'pi pi-chart-bar', 'pi pi-chart-pie', 'pi pi-folder', 'pi pi-folder-open',
  'pi pi-print', 'pi pi-save', 'pi pi-trash', 'pi pi-pencil',
  'pi pi-exclamation-circle', 'pi pi-info-circle', 'pi pi-question-circle',
  'pi pi-android', 'pi pi-microchip'
];

const getStatusSeverity = (tag: string) => {
  if (!tag) return 'info';
  const t = tag.toLowerCase();
  if (t === 'new') return 'success';
  if (t === 'beta') return 'warn';
  if (t === 'hot') return 'danger';
  if (t === 'updated') return 'info';
  if (t === 'deprecated') return 'secondary';
  return 'info';
};

// [수정] Role 정렬: ADMIN -> MANAGER -> USER -> GUEST
const getSortedRoles = (roles: string[]) => {
  const allRoles = new Set(roles || []);
  allRoles.add('ADMIN'); // Admin은 항상 표시

  const order: Record<string, number> = {
    'ADMIN': 1,
    'MANAGER': 2,
    'USER': 3,
    'GUEST': 4
  };

  return Array.from(allRoles).sort((a, b) => {
    return (order[a] || 99) - (order[b] || 99);
  });
};

// [수정] Role별 색상 매핑 (사이드바와 일치)
const getRoleColorClass = (role: string) => {
  const r = role.toUpperCase();
  // ADMIN: Red/Rose (사이드바 일치)
  if (r === 'ADMIN') return '!bg-gradient-to-br !from-red-500 !to-rose-600';
  // MANAGER: Emerald/Teal (안전/관리)
  if (r === 'MANAGER') return '!bg-gradient-to-br !from-emerald-500 !to-teal-500';
  // USER: Indigo/Purple (일반 사용자)
  if (r === 'USER') return '!bg-gradient-to-br !from-indigo-500 !to-purple-600';
  // GUEST: Slate/Gray (게스트)
  if (r === 'GUEST') return '!bg-gradient-to-br !from-slate-500 !to-gray-500';
  
  return '!bg-gray-400';
};

const parentOptions = computed(() => {
  const transform = (nodes: any[]): any[] => {
    return nodes.map(node => ({
      key: node.key,
      label: node.data.label,
      data: node.data,
      children: node.children ? transform(node.children) : undefined,
      selectable: true
    }));
  };
  return transform(menuNodes.value);
});

const selectedCount = computed(() => {
  if (!selectedKeys.value) return 0;
  return Object.values(selectedKeys.value).filter((v: any) => v.checked).length;
});

const hasSelection = computed(() => selectedCount.value > 0);

const loadMenuData = async () => {
  isLoading.value = true;
  try {
    await menuStore.fetchMenus();
    menuNodes.value = menuStore.menuTree; 
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Load Failed', detail: 'Failed to load menu data', life: 3000 });
  } finally {
    isLoading.value = false;
  }
};

const openNewMenuModal = () => {
  editMode.value = false;
  form.value = { 
    id: null, 
    label: '', 
    routerPath: '', 
    parentId: null, 
    icon: '', 
    sortOrder: 0, 
    statusTag: '',
    roles: [] 
  };
  selectedParentKey.value = null;
  isModalOpen.value = true;
};

const editMenu = (node: any) => {
  editMode.value = true;
  const data = node.data;
  form.value = {
    id: data.id,
    label: data.label,
    routerPath: data.routerPath,
    parentId: data.parentId,
    icon: data.icon || '', 
    sortOrder: data.sortOrder || 0,
    statusTag: data.statusTag || '', 
    roles: [...(data.roles || [])]
  };
  
  if (data.parentId) {
    selectedParentKey.value = String(data.parentId);
  } else {
    selectedParentKey.value = null;
  }
  
  isModalOpen.value = true;
};

const openBulkRoleModal = () => {
  bulkRoles.value = [];
  isBulkModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveMenu = async () => {
  if (!form.value.label) {
    alert("Menu Label is required.");
    return;
  }
  
  let pId: number | null = null;
  if (selectedParentKey.value) {
    if (typeof selectedParentKey.value === 'object') {
      const keys = Object.keys(selectedParentKey.value);
      if (keys.length > 0) pId = Number(keys[0]);
    } else {
      pId = Number(selectedParentKey.value);
    }
  }
  form.value.parentId = pId;

  isSaving.value = true;
  try {
    if (editMode.value && form.value.id) {
      await menuStore.updateMenu(form.value.id, form.value);
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Menu updated successfully', life: 3000 });
    } else {
      await menuStore.createMenu(form.value);
      toast.add({ severity: 'success', summary: 'Created', detail: 'Menu created successfully', life: 3000 });
    }
    await loadMenuData();
    closeModal();
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save menu', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const saveBulkRoles = async () => {
  if (!selectedKeys.value) return;
  
  const idsToUpdate: number[] = [];
  
  Object.entries(selectedKeys.value).forEach(([key, val]: [string, any]) => {
    if (val.checked) {
      idsToUpdate.push(Number(key));
    }
  });

  if (idsToUpdate.length === 0) {
    isBulkModalOpen.value = false;
    return;
  }

  isSaving.value = true;
  try {
    const promises = idsToUpdate.map(id => {
      return menuStore.updateMenu(id, { roles: bulkRoles.value });
    });
    
    await Promise.all(promises);
    
    toast.add({ severity: 'success', summary: 'Bulk Updated', detail: `${idsToUpdate.length} menus updated`, life: 3000 });
    await loadMenuData();
    isBulkModalOpen.value = false;
    selectedKeys.value = {}; 
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update roles', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const confirmDeleteMenu = (node: any) => {
  confirm.require({
    message: `Are you sure you want to delete '${node.data.label}'?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await menuStore.deleteMenu(node.data.id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Menu deleted', life: 3000 });
        loadMenuData();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete menu', life: 3000 });
      }
    }
  });
};

onMounted(() => {
  loadMenuData();
});
</script>

<style scoped>
:deep(.p-treetable .p-treetable-tbody > tr > td) {
  @apply py-2 px-4 text-sm border-b border-slate-100 dark:border-zinc-800 align-middle;
}
:deep(.p-treetable .p-treetable-thead > tr > th) {
  @apply bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 text-xs uppercase font-bold py-3 px-4 border-b border-slate-200 dark:border-zinc-800;
}
:deep(.p-treetable-toggler) {
  @apply w-6 h-6 mr-1 text-slate-400;
}
:deep(.p-treeselect-label) {
  @apply text-sm py-2;
}

:deep(.p-avatar-group .p-avatar) {
  @apply border-2 border-white dark:border-zinc-900 -ml-3 first:ml-0;
}
</style>
