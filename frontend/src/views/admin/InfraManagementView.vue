<!-- frontend/src/views/admin/InfraManagementView.vue -->
<template>
  <div class="flex flex-col h-full gap-4 overflow-hidden">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">
          인프라 관리
        </h2>
        <p class="text-xs text-slate-500">
          장비(Equipment), SDWT, 에러 정책 및 분석 지표를 관리합니다.
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="새로고침"
        size="small"
        outlined
        @click="refreshCurrentTab"
      />
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0 relative">
      <Tabs v-model:value="activeTab" class="flex flex-col h-full">
        <TabList class="shrink-0 border-b bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <Tab value="0" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-desktop"></i>장비 목록</Tab>
          <Tab value="1" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-sitemap"></i>SDWT 구성</Tab>
          <Tab value="2" class="!py-2.5 !px-4 text-xs font-bold transition-all"><i class="mr-2 pi pi-cog"></i>설정 관리 (심각도/지표)</Tab>
        </TabList>
        
        <TabPanels class="!p-0 flex-1 overflow-hidden h-full flex flex-col min-h-0">
          
          <TabPanel value="0" class="h-full flex flex-col overflow-hidden min-h-0">
            <div class="flex flex-col h-full gap-3 p-4 min-h-0">
              <div class="flex flex-wrap items-end justify-between gap-3 p-1 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#111111] shrink-0">
                <div class="flex items-center gap-2 flex-1 max-w-2xl">
                  <div class="flex-1">
                    <InputText v-model="filters.eqpId" placeholder="EQP ID" class="!py-1.5 w-full text-xs" />
                  </div>
                  <div class="flex-1">
                    <InputText v-model="filters.indexLine" placeholder="Index Line" class="!py-1.5 w-full text-xs" />
                  </div>
                  <div class="flex-1">
                    <InputText v-model="filters.sdwt" placeholder="SDWT" class="!py-1.5 w-full text-xs" />
                  </div>
                  <Button icon="pi pi-filter-slash" severity="secondary" outlined size="small" class="!py-1.5 !px-3" @click="resetFilter" />
                </div>

                <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">Rows:</span>
                    <select v-model="eqpRows" @change="eqpFirst = 0" class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium cursor-pointer">
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                      <option :value="100">100</option>
                    </select>
                  </div>
                  <span class="font-medium min-w-[60px] text-right">
                    {{ eqpTotalRecords === 0 ? 0 : eqpFirst + 1 }} - {{ Math.min(eqpFirst + eqpRows, eqpTotalRecords) }} / {{ eqpTotalRecords }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button @click="eqpFirst = 0" :disabled="eqpFirst === 0" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-double-left text-[10px]"></i></button>
                    <button @click="prevEqpPage" :disabled="eqpFirst === 0" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-left text-[10px]"></i></button>
                    <button @click="nextEqpPage" :disabled="eqpFirst + eqpRows >= eqpTotalRecords" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-right text-[10px]"></i></button>
                    <button @click="lastEqpPage" :disabled="eqpFirst + eqpRows >= eqpTotalRecords" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-double-right text-[10px]"></i></button>
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg border-slate-200 dark:border-zinc-800 min-h-0 relative">
                <div class="absolute inset-0">
                  <DataTable
                    :value="filteredEquipments"
                    paginator :rows="eqpRows" v-model:first="eqpFirst"
                    scrollable scrollHeight="100%"
                    class="h-full text-xs p-datatable-sm [&_.p-paginator]:hidden"
                    stripedRows
                    :loading="loading"
                    tableStyle="min-width: 80rem"
                    removableSort sortField="eqpid" :sortOrder="1"
                  >
                    <Column field="eqpid" header="EQP ID" sortable style="min-width: 120px; font-weight: bold"></Column>
                    <Column field="lineCode" header="Line Code" sortable style="min-width: 100px"></Column>
                    <Column field="indexLine" header="Index Line" sortable style="min-width: 100px"></Column>
                    <Column field="maker" header="Maker" sortable style="min-width: 100px"></Column>
                    <Column field="model" header="Model" sortable style="min-width: 120px"></Column>
                    <Column field="bay" header="Bay" style="min-width: 80px"></Column>
                    <Column field="sdwt" header="SDWT" sortable style="min-width: 100px; color: #2563eb"></Column>
                    <Column field="lastUpdate" header="Last Update" style="min-width: 130px">
                      <template #body="{ data }">{{ formatDateTime(data.lastUpdate) }}</template>
                    </Column>
                  </DataTable>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1" class="h-full flex flex-col overflow-hidden min-h-0">
            <div class="flex flex-col h-full gap-3 p-4 min-h-0">
              <div class="flex flex-wrap items-center justify-between gap-3 p-1 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#111111] shrink-0">
                <Button label="SDWT 추가" icon="pi pi-plus" size="small" class="!py-1.5 !text-xs" @click="openSdwtDialog" />

                <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">Rows:</span>
                    <select v-model="sdwtRows" @change="sdwtFirst = 0" class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium cursor-pointer">
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                  </div>
                  <span class="font-medium min-w-[60px] text-right">
                    {{ sdwtTotalRecords === 0 ? 0 : sdwtFirst + 1 }} - {{ Math.min(sdwtFirst + sdwtRows, sdwtTotalRecords) }} / {{ sdwtTotalRecords }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button @click="sdwtFirst = 0" :disabled="sdwtFirst === 0" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-double-left text-[10px]"></i></button>
                    <button @click="prevSdwtPage" :disabled="sdwtFirst === 0" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-left text-[10px]"></i></button>
                    <button @click="nextSdwtPage" :disabled="sdwtFirst + sdwtRows >= sdwtTotalRecords" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-right text-[10px]"></i></button>
                    <button @click="lastSdwtPage" :disabled="sdwtFirst + sdwtRows >= sdwtTotalRecords" class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"><i class="pi pi-angle-double-right text-[10px]"></i></button>
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg border-slate-200 dark:border-zinc-800 min-h-0 relative">
                <div class="absolute inset-0">
                  <DataTable
                    :value="sdwts"
                    paginator :rows="sdwtRows" v-model:first="sdwtFirst"
                    scrollable scrollHeight="100%"
                    class="h-full text-xs p-datatable-sm compact-table [&_.p-paginator]:hidden"
                    stripedRows
                    :loading="loading"
                    removableSort sortField="id" :sortOrder="1"
                  >
                    <Column field="id" header="ID (PK)" sortable style="width: 10%; font-weight: bold"></Column>
                    <Column field="sdwt" header="SDWT Name" sortable style="width: 15%; color: #2563eb"></Column>
                    <Column field="site" header="Site" sortable style="width: 10%"></Column>
                    <Column field="campus" header="Campus" style="width: 10%"></Column>
                    <Column field="desc" header="Description" style="width: 25%"></Column>
                    <Column field="isUse" header="Use" align="center" style="width: 10%">
                       <template #body="{ data }">
                        <span :class="data.isUse === 'Y' ? 'text-green-600 font-bold' : 'text-slate-400'">{{ data.isUse }}</span>
                      </template>
                    </Column>
                    <Column field="update" header="Updated" style="width: 15%">
                      <template #body="{ data }">{{ formatDateTime(data.update) }}</template>
                    </Column>
                    
                    <Column header="Action" align="center" style="width: 100px; min-width: 100px;">
                      <template #body="{ data }">
                        <div class="flex items-center justify-center gap-2 flex-nowrap w-full">
                          <Button icon="pi pi-pencil" text rounded severity="info" size="small" class="!w-6 !h-6" @click="editSdwt(data)" />
                          <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="!w-6 !h-6" @click="removeSdwt(data.id)" />
                        </div>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="2" class="h-full flex flex-col overflow-hidden min-h-0">
            <div class="flex flex-row h-full gap-4 p-4 min-h-0">
              
              <div class="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200 dark:border-zinc-800">
                <div class="flex items-center justify-between p-3 border-b shrink-0 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
                  <div class="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <i class="pi pi-exclamation-triangle text-orange-500"></i> 에러 심각도
                  </div>
                  <Button label="추가" icon="pi pi-plus" size="small" class="!py-1 !text-xs" @click="openSeverityDialog()" />
                </div>
                
                <div class="flex-1 min-h-0 overflow-hidden relative">
                  <div class="absolute inset-0">
                    <DataTable 
                      :value="severities" 
                      scrollable 
                      scrollHeight="100%" 
                      class="h-full text-xs p-datatable-sm" 
                      stripedRows :loading="loading"
                      sortField="errorId" :sortOrder="1"
                    >
                       <Column field="errorId" header="Error ID" sortable style="width: 40%; font-weight:bold"></Column>
                       <Column field="severity" header="Severity" sortable style="width: 40%">
                         <template #body="{ data }">
                           <span :class="getSeverityClass(data.severity)">{{ data.severity }}</span>
                         </template>
                       </Column>
                       <Column header="Action" align="center" style="width: 20%; min-width: 100px;">
                         <template #body="{ data }">
                           <div class="flex items-center justify-center gap-2 flex-nowrap w-full">
                             <Button icon="pi pi-pencil" text rounded severity="info" size="small" class="!w-6 !h-6" @click="openSeverityDialog(data)" />
                             <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="!w-6 !h-6" @click="removeSeverity(data.errorId)" />
                           </div>
                         </template>
                       </Column>
                    </DataTable>
                  </div>
                </div>
              </div>

              <div class="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200 dark:border-zinc-800">
                <div class="flex items-center justify-between p-3 border-b shrink-0 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
                  <div class="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <i class="pi pi-chart-bar text-blue-500"></i> 분석 지표
                  </div>
                  <Button label="추가" icon="pi pi-plus" size="small" class="!py-1 !text-xs" @click="openMetricDialog()" />
                </div>
                
                <div class="flex-1 min-h-0 overflow-hidden relative">
                  <div class="absolute inset-0">
                    <DataTable 
                      :value="metrics" 
                      scrollable 
                      scrollHeight="100%" 
                      class="h-full text-xs p-datatable-sm" 
                      stripedRows :loading="loading"
                      sortMode="multiple" :multiSortMeta="metricsMultiSortMeta"
                    >
                      <Column field="metricName" header="Metric Name" sortable style="width: 40%"></Column>
                      <Column field="isExcluded" header="Excluded" sortable style="width: 40%">
                        <template #body="{ data }">
                          <span :class="data.isExcluded === 'Y' ? 'text-red-500 font-bold' : 'text-slate-400'">
                            {{ data.isExcluded === 'Y' ? 'Yes' : 'No' }}
                          </span>
                        </template>
                      </Column>
                      <Column header="Action" align="center" style="width: 20%; min-width: 100px;">
                         <template #body="{ data }">
                           <div class="flex items-center justify-center gap-2 flex-nowrap w-full">
                             <Button icon="pi pi-pencil" text rounded severity="info" size="small" class="!w-6 !h-6" @click="openMetricDialog(data)" />
                             <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="!w-6 !h-6" @click="removeMetric(data.metricName)" />
                           </div>
                         </template>
                       </Column>
                    </DataTable>
                  </div>
                </div>
              </div>

            </div>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </div>

    <Dialog v-model:visible="sdwtDialogVisible" modal :header="isEditMode ? 'SDWT 수정' : 'SDWT 추가'" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 mb-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">ID (7자리)</label>
          <InputText v-model="sdwtForm.id" :disabled="isEditMode" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">SDWT Name</label>
          <InputText v-model="sdwtForm.sdwt" class="!text-sm" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold">Site</label>
            <InputText v-model="sdwtForm.site" class="!text-sm" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold">Campus</label>
            <InputText v-model="sdwtForm.campus" class="!text-sm" />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Description</label>
          <InputText v-model="sdwtForm.desc" class="!text-sm" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="sdwtForm.isUse" binary />
          <label class="text-sm">사용 여부 (Use)</label>
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="sdwtDialogVisible = false" />
        <Button label="저장" @click="saveSdwt" />
      </template>
    </Dialog>

    <Dialog v-model:visible="sevDialog.visible" modal :header="sevDialog.isEdit ? '에러 심각도 수정' : '에러 심각도 추가'" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Error ID</label>
          <InputText v-model="sevForm.errorId" :disabled="sevDialog.isEdit" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Severity</label>
          <Dropdown v-model="sevForm.severity" :options="['High', 'Medium', 'Low', 'Info']" class="!text-sm w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="sevDialog.visible = false" />
        <Button label="저장" @click="saveSeverity" />
      </template>
    </Dialog>

    <Dialog v-model:visible="metDialog.visible" modal :header="metDialog.isEdit ? '분석 지표 수정' : '분석 지표 추가'" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Metric Name</label>
          <InputText v-model="metForm.metricName" :disabled="metDialog.isEdit" class="!text-sm" />
        </div>
        <div class="flex items-center gap-2">
           <Checkbox v-model="metForm.isExcluded" binary />
           <label class="text-sm">제외 여부 (Exclude)</label>
        </div>
      </div>
      <template #footer>
        <Button label="취소" text severity="secondary" @click="metDialog.visible = false" />
        <Button label="저장" @click="saveMetric" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
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
import Dropdown from "primevue/dropdown";
import * as InfraApi from "@/api/infra";
import * as AdminApi from "@/api/admin";

const activeTab = ref("0");
const loading = ref(false);

const equipments = ref([]);
const sdwts = ref([]);
const severities = ref([]);
const metrics = ref([]);

// --- Pagination Variables ---
const eqpRows = ref(20);
const eqpFirst = ref(0);
const sdwtRows = ref(20);
const sdwtFirst = ref(0);

// --- [정렬] Multi Sort Meta ---
const metricsMultiSortMeta = ref([
  { field: 'isExcluded', order: -1 as const },
  { field: 'metricName', order: 1 as const }
]);

// --- Tab 0: Equipment Logic ---
const filters = reactive({ eqpId: "", indexLine: "", sdwt: "" });
const filteredEquipments = computed(() => {
  if (!equipments.value) return [];
  return equipments.value.filter((item: any) => {
    const fEqp = filters.eqpId.toLowerCase();
    const fIdx = filters.indexLine.toLowerCase();
    const fSdwt = filters.sdwt.toLowerCase();
    return (!fEqp || item.eqpid?.toLowerCase().includes(fEqp)) &&
           (!fIdx || item.indexLine?.toLowerCase().includes(fIdx)) &&
           (!fSdwt || item.sdwt?.toLowerCase().includes(fSdwt));
  });
});
const resetFilter = () => { filters.eqpId = ""; filters.indexLine = ""; filters.sdwt = ""; };

const eqpTotalRecords = computed(() => filteredEquipments.value.length);
const prevEqpPage = () => { if (eqpFirst.value > 0) eqpFirst.value -= eqpRows.value; };
const nextEqpPage = () => { if (eqpFirst.value + eqpRows.value < eqpTotalRecords.value) eqpFirst.value += eqpRows.value; };
const lastEqpPage = () => { eqpFirst.value = Math.floor(Math.max(eqpTotalRecords.value - 1, 0) / eqpRows.value) * eqpRows.value; };

// --- Tab 1: SDWT Logic ---
const sdwtTotalRecords = computed(() => sdwts.value.length);
const prevSdwtPage = () => { if (sdwtFirst.value > 0) sdwtFirst.value -= sdwtRows.value; };
const nextSdwtPage = () => { if (sdwtFirst.value + sdwtRows.value < sdwtTotalRecords.value) sdwtFirst.value += sdwtRows.value; };
const lastSdwtPage = () => { sdwtFirst.value = Math.floor(Math.max(sdwtTotalRecords.value - 1, 0) / sdwtRows.value) * sdwtRows.value; };

const sdwtDialogVisible = ref(false);
const isEditMode = ref(false);
const sdwtForm = reactive({ id: "", sdwt: "", site: "", campus: "", desc: "", isUse: true });

const openSdwtDialog = () => {
  isEditMode.value = false;
  Object.assign(sdwtForm, { id: "", sdwt: "", site: "", campus: "", desc: "", isUse: true });
  sdwtDialogVisible.value = true;
};
const editSdwt = (data: any) => {
  isEditMode.value = true;
  Object.assign(sdwtForm, { ...data, isUse: data.isUse === 'Y' });
  sdwtDialogVisible.value = true;
};
const saveSdwt = async () => {
  const payload = { ...sdwtForm, isUse: sdwtForm.isUse ? 'Y' : 'N' };
  try {
    if (isEditMode.value) await InfraApi.updateInfraSdwt(sdwtForm.id, payload);
    else await InfraApi.createInfraSdwt(payload);
    sdwtDialogVisible.value = false;
    loadSdwts();
  } catch(e) { alert("저장 실패"); }
};
const removeSdwt = async (id: string) => {
  if(confirm("삭제하시겠습니까?")) {
    await InfraApi.deleteInfraSdwt(id);
    loadSdwts();
  }
};

// --- Tab 2: Severity Logic ---
const sevDialog = reactive({ visible: false, isEdit: false });
const sevForm = reactive({ errorId: '', severity: 'Medium' });

const openSeverityDialog = (item?: any) => {
  sevDialog.visible = true;
  sevDialog.isEdit = !!item;
  if (item) Object.assign(sevForm, item);
  else Object.assign(sevForm, { errorId: '', severity: 'Medium' });
};
const saveSeverity = async () => {
  try {
    if (sevDialog.isEdit) await AdminApi.updateSeverity(sevForm.errorId, sevForm);
    else await AdminApi.addSeverity(sevForm);
    sevDialog.visible = false;
    loadSeverities();
  } catch(e) { alert("저장 실패"); }
};
const removeSeverity = async (id: string) => {
  if(confirm('삭제하시겠습니까?')) {
    await AdminApi.deleteSeverity(id);
    loadSeverities();
  }
};
const getSeverityClass = (sev: string) => {
  if (sev === 'High') return 'text-red-600 font-bold';
  if (sev === 'Medium') return 'text-orange-500 font-bold';
  return 'text-green-600';
};

// --- Tab 2 (Right): Metrics Logic ---
const metDialog = reactive({ visible: false, isEdit: false });
const metForm = reactive({ metricName: '', isExcluded: false });

const openMetricDialog = (item?: any) => {
  metDialog.visible = true;
  metDialog.isEdit = !!item;
  if(item) {
    metForm.metricName = item.metricName;
    metForm.isExcluded = item.isExcluded === 'Y';
  } else {
    metForm.metricName = '';
    metForm.isExcluded = false;
  }
};
const saveMetric = async () => {
  const payload = { metricName: metForm.metricName, isExcluded: metForm.isExcluded };
  try {
    if (metDialog.isEdit) await AdminApi.updateMetric(metForm.metricName, payload);
    else await AdminApi.addMetric(payload);
    metDialog.visible = false;
    loadMetrics();
  } catch(e) { alert("저장 실패"); }
};
const removeMetric = async (name: string) => {
  if(confirm('삭제하시겠습니까?')) {
    await AdminApi.deleteMetric(name);
    loadMetrics();
  }
};

// --- Data Fetching Helpers ---
const loadEquipments = async () => { equipments.value = (await InfraApi.getInfraEquipment()).data; };
const loadSdwts = async () => { sdwts.value = (await InfraApi.getInfraSdwt()).data; };
const loadSeverities = async () => { severities.value = (await AdminApi.getSeverities()).data; };
const loadMetrics = async () => { metrics.value = (await AdminApi.getMetrics()).data; };

const loadAllData = async () => {
  loading.value = true;
  await Promise.all([loadEquipments(), loadSdwts(), loadSeverities(), loadMetrics()]);
  loading.value = false;
};

const refreshCurrentTab = () => {
  loading.value = true;
  if(activeTab.value === '0') loadEquipments().finally(() => loading.value = false);
  else if(activeTab.value === '1') loadSdwts().finally(() => loading.value = false);
  else if(activeTab.value === '2') { 
    Promise.all([loadSeverities(), loadMetrics()]).finally(() => loading.value = false);
  }
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
/* [중요] PrimeVue Tab Panel Layout Fix */
/* 탭 패널 컨테이너와 개별 패널이 화면 높이를 채우고 넘치지 않도록 강제 */
:deep(.p-tabpanels) {
  @apply flex-1 flex flex-col h-full min-h-0 overflow-hidden !p-0;
}
:deep(.p-tabpanel) {
  @apply flex flex-col h-full min-h-0 overflow-hidden;
}

/* DataTable 기본 스타일 */
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-white dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-50 dark:border-zinc-800/30;
  
  /* 줄바꿈 방지 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* SDWT 전용 compact 스타일 */
:deep(.compact-table .p-datatable-tbody > tr > td) {
  @apply !py-0.5;
}
</style>
