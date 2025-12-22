<!-- frontend/src/views/admin/MenuManagementView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden p-2">
    
    <div class="flex items-center justify-between px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
          <i class="text-lg text-indigo-600 pi pi-verified dark:text-indigo-400"></i>
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Integrated Authority Management
          </h1>
          <p class="text-slate-400 dark:text-slate-500 font-medium text-[10px]">
            시스템 메뉴 구조, 운영자 권한 및 보안 접근 제어(Whitelist) 통합 관리
          </p>
        </div>
      </div>
      <div class="flex gap-1">
        <Button 
          icon="pi pi-refresh" 
          label="Refresh"
          text 
          size="small"
          class="!text-slate-500 hover:!bg-slate-100 dark:hover:!bg-zinc-800 !text-xs"
          @click="refreshAllData" 
        />
      </div>
    </div>

    <div class="flex flex-1 gap-2 min-h-0 overflow-hidden">
      
      <div class="flex flex-col w-4/12 min-w-[350px] bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        <div class="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
          <div class="flex items-center gap-2">
            <i class="pi pi-sitemap text-slate-500 text-xs"></i>
            <span class="font-bold text-xs text-slate-700 dark:text-slate-200">Menu Structure</span>
            <Tag :value="totalMenus" severity="secondary" class="!h-4 !text-[9px] !px-1" />
          </div>
          <div class="flex gap-1">
             <Button 
              v-if="hasSelection"
              icon="pi pi-shield" 
              class="!w-6 !h-6 !bg-indigo-500 !border-indigo-500 !rounded"
              v-tooltip="'Bulk Permissions'"
              @click="openBulkRoleModal"
            />
            <Button 
              icon="pi pi-plus" 
              class="!w-6 !h-6 !bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 !border-none !rounded"
              v-tooltip="'Add New Menu'"
              @click="openNewMenuModal" 
            />
          </div>
        </div>

        <div class="flex-1 overflow-hidden relative">
          <TreeTable
            :value="menuNodes"
            :loading="isLoadingMenu"
            scrollable
            scrollHeight="flex"
            class="w-full text-xs p-treetable-sm custom-treetable h-full"
            :rowHover="true"
            v-model:selectionKeys="selectedKeys"
            selectionMode="checkbox"
            :resizableColumns="true"
            columnResizeMode="fit"
          >
            <template #empty>
              <div class="flex flex-col items-center justify-center h-40 text-slate-400 opacity-60">
                <p>No menu items found.</p>
              </div>
            </template>

            <Column field="label" header="Menu Name" expander style="width: 50%">
              <template #body="slotProps">
                <div class="flex items-center gap-1.5 py-0.5">
                  <i v-if="slotProps.node.data.icon" :class="slotProps.node.data.icon" class="text-slate-400 text-[10px]"></i>
                  <span class="font-bold text-slate-700 dark:text-slate-200 truncate">{{ slotProps.node.data.label }}</span>
                  <span v-if="slotProps.node.data.statusTag" class="text-[8px] px-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">{{ slotProps.node.data.statusTag }}</span>
                </div>
              </template>
            </Column>

            <Column field="roles" header="Access" style="width: 35%">
              <template #body="slotProps">
                <div class="flex items-center -space-x-1.5 hover:space-x-1 transition-all">
                  <span 
                    v-for="role in getSortedRoles(slotProps.node.data.roles)" 
                    :key="role"
                    class="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white border-2 border-white dark:border-zinc-900 shadow-sm cursor-help transition-transform hover:scale-110 hover:z-10"
                    :class="getRoleColorClass(role)"
                    v-tooltip.top="role"
                  >
                    {{ role.charAt(0) }}
                  </span>
                  <span v-if="!slotProps.node.data.roles?.length" class="text-[9px] text-slate-300 dark:text-zinc-600 italic pl-2">All</span>
                </div>
              </template>
            </Column>

            <Column style="width: 15%; text-align: center">
              <template #body="slotProps">
                <div class="flex justify-center gap-1">
                  <i class="pi pi-pencil text-slate-300 hover:text-indigo-500 cursor-pointer text-[10px]" @click="editMenu(slotProps.node)"></i>
                  <i class="pi pi-trash text-slate-300 hover:text-red-500 cursor-pointer text-[10px]" @click="confirmDeleteMenu(slotProps.node)"></i>
                </div>
              </template>
            </Column>
          </TreeTable>
        </div>
      </div>

      <div class="flex flex-col w-8/12 gap-2 overflow-hidden">
        
        <div class="flex flex-col h-[30%] bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
           <div class="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
             <div class="flex items-center gap-2">
               <i class="pi pi-lock text-slate-500 text-xs"></i>
               <span class="font-bold text-xs text-slate-700 dark:text-slate-200">접근 허용 (Whitelist)</span>
             </div>
             <Button label="Add IP/Code" icon="pi pi-plus" size="small" class="!text-[10px] !h-6 !px-2 !bg-emerald-600 !border-emerald-600" @click="openAccessDialog" />
           </div>

           <DataTable
              :value="accessCodes"
              :loading="isLoadingSecurity"
              scrollable
              scrollHeight="flex"
              class="flex-1 text-xs p-datatable-sm border-none"
              stripedRows
            >
              <template #empty>
                <div class="p-4 text-center text-slate-400">화이트리스트 데이터가 없습니다.</div>
              </template>
              
              <Column field="compid" header="Comp Code" sortable style="width: 12%; font-weight: bold"></Column>
              
              <Column field="deptid" header="Dept Code" sortable style="width: 12%" class="font-mono text-indigo-600 dark:text-indigo-400"></Column>
              
              <Column header="Department Name" style="width: 20%">
                 <template #body="slotProps">
                   <span class="text-slate-700 dark:text-slate-300 font-medium">
                     {{ slotProps.data.deptName || '-' }}
                   </span>
                 </template>
              </Column>
              
              <Column field="description" header="Comment" style="width: 36%"></Column>
              
              <Column field="isActive" header="Status" align="center" style="width: 10%">
                <template #body="slotProps">
                  <i class="pi" :class="slotProps.data.isActive === 'Y' ? 'pi-check-circle text-green-500' : 'pi-ban text-slate-300'"></i>
                </template>
              </Column>
              
              <Column header="Action" style="width: 10%" align="center">
                <template #body="slotProps">
                  <div class="flex justify-center gap-1">
                    <i class="pi pi-pencil text-slate-300 hover:text-blue-500 cursor-pointer text-[10px]" @click="editAccessCode(slotProps.data)"></i>
                    <i class="pi pi-trash text-slate-300 hover:text-red-500 cursor-pointer text-[10px]" @click="removeAccessCode(slotProps.data.compid)"></i>
                  </div>
                </template>
              </Column>
           </DataTable>
        </div>

        <div class="flex flex-col h-[70%] bg-white dark:bg-[#111111] rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
           <div class="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#111111] shrink-0">
             <div class="flex items-center gap-3">
               <div class="flex items-center gap-2">
                 <i class="pi pi-id-card text-slate-500 text-xs"></i>
                 <span class="font-bold text-xs text-slate-700 dark:text-slate-200">운영 권한 (Managers)</span>
               </div>
               <div class="flex items-center gap-2 px-2 py-0.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-100 dark:border-zinc-800">
                  <span class="text-[9px] text-slate-400 font-bold uppercase">MY SESSION:</span>
                  <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{{ currentUserId }}</span>
               </div>
             </div>
             <Button label="Add Manager" icon="pi pi-user-plus" size="small" outlined class="!text-[10px] !h-6 !px-2" @click="openAdminDialog" />
           </div>

           <DataTable
              :value="filteredAdmins"
              :loading="isLoadingSecurity"
              scrollable
              scrollHeight="flex"
              class="flex-1 text-xs p-datatable-sm border-none"
              stripedRows
            >
              <template #empty>
                <div class="p-4 text-center text-slate-400">등록된 운영자가 없습니다.</div>
              </template>
              <Column field="loginId" header="User ID" sortable style="width: 30%">
                <template #body="slotProps">
                  <div class="flex items-center gap-2">
                    <Avatar :label="slotProps.data.loginId.charAt(0).toUpperCase()" shape="circle" class="!w-6 !h-6 !text-[10px] !bg-slate-100 dark:!bg-zinc-800 !font-bold" />
                    <span class="font-bold text-slate-700 dark:text-slate-200">{{ slotProps.data.loginId }}</span>
                  </div>
                </template>
              </Column>
              
              <Column field="role" header="Role" sortable style="width: 20%">
                <template #body="slotProps">
                   <div class="flex items-center">
                     <span 
                       class="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white border-2 border-white dark:border-zinc-900 shadow-sm cursor-help"
                       :class="getRoleColorClass(slotProps.data.role)"
                       v-tooltip.top="slotProps.data.role"
                     >
                       {{ slotProps.data.role.charAt(0) }}
                     </span>
                   </div>
                </template>
              </Column>
              
              <Column field="assignedBy" header="Assigned By" style="width: 30%" class="text-slate-500"></Column>
              <Column field="assignedAt" header="Date" sortable style="width: 20%">
                <template #body="slotProps">{{ formatDateShort(slotProps.data.assignedAt) }}</template>
              </Column>
              <Column header="Action" style="width: 50px" align="center">
                <template #body="slotProps">
                  <div class="flex justify-center">
                    <i class="pi pi-trash text-slate-300 hover:text-red-500 cursor-pointer text-[10px]" @click="removeAdmin(slotProps.data.loginId)"></i>
                  </div>
                </template>
              </Column>
           </DataTable>
        </div>

      </div>
    </div>

    <Dialog 
      v-model:visible="isMenuModalOpen" 
      :header="editMode ? 'Edit Menu' : 'New Menu'" 
      modal 
      class="p-fluid w-full max-w-md custom-dialog"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div>
           <label class="block text-xs font-bold text-slate-500 mb-1">Name</label>
           <InputText v-model="menuForm.label" class="!text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
           <div>
             <label class="block text-xs font-bold text-slate-500 mb-1">Path</label>
             <InputText v-model="menuForm.routerPath" class="!text-sm font-mono" placeholder="/path" />
           </div>
           <div>
             <label class="block text-xs font-bold text-slate-500 mb-1">Order</label>
             <InputNumber v-model="menuForm.sortOrder" class="!text-sm" showButtons :min="0" />
           </div>
        </div>
        <div>
           <label class="block text-xs font-bold text-slate-500 mb-1">Parent</label>
           <TreeSelect v-model="selectedParentKey" :options="parentOptions" placeholder="Root" class="!text-sm" showClear />
        </div>
        <div>
           <label class="block text-xs font-bold text-slate-500 mb-1">Icon</label>
           <div class="flex items-center gap-2">
              <i :class="menuForm.icon || 'pi pi-image'" class="text-xl text-slate-400"></i>
              <InputText v-model="menuForm.icon" placeholder="pi pi-home" class="!text-sm flex-1" />
           </div>
        </div>
        <div>
           <label class="block text-xs font-bold text-slate-500 mb-1">Roles</label>
           <div class="flex gap-4">
             <div v-for="role in availableRoles" :key="role" class="flex items-center">
               <Checkbox v-model="menuForm.roles" :inputId="'r_'+role" :name="role" :value="role" />
               <label :for="'r_'+role" class="ml-1 text-sm">{{ role }}</label>
             </div>
           </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="isMenuModalOpen = false" />
        <Button label="Save" @click="saveMenu" :loading="isSaving" />
      </template>
    </Dialog>

    <Dialog v-model:visible="adminDialogVisible" header="Add Manager" modal class="w-full max-w-sm">
      <div class="flex flex-col gap-3 pt-2">
        <div>
          <label class="font-bold text-xs text-slate-500">User ID</label>
          <InputText v-model="newAdmin.loginId" class="w-full mt-1" placeholder="Enter User ID" />
        </div>
        <div>
          <label class="font-bold text-xs text-slate-500">Role</label>
          <div class="p-2 bg-slate-100 rounded text-sm font-bold mt-1">MANAGER</div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="adminDialogVisible = false" />
        <Button label="Grant Permission" severity="success" @click="saveAdmin" />
      </template>
    </Dialog>

    <Dialog v-model:visible="accessDialogVisible" :header="isAccessEditMode ? 'Edit Whitelist' : 'Add Whitelist'" modal class="w-full max-w-sm">
      <div class="flex flex-col gap-3 pt-2">
         <div>
            <label class="font-bold text-xs text-slate-500">Company Code (PK)</label>
            <InputText v-model="newAccess.compid" class="w-full mt-1" :disabled="isAccessEditMode" />
         </div>
         <div>
            <label class="font-bold text-xs text-slate-500">Dept Code</label>
            <InputText v-model="newAccess.deptid" class="w-full mt-1" />
         </div>
         <div>
            <label class="font-bold text-xs text-slate-500">Comment</label>
            <InputText v-model="newAccess.description" class="w-full mt-1" />
         </div>
         <div class="flex items-center gap-2 mt-2">
            <Checkbox v-model="newAccess.isActive" binary inputId="ac_active" />
            <label for="ac_active" class="text-sm">Is Active</label>
         </div>
      </div>
      <template #footer>
         <Button label="Cancel" text severity="secondary" @click="accessDialogVisible = false" />
         <Button label="Save" @click="saveAccessCode" />
      </template>
    </Dialog>

    <Dialog v-model:visible="isBulkModalOpen" header="Bulk Permissions" modal class="w-full max-w-sm">
      <div class="flex flex-col gap-3 pt-2">
         <p class="text-sm text-slate-600">Apply roles to {{ selectedCount }} selected menus:</p>
         <div class="flex flex-col gap-2 p-3 bg-slate-50 rounded border">
            <div v-for="role in availableRoles" :key="role" class="flex items-center">
              <Checkbox v-model="bulkRoles" :inputId="'b_'+role" :name="role" :value="role" />
              <label :for="'b_'+role" class="ml-2 text-sm">{{ role }}</label>
            </div>
         </div>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="isBulkModalOpen = false" />
        <Button label="Apply" severity="help" @click="saveBulkRoles" :loading="isSaving" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useMenuManagementStore } from '@/stores/menuManagement';
