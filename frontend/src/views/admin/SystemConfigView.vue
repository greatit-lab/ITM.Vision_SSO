<!-- frontend/src/views/admin/SystemConfigView.vue -->
<template>
  <div class="h-full flex flex-col gap-4">
    <div class="shrink-0">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white">시스템 설정</h2>
      <p class="text-xs text-slate-500">에러 심각도 기준 및 분석 지표 등 전역 설정을 관리합니다.</p>
    </div>

    <div class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      <Tabs value="0">
        <TabList>
          <Tab value="0">에러 심각도 (err_severity_map)</Tab>
          <Tab value="1">분석 지표 (cfg_lot_uniformity)</Tab>
        </TabList>
        <TabPanels class="!p-0 flex-1 overflow-auto">
          
          <TabPanel value="0" class="h-full">
            <div class="p-4 h-full flex flex-col gap-3">
              <div class="flex justify-end">
                <Button label="Add Rule" icon="pi pi-plus" size="small" @click="openSeverityDialog()" />
              </div>
              <div class="flex-1 overflow-hidden border rounded border-slate-200 dark:border-zinc-800">
                <DataTable 
                  :value="severities" 
                  scrollable 
                  scrollHeight="flex" 
                  class="text-xs p-datatable-sm" 
                  stripedRows
                >
                   <Column field="id" header="ID" style="width: 10%"></Column>
                   <Column field="errorId" header="Error ID" style="width: 25%"></Column>
                   <Column field="severity" header="Severity" style="width: 20%">
                     <template #body="{ data }">
                       <span :class="getSeverityClass(data.severity)">{{ data.severity }}</span>
                     </template>
                   </Column>
                   <Column field="description" header="Description" style="width: 30%"></Column>
                   <Column header="Action" style="width: 15%" align="center">
                     <template #body="{ data }">
                       <Button icon="pi pi-pencil" text rounded severity="info" size="small" @click="openSeverityDialog(data)" />
                       <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="removeSeverity(data.id)" />
                     </template>
                   </Column>
                </DataTable>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1" class="h-full">
            <div class="p-4 h-full flex flex-col gap-3">
              <div class="flex justify-end">
                 <Button label="Add Metric" icon="pi pi-plus" size="small" @click="openMetricDialog()" />
              </div>
               <div class="flex-1 overflow-hidden border rounded border-slate-200 dark:border-zinc-800">
                <DataTable 
                  :value="metrics" 
                  scrollable 
                  scrollHeight="flex" 
                  class="text-xs p-datatable-sm" 
                  stripedRows
                >
                  <Column field="metricName" header="Metric Name" style="width: 40%"></Column>
                  <Column field="isExcluded" header="Excluded" style="width: 20%">
                    <template #body="{ data }">
                      <span :class="data.isExcluded === 'Y' ? 'text-red-500 font-bold' : 'text-slate-400'">
                        {{ data.isExcluded === 'Y' ? 'Yes' : 'No' }}
                      </span>
                    </template>
                  </Column>
                  <Column header="Action" style="width: 20%" align="center">
                     <template #body="{ data }">
                       <Button icon="pi pi-pencil" text rounded severity="info" size="small" @click="openMetricDialog(data)" />
                       <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="removeMetric(data.metricName)" />
                     </template>
                   </Column>
                </DataTable>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <Dialog v-model:visible="sevDialog.visible" modal :header="sevDialog.isEdit ? 'Edit Severity' : 'Add Severity'" :style="{ width: '30rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Error ID</label>
          <InputText v-model="sevForm.errorId" class="!text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Severity</label>
          <Dropdown v-model="sevForm.severity" :options="['High', 'Medium', 'Low', 'Info']" class="!text-sm w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Description</label>
          <InputText v-model="sevForm.description" class="!text-sm" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="sevDialog.visible = false" />
        <Button label="Save" @click="saveSeverity" />
      </template>
    </Dialog>

    <Dialog v-model:visible="metDialog.visible" modal :header="metDialog.isEdit ? 'Edit Metric' : 'Add Metric'" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold">Metric Name</label>
          <InputText v-model="metForm.metricName" :disabled="metDialog.isEdit" class="!text-sm" />
        </div>
        <div class="flex items-center gap-2">
           <Checkbox v-model="metForm.isExcluded" binary inputId="exCheck" />
           <label for="exCheck" class="text-sm">Exclude this metric</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="metDialog.visible = false" />
        <Button label="Save" @click="saveMetric" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import * as AdminApi from '@/api/admin';

// --- Severity Logic ---
const severities = ref([]);
const sevDialog = reactive({ visible: false, isEdit: false });
const sevForm = reactive({ id: 0, errorId: '', severity: 'Medium', description: '' });

const loadSeverities = async () => {
  const res = await AdminApi.getSeverities();
  severities.value = res.data;
};

const openSeverityDialog = (item?: any) => {
  sevDialog.visible = true;
  sevDialog.isEdit = !!item;
  if (item) {
    Object.assign(sevForm, item);
  } else {
    sevForm.id = 0;
    sevForm.errorId = '';
    sevForm.severity = 'Medium';
    sevForm.description = '';
  }
};

const saveSeverity = async () => {
  if (sevDialog.isEdit) {
    await AdminApi.updateSeverity(sevForm.id, sevForm);
  } else {
    await AdminApi.addSeverity(sevForm);
  }
  sevDialog.visible = false;
  loadSeverities();
};

const removeSeverity = async (id: number) => {
  if(confirm('Delete this rule?')) {
    await AdminApi.deleteSeverity(id);
    loadSeverities();
  }
};

const getSeverityClass = (sev: string) => {
  if (sev === 'High') return 'text-red-600 font-bold';
  if (sev === 'Medium') return 'text-orange-500 font-bold';
  if (sev === 'Low') return 'text-green-600';
  return 'text-slate-500';
};

// --- Metrics Logic ---
const metrics = ref([]);
const metDialog = reactive({ visible: false, isEdit: false });
const metForm = reactive({ metricName: '', isExcluded: false });

const loadMetrics = async () => {
  const res = await AdminApi.getMetrics();
  metrics.value = res.data;
};

const openMetricDialog = (item?: any) => {
  metDialog.visible = true;
  metDialog.isEdit = !!item;
  if (item) {
    metForm.metricName = item.metricName;
    metForm.isExcluded = item.isExcluded === 'Y';
  } else {
    metForm.metricName = '';
    metForm.isExcluded = false;
  }
};

const saveMetric = async () => {
  const payload = {
    metricName: metForm.metricName,
    isExcluded: metForm.isExcluded ? 'Y' : 'N'
  };
  
  if (metDialog.isEdit) {
    await AdminApi.updateMetric(metForm.metricName, payload);
  } else {
    await AdminApi.addMetric(payload);
  }
  metDialog.visible = false;
  loadMetrics();
};

const removeMetric = async (name: string) => {
  if(confirm(`Delete metric '${name}'?`)) {
    await AdminApi.deleteMetric(name);
    loadMetrics();
  }
};

onMounted(() => {
  loadSeverities();
  loadMetrics();
});
</script>

<style scoped>
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  @apply bg-slate-50 dark:bg-[#111111] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-200 dark:border-zinc-800;
}
:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  @apply py-1 text-[11px] border-b border-slate-100 dark:border-zinc-800/30;
}
</style>
