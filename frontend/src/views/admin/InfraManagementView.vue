<!-- frontend/src/views/admin/InfraManagementView.vue -->
<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">
          인프라 관리
        </h2>
        <p class="text-xs text-slate-500">
          장비(Equipment) 및 SDWT 정보를 관리합니다.
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        size="small"
        outlined
        @click="loadAllData"
      />
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
      <Tabs value="0" class="flex flex-col h-full">
        <TabList class="shrink-0 border-b bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <Tab value="0" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-desktop"></i>장비 목록 (ref_equipment)</Tab>
          <Tab value="1" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-sitemap"></i>SDWT 구성 (ref_sdwt)</Tab>
        </TabList>
        
        <TabPanels class="!p-0 flex-1 overflow-hidden flex flex-col min-h-0">
          
          <TabPanel value="0" class="flex flex-col h-full min-h-0">
            <div class="flex flex-col h-full gap-3 p-4 min-h-0">
              
              <div class="flex flex-wrap items-end justify-between gap-3 p-0 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#111111] shrink-0">
                <div class="flex items-end gap-2 flex-1 max-w-2xl">
                  <div class="flex-1">
                    <div class="relative">
                      <i class="absolute text-sm -translate-y-1/2 pi pi-search left-3 top-1/2 text-slate-400"></i>
                      <InputText
                        v-model="filters.eqpId"
                        placeholder="EQP ID"
                        class="!pl-9 !py-1.5 w-full text-xs"
                      />
                    </div>
                  </div>
                  <div class="flex-1">
                    <InputText
                      v-model="filters.indexLine"
                      placeholder="Index Line"
                      class="!py-1.5 w-full text-xs"
                    />
                  </div>
                  <div class="flex-1">
                    <InputText
                      v-model="filters.sdwt"
                      placeholder="SDWT"
                      class="!py-1.5 w-full text-xs"
                    />
                  </div>
                  <Button
                    icon="pi pi-filter-slash"
                    severity="secondary"
                    outlined
                    size="small"
                    class="!py-1.5 !px-3"
                    v-tooltip.top="'필터 초기화'"
                    @click="resetFilter"
                  />
                </div>

                <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">Rows:</span>
                    <select
                      v-model="eqpRows"
                      @change="eqpFirst = 0"
                      class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                      <option :value="100">100</option>
                    </select>
                  </div>
                  <span class="font-medium min-w-[60px] text-right">
                    {{ eqpTotalRecords === 0 ? 0 : eqpFirst + 1 }} -
                    {{ Math.min(eqpFirst + eqpRows, eqpTotalRecords) }} /
                    {{ eqpTotalRecords }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button
                      @click="eqpFirst = 0"
                      :disabled="eqpFirst === 0"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-double-left text-[10px]"></i>
                    </button>
                    <button
                      @click="prevEqpPage"
                      :disabled="eqpFirst === 0"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-left text-[10px]"></i>
                    </button>
                    <button
                      @click="nextEqpPage"
                      :disabled="eqpFirst + eqpRows >= eqpTotalRecords"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-right text-[10px]"></i>
                    </button>
                    <button
                      @click="lastEqpPage"
                      :disabled="eqpFirst + eqpRows >= eqpTotalRecords"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-double-right text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg border-slate-200 dark:border-zinc-800 min-h-0">
                <DataTable
                  :value="filteredEquipments"
                  paginator
                  :rows="eqpRows"
                  v-model:first="eqpFirst"
                  scrollable
                  scrollHeight="flex"
                  class="h-full text-xs p-datatable-sm [&_.p-paginator]:hidden"
                  stripedRows
                  :loading="loading"
                  tableStyle="min-width: 80rem"
                  removableSort
                  sortField="eqpid"
                  :sortOrder="1"
                >
                  <Column field="eqpid" header="EQP ID" sortable style="min-width: 120px; font-weight: bold"></Column>
                  <Column field="lineCode" header="Line Code" sortable style="min-width: 100px"></Column>
                  <Column field="simaxLine" header="Simax Line" sortable style="min-width: 100px"></Column>
                  <Column field="indexLine" header="Index Line" sortable style="min-width: 100px">
                     <template #body="{ data }">
                      <span v-html="highlightText(data.indexLine, filters.indexLine)"></span>
                    </template>
                  </Column>
                  <Column field="maker" header="Maker" sortable style="min-width: 100px"></Column>
                  <Column field="model" header="Model" sortable style="min-width: 120px"></Column>
                  <Column field="prcGroup" header="Prc Group" sortable style="min-width: 120px"></Column>
                  <Column field="bay" header="Bay" style="min-width: 80px"></Column>
                  <Column field="sdwt" header="SDWT" sortable style="min-width: 100px; color: #2563eb">
                    <template #body="{ data }">
                      <span v-html="highlightText(data.sdwt, filters.sdwt)"></span>
                    </template>
                  </Column>
                  <Column field="lastUpdate" header="Last Update" style="min-width: 130px">
                    <template #body="{ data }">
                      {{ formatDateTime(data.lastUpdate) }}
                    </template>
                  </Column>

                  <template #empty>
                    <div class="p-4 text-center text-slate-500">
                      데이터가 없거나 검색 결과가 없습니다.
                    </div>
                  </template>
                </DataTable>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1" class="flex flex-col h-full min-h-0">
            <div class="flex flex-col h-full gap-3 p-4 min-h-0">
              
              <div class="flex flex-wrap items-center justify-between gap-3 p-0 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#111111] shrink-0">
                <Button 
                  label="SDWT 추가" 
                  icon="pi pi-plus" 
                  size="small" 
                  class="!py-1.5 !text-xs"
                  @click="openSdwtDialog" 
                />

                <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">Rows:</span>
                    <select
                      v-model="sdwtRows"
                      @change="sdwtFirst = 0"
                      class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                  </div>
                  <span class="font-medium min-w-[60px] text-right">
                    {{ sdwtTotalRecords === 0 ? 0 : sdwtFirst + 1 }} -
                    {{ Math.min(sdwtFirst + sdwtRows, sdwtTotalRecords) }} /
                    {{ sdwtTotalRecords }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button
                      @click="sdwtFirst = 0"
                      :disabled="sdwtFirst === 0"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-double-left text-[10px]"></i>
                    </button>
                    <button
                      @click="prevSdwtPage"
                      :disabled="sdwtFirst === 0"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-left text-[10px]"></i>
                    </button>
                    <button
                      @click="nextSdwtPage"
                      :disabled="sdwtFirst + sdwtRows >= sdwtTotalRecords"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-right text-[10px]"></i>
                    </button>
                    <button
                      @click="lastSdwtPage"
                      :disabled="sdwtFirst + sdwtRows >= sdwtTotalRecords"
                      class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <i class="pi pi-angle-double-right text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg border-slate-200 dark:border-zinc-800 min-h-0">
                <DataTable
                  :value="sdwts"
                  paginator
                  :rows="sdwtRows"
                  v-model:first="sdwtFirst"
                  scrollable
                  scrollHeight="flex"
                  class="h-full text-xs p-datatable-sm compact-table [&_.p-paginator]:hidden"
                  stripedRows
                  :loading="loading"
                  removableSort
                  sortField="id"
                  :sortOrder="1"
                >
                  <Column field="id" header="ID (PK)" sortable style="width: 10%; font-weight: bold"></Column>
                  <Column field="sdwt" header="SDWT Name" sortable style="width: 15%; color: #2563eb"></Column>
                  <Column field="site" header="Site" sortable style="width: 10%"></Column>
                  <Column field="campus" header="Campus" style="width: 10%"></Column>
                  <Column field="desc" header="Description" style="width: 25%"></Column>
                  <Column field="isUse" header="Use" align="center" style="width: 10%">
                    <template #body="{ data }">
                      <span :class="data.isUse === 'Y' ? 'text-green-600 font-bold' : 'text-slate-400'">
                        {{ data.isUse }}
                      </span>
                    </template>
                  </Column>
                  <Column field="update" header="Updated" style="width: 10%">
                    <template #body="{ data }">
                      {{ formatDateTime(data.update) }}
                    </template>
                  </Column>
                  
                  <Column header="Action" align="center" style="width: 10%">
                    <template #body="{ data }">
                      <div class="flex justify-center gap-2">
                        <Button 
                          icon="pi pi-pencil" 
                          text 
                          rounded
                          severity="info" 
                          size="small" 
                          class="!p-0 !w-6 !h-6"
                          @click="editSdwt(data)" 
                        />
                        <Button 
                          icon="pi pi-trash" 
                          text 
                          rounded
                          severity="danger" 
                          size="small" 
                          class="!p-0 !w-6 !h-6"
                          @click="removeSdwt(data.id)" 
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </div>

    <Dialog 
      v-model:visible="sdwtDialogVisible" 
      modal 
      :header="isEditMode ? 'SDWT 수정' : 'SDWT 추가'" 
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-col gap-4 mb-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">ID (7자리)</label>
          <InputText v-model="sdwtForm.id" :disabled="isEditMode" placeholder="e.g. S000001" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">SDWT Name</label>
          <InputText v-model="sdwtForm.sdwt" placeholder="e.g. SDWT_NAME" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Site</label>
            <InputText v-model="sdwtForm.site" placeholder="e.g. KR" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Campus</label>
            <InputText v-model="sdwtForm.campus" placeholder="e.g. A-Campus" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Description</label>
          <InputText v-model="sdwtForm.desc" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="sdwtForm.isUse" binary inputId="isUseCheck" />
          <label for="isUseCheck" class="text-sm">사용 여부 (Use)</label>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button label="취소" severity="secondary" @click="sdwtDialogVisible = false" />
        <Button label="저장" @click="saveSdwt" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Checkbox from "primevue/checkbox";

// API Import
import { 
  getInfraEquipment, 
  getInfraSdwt,
  createInfraSdwt,
  updateInfraSdwt,
  deleteInfraSdwt
} from "@/api/infra";

const loading = ref(false);
const equipments = ref([]);
const sdwts = ref([]);

// --- Pagination Controls ---
const eqpRows = ref(20);
const eqpFirst = ref(0);
const sdwtRows = ref(20);
const sdwtFirst = ref(0);

// --- Search Filters ---
const filters = reactive({
  eqpId: "",
  indexLine: "",
  sdwt: "",
});

const filteredEquipments = computed(() => {
  if (!equipments.value) return [];
  return equipments.value.filter((item: any) => {
    // 1. EQP ID
    const fEqp = filters.eqpId.toLowerCase();
    const matchEqp = !fEqp || item.eqpid?.toLowerCase().includes(fEqp);

    // 2. Index Line
    const fIdx = filters.indexLine.toLowerCase();
    const matchIdx = !fIdx || item.indexLine?.toLowerCase().includes(fIdx);

    // 3. SDWT
    const fSdwt = filters.sdwt.toLowerCase();
    const matchSdwt = !fSdwt || item.sdwt?.toLowerCase().includes(fSdwt);
      
    return matchEqp && matchIdx && matchSdwt;
  });
});

watch(() => [filters.eqpId, filters.indexLine, filters.sdwt], () => {
  eqpFirst.value = 0;
});

const eqpTotalRecords = computed(() => filteredEquipments.value.length);
const sdwtTotalRecords = computed(() => sdwts.value.length);

// Pagination Handlers
const prevEqpPage = () => {
  if (eqpFirst.value > 0) eqpFirst.value -= eqpRows.value;
};
const nextEqpPage = () => {
  if (eqpFirst.value + eqpRows.value < eqpTotalRecords.value) eqpFirst.value += eqpRows.value;
};
const lastEqpPage = () => {
  eqpFirst.value = Math.floor(Math.max(eqpTotalRecords.value - 1, 0) / eqpRows.value) * eqpRows.value;
};

const prevSdwtPage = () => {
  if (sdwtFirst.value > 0) sdwtFirst.value -= sdwtRows.value;
};
const nextSdwtPage = () => {
  if (sdwtFirst.value + sdwtRows.value < sdwtTotalRecords.value) sdwtFirst.value += sdwtRows.value;
};
const lastSdwtPage = () => {
  sdwtFirst.value = Math.floor(Math.max(sdwtTotalRecords.value - 1, 0) / sdwtRows.value) * sdwtRows.value;
};

const resetFilter = () => {
  filters.eqpId = "";
  filters.indexLine = "";
  filters.sdwt = "";
};

// --- Helper Functions ---
const highlightText = (text: string, query: string) => {
  if (!text) return "";
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<span class="bg-yellow-200 text-black">$1</span>');
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${min}`;
};

// --- Data Fetching ---
const loadAllData = async () => {
  loading.value = true;
  try {
    const [eqRes, sdwtRes] = await Promise.all([
      getInfraEquipment(),
      getInfraSdwt(),
    ]);
    equipments.value = eqRes.data;
    sdwts.value = sdwtRes.data;
    eqpFirst.value = 0;
    sdwtFirst.value = 0;
  } catch (e) {
    console.error("Failed to load infra data", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
});

// --- SDWT CRUD Logic ---
const sdwtDialogVisible = ref(false);
const isEditMode = ref(false);
const sdwtForm = reactive({
  id: "",
  sdwt: "",
  site: "",
  campus: "",
  desc: "",
  isUse: true, 
});

const openSdwtDialog = () => {
  isEditMode.value = false;
  sdwtForm.id = "";
  sdwtForm.sdwt = "";
  sdwtForm.site = "";
  sdwtForm.campus = "";
  sdwtForm.desc = "";
  sdwtForm.isUse = true;
  
  sdwtDialogVisible.value = true;
};

const editSdwt = (data: any) => {
  isEditMode.value = true;
  sdwtForm.id = data.id;
  sdwtForm.sdwt = data.sdwt;
  sdwtForm.site = data.site;
  sdwtForm.campus = data.campus;
  sdwtForm.desc = data.desc;
  sdwtForm.isUse = data.isUse === 'Y';
  
  sdwtDialogVisible.value = true;
};

const saveSdwt = async () => {
  if (!sdwtForm.id || !sdwtForm.sdwt) {
    alert("ID와 SDWT Name은 필수입니다.");
    return;
  }

  const payload = {
    ...sdwtForm,
    isUse: sdwtForm.isUse ? 'Y' : 'N'
  };

  try {
    if (isEditMode.value) {
      const { id, ...updateData } = payload;
      await updateInfraSdwt(id, updateData);
    } else {
      await createInfraSdwt(payload);
    }
    sdwtDialogVisible.value = false;
    loadAllData(); 
  } catch (e) {
    console.error(e);
    alert("저장에 실패했습니다.");
  }
};

const removeSdwt = async (id: string) => {
  if (!confirm(`SDWT(${id})를 삭제하시겠습니까?`)) return;
  try {
    await deleteInfraSdwt(id);
    loadAllData();
  } catch (e) {
    console.error(e);
    alert("삭제에 실패했습니다.");
  }
};
</script>

<style scoped>
/* 공통 헤더/바디 스타일 (기본) */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
}

/* [중요] .compact-table 클래스가 있는 테이블(SDWT)만 행 높이를 강제로 줄임 */
:deep(.compact-table .p-datatable-tbody > tr > td) {
  @apply !py-0.5; /* SDWT 전용: 행 간격 축소 */
}
</style>