import { useAuthStore } from "@/stores/auth";
import * as AdminApi from "@/api/admin";

// PrimeVue Components
import Button from 'primevue/button';
import TreeTable from 'primevue/treetable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import TreeSelect from 'primevue/treeselect';
import Tag from 'primevue/tag';
import Avatar from "primevue/avatar";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

// --- Stores & Hooks ---
const menuStore = useMenuManagementStore();
const authStore = useAuthStore();
const confirm = useConfirm();
const toast = useToast();

const currentUserId = computed(() => authStore.user?.userId || "Unknown");

// --- State: Menu Management ---
const menuNodes = ref<any[]>([]);
const isLoadingMenu = ref(false);
const isSaving = ref(false);
const isMenuModalOpen = ref(false);
const isBulkModalOpen = ref(false);
const editMode = ref(false);
const selectedKeys = ref<any>({});
const bulkRoles = ref<string[]>([]);
const selectedParentKey = ref<string | null>(null);

const menuForm = reactive({
  id: null as number | null,
  label: '',
  routerPath: '',
  parentId: null as number | null,
  icon: '', 
  sortOrder: 0,
  statusTag: '',
  roles: [] as string[]
});

const availableRoles = ['MANAGER', 'USER', 'GUEST'];
const statusTagOptions = ['Beta', 'New', 'Updated', 'Hot', 'Deprecated'];

