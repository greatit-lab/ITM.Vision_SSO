<!-- frontend/src/views/admin/MenuManagementView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden">
    
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <i class="text-lg text-indigo-500 pi pi-sitemap dark:text-indigo-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Menu & Permissions
        </h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
          Manage system navigation structure and role-based access control.
        </span>
      </div>
    </div>

    <div class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-sm shrink-0 transition-colors duration-300">
      <div class="flex items-center gap-2 px-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
          Total Menus: <span class="text-indigo-600 dark:text-indigo-400">{{ totalMenus }}</span>
        </span>
      </div>

      <div class="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-zinc-800">
        <Button 
          v-if="hasSelection"
          label="Bulk Permissions" 
          icon="pi pi-shield" 
          class="!bg-indigo-500 !border-indigo-500 hover:!bg-indigo-600 !h-8 !text-xs !px-3 !rounded-lg"
          @click="openBulkRoleModal"
        />
        
        <Button 
          label="New Menu" 
          icon="pi pi-plus" 
          class="!bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 hover:!opacity-90 !border-none !h-8 !text-xs !px-3 !rounded-lg"
          @click="openNewMenuModal" 
        />

        <Button 
          icon="pi pi-refresh" 
          text 
          rounded 
          severity="secondary" 
          v-tooltip.left="'Reload Data'"
          class="!w-8 !h-8 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
          @click="loadMenuData" 
        />
      </div>
    </div>

    <div class="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 animate-fade-in relative">
      <TreeTable
        :value="menuNodes"
        :loading="isLoading"
        scrollable
        scrollHeight="flex"
        class="flex-1 w-full text-xs p-treetable-sm custom-treetable"
        :rowHover="true"
        v-model:selectionKeys="selectedKeys"
        selectionMode="checkbox"
        :resizableColumns="true"
        columnResizeMode="fit"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
            <i class="mb-3 text-4xl pi pi-sitemap opacity-20"></i>
            <p>No menu items found.</p>
          </div>
        </template>

        <Column field="label" header="Menu Structure" expander style="width: 350px">
          <template #body="slotProps">
            <div class="flex items-center gap-2 py-1">
              <div 
                class="flex items-center justify-center w-6 h-6 rounded shrink-0 transition-colors border"
                :class="slotProps.node.data.icon ? 'bg-indigo-50 border-indigo-100 text-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400' : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700'"
              >
                <i v-if="slotProps.node.data.icon" :class="slotProps.node.data.icon" class="text-[10px]"></i>
                <i v-else class="pi pi-circle-fill text-[4px]"></i>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-700 dark:text-slate-200">
                    {{ slotProps.node.data.label }}
                  </span>
                  <Tag 
                    v-if="slotProps.node.data.statusTag" 
                    :value="slotProps.node.data.statusTag" 
                    :severity="getStatusSeverity(slotProps.node.data.statusTag)" 
                    class="!text-[9px] !h-4 !px-1.5 uppercase font-extrabold !rounded"
                  />
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="routerPath" header="Route Path" style="width: 200px">
           <template #body="slotProps">
            <span class="font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-zinc-800">
              {{ slotProps.node.data.routerPath || '/' }}
            </span>
          </template>
        </Column>

        <Column field="sortOrder" header="Order" style="width: 80px; text-align: center;">
           <template #body="slotProps">
            <span class="text-slate-400 font-mono font-bold">{{ slotProps.node.data.sortOrder }}</span>
          </template>
        </Column>

        <Column field="roles" header="Allowed Roles" style="min-width: 250px">
          <template #body="slotProps">
            <div class="flex items-center -space-x-1.5 hover:space-x-1 transition-all duration-300">
              <span 
                v-for="role in getSortedRoles(slotProps.node.data.roles)" 
                :key="role"
                class="flex items-center justify-center w-6 h-6 text-[9px] font-bold text-white rounded-full border-2 border-white dark:border-zinc-900 shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-help"
                :class="getRoleColorClass(role)"
                v-tooltip.top="role"
              >
                {{ role.charAt(0) }}
              </span>
              <span v-if="(!slotProps.node.data.roles || slotProps.node.data.roles.length === 0)" class="text-[10px] text-slate-300 dark:text-zinc-600 italic pl-2">
                All Access (Admin only)
              </span>
            </div>
          </template>
        </Column>

        <Column header="Actions" style="width: 100px; text-align: center">
          <template #body="slotProps">
            <div class="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Button 
                icon="pi pi-pencil" 
                text 
                rounded 
                severity="secondary" 
                class="!w-7 !h-7 !p-0 hover:!bg-slate-100 dark:hover:!bg-zinc-800" 
                @click="editMenu(slotProps.node)" 
              />
              <Button 
                icon="pi pi-trash" 
                text 
                rounded 
                severity="danger" 
                class="!w-7 !h-7 !p-0 hover:!bg-rose-50 dark:hover:!bg-rose-900/20" 
                @click="confirmDeleteMenu(slotProps.node)" 
              />
            </div>
          </template>
        </Column>
      </TreeTable>
    </div>

    <Dialog 
      v-model:visible="isModalOpen" 
      :header="editMode ? 'Edit Menu Item' : 'New Menu Item'" 
      modal 
      class="p-fluid w-full max-w-lg custom-dialog"
      :dismissableMask="true"
    >
      <div class="flex flex-col gap-5 mt-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Label Name</label>
            <InputText v-model="form.label" class="w-full !text-sm" placeholder="e.g. Dashboard" />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Router Path</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">/</span>
              <InputText v-model="form.routerPath" class="w-full !text-sm !pl-6 font-mono" placeholder="dashboard" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 sm:col-span-1">
             <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Parent Group</label>
             <TreeSelect 
               v-model="selectedParentKey" 
               :options="parentOptions" 
               placeholder="Root (No Parent)" 
               class="w-full !text-sm"
               :showClear="true"
             />
          </div>
          <div class="col-span-2 sm:col-span-1">
             <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sort Order</label>
             <InputNumber v-model="form.sortOrder" class="w-full !text-sm" showButtons :min="0" placeholder="0" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Menu Icon</label>
            <div class="p-3 border rounded-xl border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50">
              <div class="flex items-center gap-3 mb-2">
                <div class="flex items-center justify-center w-10 h-10 bg-white border rounded-lg shadow-sm dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
                  <i :class="form.icon || 'pi pi-image'" class="text-lg text-indigo-500"></i>
                </div>
                <InputText v-model="form.icon" placeholder="pi pi-home" class="flex-1 !text-sm" />
              </div>
              <div class="grid grid-cols-8 gap-2 mt-2 max-h-[100px] overflow-y-auto custom-scrollbar p-1">
                <div 
                  v-for="icon in popularIcons" 
                  :key="icon" 
                  @click="form.icon = icon"
                  class="flex items-center justify-center w-8 h-8 transition-all border rounded cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 dark:hover:bg-zinc-700"
                  :class="form.icon === icon ? 'bg-indigo-500 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500'"
                >
                  <i :class="icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="col-span-2">
             <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Access Roles</label>
             <div class="flex flex-wrap gap-2 p-3 bg-white border rounded-xl border-slate-200 dark:bg-zinc-900 dark:border-zinc-700">
               <div v-for="role in availableRoles" :key="role" class="flex items-center">
                 <Checkbox v-model="form.roles" :inputId="'role_'+role" :name="role" :value="role" />
                 <label :for="'role_'+role" class="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">{{ role }}</label>
               </div>
             </div>
           </div>
           
           <div class="col-span-2 sm:col-span-1">
            <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Badge Tag</label>
            <Select
              v-model="form.statusTag"
              :options="statusTagOptions"
              showClear
              placeholder="None"
              class="w-full !text-sm"
            >
              <template #option="slotProps">
                <Tag :value="slotProps.option" :severity="getStatusSeverity(slotProps.option)" class="!text-[10px] !h-5" />
              </template>
            </Select>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <Button label="Cancel" icon="pi pi-times" text severity="secondary" @click="closeModal" />
          <Button label="Save Changes" icon="pi pi-check" class="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700" @click="saveMenu" :loading="isSaving" />
        </div>
      </template>
    </Dialog>

    <Dialog 
      v-model:visible="isBulkModalOpen" 
      header="Bulk Permissions Update" 
      modal 
      class="p-fluid w-full max-w-sm custom-dialog"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="p-3 text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
          <i class="mr-2 pi pi-exclamation-triangle"></i>
          This will overwrite permissions for <strong>{{ selectedCount }}</strong> selected items.
        </div>
        <div class="p-4 border rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <label class="block text-xs font-bold text-slate-500 mb-3 uppercase">Select Roles to Apply</label>
          <div class="flex flex-col gap-3">
            <div v-for="role in availableRoles" :key="role" class="flex items-center">
              <Checkbox v-model="bulkRoles" :inputId="'bulk_'+role" :name="role" :value="role" />
              <label :for="'bulk_'+role" class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">{{ role }}</label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <Button label="Cancel" text severity="secondary" @click="isBulkModalOpen = false" />
          <Button label="Apply" icon="pi pi-check" severity="help" @click="saveBulkRoles" :loading="isSaving" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useMenuManagementStore } from '@/stores/menuManagement'; 

