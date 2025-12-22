<!-- frontend/src/views/admin/InfraManagementView.vue -->
<template>
  <div class="flex flex-col h-full gap-4">
    <div class="flex items-end justify-between shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">
          인프라 관리
        </h2>
        <p class="text-xs text-slate-500">
          장비(Equipment), SDWT 정보를 관리합니다.
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

    <div
      class="flex-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col"
    >
      <Tabs value="0">
        <TabList
          class="border-b bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
        >
          <Tab value="0"
            ><i class="mr-2 pi pi-desktop"></i>장비 목록 (ref_equipment)</Tab
          >
          <Tab value="1"
            ><i class="mr-2 pi pi-sitemap"></i>SDWT 구성 (ref_sdwt)</Tab
          >
        </TabList>
        <TabPanels class="!p-0 flex-1 overflow-auto">
          <TabPanel value="0" class="h-full">
            <div class="flex flex-col h-full gap-3 p-4">
              <div
                class="flex flex-wrap items-end gap-3 p-3 border rounded-lg bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
              >
                <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <label class="text-xs font-semibold text-slate-500"
                    >검색어 (ID, IP, PC명)</label
                  >
                  <div class="relative">
                    <i
                      class="absolute text-sm -translate-y-1/2 pi pi-search left-3 top-1/2 text-slate-400"
                    ></i>
                    <InputText
                      v-model="filters.keyword"
                      placeholder="검색어를 입력하세요"
                      class="!pl-9 !py-2 w-full text-sm"
                      @keydown.enter="applyFilter"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-1 w-[150px]">
                  <label class="text-xs font-semibold text-slate-500"
                    >상태</label
                  >
                  <Select
                    v-model="filters.status"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="전체"
                    showClear
                    class="w-full !text-sm"
                  />
                </div>

                <div class="flex gap-2 pb-[1px]">
                  <Button
                    label="초기화"
                    icon="pi pi-filter-slash"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="resetFilter"
                  />
                </div>
              </div>

              <div class="flex-1 overflow-hidden border rounded-lg">
                <DataTable
                  :value="filteredEquipments"
                  scrollable
                  scrollHeight="flex"
                  class="h-full text-xs p-datatable-sm"
                  stripedRows
                  :loading="loading"
                  tableStyle="min-width: 50rem"
                >
                  <Column
                    field="eqpid"
                    header="EQP ID"
                    sortable
                    style="width: 15%; font-weight: bold"
                  ></Column>
                  <Column
                    field="sdwt"
                    header="SDWT"
                    sortable
                    style="width: 15%"
                  ></Column>
                  <Column
                    header="상태"
                    sortable
                    field="agentStatus.status"
                    style="width: 10%"
                  >
                    <template #body="{ data }">
                      <Tag
                        :value="data.agentStatus?.status || 'OFFLINE'"
                        :severity="
                          data.agentStatus?.status === 'ONLINE'
                            ? 'success'
                            : 'danger'
                        "
                        class="!text-[10px]"
                      />
                    </template>
                  </Column>
                  <Column
                    field="agentInfo.ipAddress"
                    header="IP Address"
                    style="width: 15%"
                  ></Column>
                  <Column
                    field="agentInfo.pcName"
                    header="PC Name"
                    style="width: 15%"
                  ></Column>
                  <Column
                    field="agentInfo.os"
                    header="OS"
                    style="width: 15%"
                  ></Column>
                  <Column
                    field="agentInfo.appVer"
                    header="App Ver"
                    style="width: 15%"
                  ></Column>

                  <template #empty>
                    <div class="p-4 text-center text-slate-500">
                      데이터가 없거나 검색 결과가 없습니다.
                    </div>
                  </template>
                </DataTable>
              </div>

              <div class="text-xs text-right text-slate-500">
                총
                <span class="font-bold text-slate-800">{{
                  filteredEquipments.length
                }}</span>
                건 / 전체 {{ equipments.length }} 건
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1" class="h-full">
            <div class="flex flex-col h-full gap-2 p-4">
              <DataTable
                :value="sdwts"
                scrollable
                scrollHeight="flex"
                class="text-xs border rounded p-datatable-sm"
                stripedRows
                :loading="loading"
              >
                <Column
                  field="id"
                  header="ID (PK)"
                  sortable
                  style="width: 10%; font-weight: bold"
                ></Column>
                <Column
                  field="sdwt"
                  header="SDWT Name"
                  sortable
                  style="width: 20%; color: #2563eb"
                ></Column>
                <Column
                  field="site"
                  header="Site"
                  sortable
                  style="width: 10%"
                ></Column>
                <Column
                  field="campus"
                  header="Campus"
                  style="width: 15%"
                ></Column>
                <Column
                  field="desc"
                  header="Description"
                  style="width: 30%"
                ></Column>
                <Column
                  field="isUse"
                  header="Use"
                  align="center"
                  style="width: 10%"
                >
                  <template #body="{ data }">
                    <span
                      :class="
                        data.isUse === 'Y'
                          ? 'text-green-600 font-bold'
                          : 'text-slate-400'
                      "
                      >{{ data.isUse }}</span
                    >
                  </template>
                </Column>
                <Column field="update" header="Updated" style="width: 15%">
                  <template #body="{ data }">
                    {{ new Date(data.update).toLocaleDateString() }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
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
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";
import Select from "primevue/select";

// API
import { 
  getInfraEquipment, 
  getInfraSdwt
} from "@/api/infra";

const loading = ref(false);
const equipments = ref([]);
const sdwts = ref([]);

// --- 1. 검색 필터 로직 ---
const filters = reactive({
  keyword: "",
  status: null,
});

const statusOptions = [
  { label: "ONLINE", value: "ONLINE" },
  { label: "OFFLINE", value: "OFFLINE" },
];

const filteredEquipments = computed(() => {
  if (!equipments.value) return [];
  return equipments.value.filter((item: any) => {
    const keyword = filters.keyword.toLowerCase();
    const matchKeyword =
      !keyword ||
      item.eqpid?.toLowerCase().includes(keyword) ||
      item.agentInfo?.ipAddress?.includes(keyword) ||
      item.agentInfo?.pcName?.toLowerCase().includes(keyword);
    const matchStatus =
      !filters.status || item.agentStatus?.status === filters.status;
    return matchKeyword && matchStatus;
  });
});

const applyFilter = () => {
  console.log("Filters applied:", filters);
};

const resetFilter = () => {
  filters.keyword = "";
  filters.status = null;
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
  } catch (e) {
    console.error("Failed to load infra data", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
});
</script>