// --- State: Security Management ---
const admins = ref<any[]>([]);
const accessCodes = ref<any[]>([]);
const isLoadingSecurity = ref(false);

const adminDialogVisible = ref(false);
const newAdmin = ref({ loginId: "", role: "MANAGER", assignedBy: "" });

const accessDialogVisible = ref(false);
const isAccessEditMode = ref(false);
const newAccess = ref({ compid: "", deptid: "", description: "", isActive: true });

// --- Computed ---
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

const filteredAdmins = computed(() => {
  return admins.value.filter((admin: any) => admin.role === "MANAGER");
});

// --- Methods: Common Helpers ---
const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString();
};

const getRoleSeverity = (role: string) => {
  if (role === 'MANAGER') return 'success';
  if (role === 'ADMIN') return 'danger';
  return 'info';
};

const getRoleColorClass = (role: string) => {
  if (role === 'MANAGER') return 'bg-emerald-500 border-emerald-600';
  if (role === 'USER') return 'bg-indigo-500 border-indigo-600';
  if (role === 'GUEST') return 'bg-slate-500 border-slate-600';
  return 'bg-gray-400';
};

const getSortedRoles = (roles: string[]) => {
  if (!roles) return [];
  const order: Record<string, number> = { 'MANAGER': 1, 'USER': 2, 'GUEST': 3 };
  return [...roles].sort((a, b) => (order[a] || 99) - (order[b] || 99));
};