// Components
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
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const menuStore = useMenuManagementStore();
const confirm = useConfirm();
const toast = useToast();

// State
const menuNodes = ref<any[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isModalOpen = ref(false);
const isBulkModalOpen = ref(false);
const editMode = ref(false);
const selectedKeys = ref<any>({});

// Form Data
const form = reactive({
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

// Constants
const availableRoles = ['MANAGER', 'USER', 'GUEST']; 
const statusTagOptions = ['Beta', 'New', 'Updated', 'Hot', 'Deprecated']; 
const popularIcons = [
  'pi pi-home', 'pi pi-chart-line', 'pi pi-chart-bar', 'pi pi-chart-pie', 
  'pi pi-list', 'pi pi-table', 'pi pi-th-large', 'pi pi-objects-column',
  'pi pi-cog', 'pi pi-users', 'pi pi-server', 'pi pi-database',
  'pi pi-folder', 'pi pi-file', 'pi pi-check-circle', 'pi pi-exclamation-circle',
  'pi pi-calendar', 'pi pi-envelope', 'pi pi-bell', 'pi pi-search',
  'pi pi-android', 'pi pi-apple', 'pi pi-desktop', 'pi pi-mobile'
];

// Computed
const totalMenus = computed(() => {
  const countNodes = (nodes: any[]): number => {
    let count = 0;
    nodes.forEach(node => {
      count++;
      if(node.children) count += countNodes(node.children);
    });
    return count;
  };
  return countNodes(menuNodes.value);
});

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

// Methods
const getStatusSeverity = (tag: string) => {
  if (!tag) return 'secondary';
  const t = tag.toLowerCase();
  if (t === 'new') return 'success';
  if (t === 'beta') return 'warn';
  if (t === 'hot') return 'danger';
  if (t === 'updated') return 'info';
  return 'secondary';
};

const getRoleColorClass = (role: string) => {
  const r = role.toUpperCase();
  if (r === 'MANAGER') return 'bg-emerald-500 border-emerald-600';
  if (r === 'USER') return 'bg-indigo-500 border-indigo-600';
  if (r === 'GUEST') return 'bg-slate-500 border-slate-600';
  return 'bg-gray-400';
};

const getSortedRoles = (roles: string[]) => {
  if (!roles) return [];
  const order: Record<string, number> = { 'MANAGER': 1, 'USER': 2, 'GUEST': 3 };
  return [...roles].sort((a, b) => (order[a] || 99) - (order[b] || 99));
};

// Data Actions
const loadMenuData = async () => {
  isLoading.value = true;
  try {
    await menuStore.fetchMenus();
    menuNodes.value = menuStore.menuTree; 
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Load Failed', detail: 'Could not load menu structure.', life: 3000 });
  } finally {
    isLoading.value = false;
  }
};

const openNewMenuModal = () => {
  editMode.value = false;
  Object.assign(form, { 
    id: null, label: '', routerPath: '', parentId: null, 
    icon: '', sortOrder: 0, statusTag: '', roles: [] 
  });
  selectedParentKey.value = null;
  isModalOpen.value = true;
};

const editMenu = (node: any) => {
  editMode.value = true;
  const data = node.data;
  Object.assign(form, {
    id: data.id,
    label: data.label,
    routerPath: data.routerPath ? data.routerPath.replace(/^\//, '') : '', // Remove leading slash for display
    parentId: data.parentId,
    icon: data.icon || '', 
    sortOrder: data.sortOrder || 0,
    statusTag: data.statusTag || '', 
    roles: [...(data.roles || [])]
  });
  selectedParentKey.value = data.parentId ? String(data.parentId) : null;
  isModalOpen.value = true;
};

const openBulkRoleModal = () => {
  bulkRoles.value = [];
  isBulkModalOpen.value = true;
};

const closeModal = () => isModalOpen.value = false;

const saveMenu = async () => {
  if (!form.label) {
    toast.add({ severity: 'warn', summary: 'Validation', detail: 'Label is required.', life: 3000 });
    return;
  }
  
  // Clean router path
  let path = form.routerPath.trim();
  if (path && !path.startsWith('/')) path = '/' + path;
  
  let pId: number | null = null;
  if (selectedParentKey.value) {
    pId = typeof selectedParentKey.value === 'object' 
      ? Number(Object.keys(selectedParentKey.value)[0]) 
      : Number(selectedParentKey.value);
  }

  const payload = { ...form, routerPath: path, parentId: pId };

  isSaving.value = true;
  try {
    if (editMode.value && form.id) {
      await menuStore.updateMenu(form.id, payload);
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Menu updated successfully', life: 3000 });
    } else {
      await menuStore.createMenu(payload);
      toast.add({ severity: 'success', summary: 'Created', detail: 'New menu added', life: 3000 });
    }
    await loadMenuData();
    closeModal();
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save menu.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const saveBulkRoles = async () => {
  if (!selectedKeys.value) return;
  
  const idsToUpdate: number[] = [];
  Object.entries(selectedKeys.value).forEach(([key, val]: [string, any]) => {
    if (val.checked) idsToUpdate.push(Number(key));
  });

  if (idsToUpdate.length === 0) {
    isBulkModalOpen.value = false;
    return;
  }

  isSaving.value = true;
  try {
    // Parallel updates (Backend improvement desirable for real bulk update)
    await Promise.all(idsToUpdate.map(id => menuStore.updateMenu(id, { roles: bulkRoles.value })));
    
    toast.add({ severity: 'success', summary: 'Bulk Updated', detail: `${idsToUpdate.length} menus updated.`, life: 3000 });
    await loadMenuData();
    isBulkModalOpen.value = false;
    selectedKeys.value = {}; 
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Bulk update failed.', life: 3000 });
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
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Menu item deleted.', life: 3000 });
        loadMenuData();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete.', life: 3000 });
      }
    }
  });
};

onMounted(loadMenuData);
</script>

<style scoped>
/* Custom TreeTable Styles to match DataTable look */
:deep(.custom-treetable .p-treetable-thead > tr > th) {
  @apply bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 !py-2.5 text-[11px] font-extrabold uppercase border-b border-slate-200 dark:border-zinc-700 tracking-wider;
}
:deep(.custom-treetable .p-treetable-tbody > tr > td) {
  @apply !py-2 text-[12px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50 align-middle transition-colors;
}
:deep(.custom-treetable .p-treetable-tbody > tr:hover) {
  @apply bg-slate-50/80 dark:bg-zinc-800/30 cursor-pointer;
}
:deep(.custom-treetable .p-treetable-toggler) {
  @apply w-6 h-6 mr-1 text-slate-400 hover:text-indigo-500 transition-colors !rounded-full;
}
:deep(.custom-treetable .p-checkbox .p-checkbox-box) {
  @apply w-4 h-4 border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800;
}
:deep(.custom-treetable .p-checkbox .p-checkbox-box.p-highlight) {
  @apply bg-indigo-500 border-indigo-500;
}

/* Modal Animations */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom Scrollbar for Icon Picker */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
</style>