// --- Methods: Data Loading ---
const loadMenuData = async () => {
  isLoadingMenu.value = true;
  try {
    await menuStore.fetchMenus();
    menuNodes.value = menuStore.menuTree; 
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Menu Load Failed', life: 3000 });
  } finally {
    isLoadingMenu.value = false;
  }
};

const loadSecurityData = async () => {
  isLoadingSecurity.value = true;
  try {
    const [a, ac] = await Promise.all([
      AdminApi.getAdmins(),
      AdminApi.getAccessCodes()
    ]);
    admins.value = a.data;
    accessCodes.value = ac.data;
  } catch (e) {
    console.error("Failed to fetch security data", e);
  } finally {
    isLoadingSecurity.value = false;
  }
};

const refreshAllData = () => {
  loadMenuData();
  loadSecurityData();
};

// --- Methods: Menu Actions ---
const openNewMenuModal = () => {
  editMode.value = false;
  Object.assign(menuForm, { id: null, label: '', routerPath: '', parentId: null, icon: '', sortOrder: 0, statusTag: '', roles: [] });
  selectedParentKey.value = null;
  isMenuModalOpen.value = true;
};

const editMenu = (node: any) => {
  editMode.value = true;
  const data = node.data;
  Object.assign(menuForm, {
    id: data.id,
    label: data.label,
    routerPath: data.routerPath ? data.routerPath.replace(/^\//, '') : '',
    parentId: data.parentId,
    icon: data.icon || '', 
    sortOrder: data.sortOrder || 0,
    statusTag: data.statusTag || '', 
    roles: [...(data.roles || [])]
  });
  selectedParentKey.value = data.parentId ? String(data.parentId) : null;
  isMenuModalOpen.value = true;
};

const saveMenu = async () => {
  if (!menuForm.label) return;
  
  let path = menuForm.routerPath.trim();
  if (path && !path.startsWith('/')) path = '/' + path;
  
  let pId: number | null = null;
  if (selectedParentKey.value) {
    pId = typeof selectedParentKey.value === 'object' 
      ? Number(Object.keys(selectedParentKey.value)[0]) 
      : Number(selectedParentKey.value);
  }

  const payload = { ...menuForm, routerPath: path, parentId: pId };
  isSaving.value = true;
  try {
    if (editMode.value && menuForm.id) {
      await menuStore.updateMenu(menuForm.id, payload);
      toast.add({ severity: 'success', summary: 'Updated', life: 2000 });
    } else {
      await menuStore.createMenu(payload);
      toast.add({ severity: 'success', summary: 'Created', life: 2000 });
    }
    await loadMenuData();
    isMenuModalOpen.value = false;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save menu.', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const confirmDeleteMenu = (node: any) => {
  confirm.require({
    message: `Delete '${node.data.label}'?`,
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await menuStore.deleteMenu(node.data.id);
      loadMenuData();
    }
  });
};

const openBulkRoleModal = () => {
  bulkRoles.value = [];
  isBulkModalOpen.value = true;
};

const saveBulkRoles = async () => {
  if (!selectedKeys.value) return;
  const idsToUpdate: number[] = [];
  Object.entries(selectedKeys.value).forEach(([key, val]: [string, any]) => {
    if (val.checked) idsToUpdate.push(Number(key));
  });
  if (idsToUpdate.length === 0) return;

  isSaving.value = true;
  try {
    await Promise.all(idsToUpdate.map(id => menuStore.updateMenu(id, { roles: bulkRoles.value })));
    toast.add({ severity: 'success', summary: 'Bulk Updated', life: 2000 });
    await loadMenuData();
    isBulkModalOpen.value = false;
    selectedKeys.value = {}; 
  } finally {
    isSaving.value = false;
  }
};

// --- Methods: Admin (Manager) Actions ---
const openAdminDialog = () => {
  newAdmin.value = { loginId: "", role: "MANAGER", assignedBy: currentUserId.value };
  adminDialogVisible.value = true;
};

const saveAdmin = async () => {
  if (!newAdmin.value.loginId) return;
  const payload = { ...newAdmin.value, role: "MANAGER", assignedBy: currentUserId.value || "System" };
  try {
    await AdminApi.addAdmin(payload);
    adminDialogVisible.value = false;
    loadSecurityData();
    toast.add({ severity: 'success', summary: 'Manager Added', life: 2000 });
  } catch (e) {
    alert("Error saving manager.");
  }
};

const removeAdmin = async (id: string) => {
  confirm.require({
    message: `Remove manager ${id}?`,
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await AdminApi.deleteAdmin(id);
      loadSecurityData();
    }
  });
};

// --- Methods: Access Code Actions ---
const openAccessDialog = () => {
  isAccessEditMode.value = false;
  newAccess.value = { compid: "", deptid: "", description: "", isActive: true };
  accessDialogVisible.value = true;
};

const editAccessCode = (data: any) => {
  isAccessEditMode.value = true;
  newAccess.value = {
    compid: data.compid,
    deptid: data.deptid,
    description: data.description,
    isActive: data.isActive === "Y",
  };
  accessDialogVisible.value = true;
};

const saveAccessCode = async () => {
  if (!newAccess.value.compid || !newAccess.value.deptid) return;
  const payload = { ...newAccess.value, isActive: newAccess.value.isActive ? "Y" : "N" };
  try {
    if (isAccessEditMode.value) {
      await AdminApi.updateAccessCode(newAccess.value.compid, payload);
    } else {
      await AdminApi.createAccessCode(payload);
    }
    accessDialogVisible.value = false;
    loadSecurityData();
    toast.add({ severity: 'success', summary: 'Whitelist Saved', life: 2000 });
  } catch (e) {
    alert("Error saving whitelist.");
  }
};

const removeAccessCode = async (id: string) => {
  confirm.require({
    message: `Delete access code ${id}?`,
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await AdminApi.deleteAccessCode(id);
      loadSecurityData();
    }
  });
};

onMounted(() => {
  refreshAllData();
});
</script>

<style scoped>
/* TreeTable Custom Styling */
:deep(.custom-treetable .p-treetable-thead > tr > th) {
  @apply bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 !py-2 text-[10px] font-extrabold uppercase border-b border-slate-100 dark:border-zinc-800 tracking-wider;
}
:deep(.custom-treetable .p-treetable-tbody > tr > td) {
  @apply !py-1.5 text-[11px] text-slate-600 dark:text-slate-300 border-b border-slate-50 dark:border-zinc-800/30 align-middle;
}
:deep(.custom-treetable .p-treetable-tbody > tr:hover) {
  @apply bg-slate-50/80 dark:bg-zinc-800/30 cursor-pointer;
}

/* DataTable Custom Styling (No Border) */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
}
</style>
