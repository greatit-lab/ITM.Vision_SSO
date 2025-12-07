<!-- frontend/src/views/EquipmentExplorerView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-2 px-1 pt-2 mb-2 shrink-0 pl-2">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-teal-600 pi pi-desktop dark:text-teal-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          ITM Equip Specs
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Equipment specification registry & version control.
        </span>
      </div>
    </div>

    <div
      class="mx-2 mb-2 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div
        class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="selectedSite"
            :options="sites"
            placeholder="Select Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="selectedSdwt"
            :options="sdwts"
            placeholder="Select SDWT"
            :disabled="!selectedSite"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[180px] relative shrink-0">
          <i
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pi pi-search z-10 text-[10px]"
          ></i>
          <InputText
            v-model="globalFilter"
            placeholder="Search specs..."
            class="w-full !pl-7 custom-input-text small !bg-slate-50 dark:!bg-zinc-800/50"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-th-large"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Cards'"
          class="!w-7 !h-7 !text-xs transition-colors"
          :class="
            viewMode === 'grid'
              ? '!text-teal-600 dark:!text-teal-400 bg-teal-50 dark:bg-teal-900/20'
              : '!text-slate-400 hover:!text-slate-600 dark:!text-zinc-500'
          "
          @click="viewMode = 'grid'"
        />
        <Button
          icon="pi pi-list"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'List'"
          class="!w-7 !h-7 !text-xs transition-colors"
          :class="
            viewMode === 'list'
              ? '!text-teal-600 dark:!text-teal-400 bg-teal-50 dark:bg-teal-900/20'
              : '!text-slate-400 hover:!text-slate-600 dark:!text-zinc-500'
          "
          @click="viewMode = 'list'"
        />
      </div>
    </div>

    <div
      class="flex-1 min-h-0 w-full px-2 pb-2 overflow-hidden grid grid-rows-1 grid-cols-1"
    >
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center h-full z-50 bg-[#F8FAFC]/80 dark:bg-[#09090B]/80 backdrop-blur-sm row-start-1 col-start-1"
      >
        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
        <p class="mt-4 text-xs font-medium text-slate-400 animate-pulse">
          Loading Specifications...
        </p>
      </div>

      <div
        v-else-if="filteredRecords.length > 0"
        class="w-full h-full row-start-1 col-start-1 overflow-hidden flex flex-col"
      >
        <div
          v-if="viewMode === 'grid'"
          class="flex-1 overflow-y-auto scrollbar-hide pr-1"
        >
          <div
            class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 animate-fade-in pb-2"
          >
            <div
              v-for="item in filteredRecords"
              :key="item.eqpId"
              class="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border group rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-lg hover:border-teal-500/50 dark:hover:border-teal-500/50"
            >
              <div
                class="absolute top-0 left-0 w-full h-1"
                :class="
                  item.isOnline
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-zinc-700'
                "
              ></div>

              <div class="p-4 flex flex-col h-full">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      class="text-sm font-black text-slate-800 dark:text-slate-100"
                    >
                      {{ item.eqpId }}
                    </h3>
                    <span class="text-[10px] text-slate-400 font-mono">{{
                      item.type || "Unknown"
                    }}</span>
                  </div>
                  <span
                    class="px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border"
                    :class="
                      item.isOnline
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'
                        : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700'
                    "
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="
                        item.isOnline
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-slate-400'
                      "
                    ></span>
                    {{ item.isOnline ? "On" : "Off" }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 flex-1">
                  <div class="flex flex-col">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase mb-0.5"
                      >Model</span
                    >
                    <span
                      class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate"
                      >{{ item.systemModel || "-" }}</span
                    >
                  </div>
                  <div class="flex flex-col">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase mb-0.5"
                      >Serial</span
                    >
                    <span
                      class="text-xs font-medium text-slate-600 dark:text-slate-300 truncate"
                      >{{ item.serialNum || "-" }}</span
                    >
                  </div>
                  <div
                    class="col-span-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <span
                        class="text-[9px] font-bold text-slate-400 uppercase"
                        >App / Ver</span
                      >
                      <i class="pi pi-box text-[10px] text-indigo-400"></i>
                    </div>
                    <div class="flex justify-between items-center">
                      <span
                        class="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[60%]"
                        >{{ item.application || "N/A" }}</span
                      >
                      <span
                        class="text-xs font-mono font-medium text-slate-600 dark:text-slate-300"
                        >v{{ item.version || "0.0" }}</span
                      >
                    </div>
                  </div>
                </div>

                <div
                  class="pt-2 mt-auto border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center"
                >
                  <span class="text-[9px] text-slate-400"
                    >DB Ver: {{ item.dbVersion || "-" }}</span
                  >
                  <span
                    class="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                    >{{ formatDate(item.lastContact) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col w-full h-full overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 animate-fade-in relative"
        >
          <div
            class="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-10"
          >
            <div class="flex items-center gap-2">
              <div class="w-1 h-3 bg-teal-500 rounded-full"></div>
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
                Equipment List
              </h3>
            </div>

            <div
              class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium">Rows:</span>
                <select
                  v-model="rowsPerPage"
                  @change="first = 0"
                  class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option :value="15">15</option>
                  <option :value="30">30</option>
                  <option :value="50">50</option>
                </select>
              </div>

              <span class="font-medium min-w-[70px] text-right">
                {{ totalRecords === 0 ? 0 : first + 1 }} -
                {{ Math.min(first + rowsPerPage, totalRecords) }} /
                {{ totalRecords }}
              </span>

              <div class="flex items-center gap-1">
                <button
                  @click="first = 0"
                  :disabled="first === 0"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-double-left"></i>
                </button>
                <button
                  @click="prevPage"
                  :disabled="first === 0"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-left"></i>
                </button>
                <button
                  @click="nextPage"
                  :disabled="first + rowsPerPage >= totalRecords"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-right"></i>
                </button>
                <button
                  @click="lastPage"
                  :disabled="first + rowsPerPage >= totalRecords"
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-double-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 w-0 min-w-full overflow-hidden relative">
            <DataTable
              :value="filteredRecords"
              :first="first"
              :rows="rowsPerPage"
              :paginator="false"
              class="p-datatable-sm text-xs custom-header-group absolute inset-0"
              stripedRows
              showGridlines
              scrollable
              scrollHeight="flex"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    header="Status"
                    :rowspan="2"
                    frozen
                    style="width: 60px"
                  />
                  <Column
                    header="EQP ID"
                    :rowspan="2"
                    frozen
                    sortable
                    field="eqpId"
                    style="width: 120px"
                  />
                  <Column
                    header="ITM INFO"
                    :colspan="6"
                    headerClass="text-center bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold"
                  />
                  <Column
                    header="HOST SERVER INFO"
                    :colspan="10"
                    headerClass="text-center bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold"
                  />
                  <Column
                    header="Last Contact"
                    :rowspan="2"
                    field="lastContact"
                    style="width: 140px"
                  />
                </Row>

                <Row>
                  <Column
                    header="Type"
                    field="type"
                    sortable
                    style="min-width: 80px"
                    headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                  />
                  <Column
                    header="Model"
                    field="systemModel"
                    sortable
                    style="min-width: 100px"
                    headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                  />
                  <Column
                    header="App"
                    field="application"
                    sortable
                    style="min-width: 120px"
                    headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                  />
                  <Column
                    header="App Ver"
                    field="version"
                    style="min-width: 80px"
                    headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                  />
                  <Column
                    header="DB Ver"
                    field="dbVersion"
                    style="min-width: 80px"
                    headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                  />
                  <Column
                    header="Serial"
                    field="serialNum"
                    style="min-width: 120px"
                    headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                  />

                  <Column
                    header="PC Name"
                    field="pcName"
                    sortable
                    style="min-width: 120px"
                  />
                  <Column
                    header="IP"
                    field="ipAddress"
                    style="min-width: 120px"
                  />
                  <Column
                    header="MAC"
                    field="macAddress"
                    style="min-width: 140px"
                  />
                  <Column header="OS" style="min-width: 180px" />
                  <Column
                    header="Locale"
                    field="locale"
                    style="min-width: 80px"
                  />
                  <Column
                    header="Timezone"
                    field="timezone"
                    style="min-width: 80px"
                  />
                  <Column header="CPU" field="cpu" style="min-width: 200px" />
                  <Column
                    header="Mem"
                    field="memory"
                    style="min-width: 100px"
                  />
                  <Column header="Disk" field="disk" style="min-width: 150px" />
                  <Column header="VGA" field="vga" style="min-width: 150px" />
                </Row>
              </ColumnGroup>

              <Column frozen header="Status">
                <template #body="{ data }">
                  <div class="flex justify-center">
                    <span
                      v-tooltip.top="data.isOnline ? 'Online' : 'Offline'"
                      class="relative flex w-2.5 h-2.5"
                    >
                      <span
                        v-if="data.isOnline"
                        class="absolute inline-flex w-full h-full rounded-full opacity-75 bg-emerald-400 animate-ping"
                      ></span>
                      <span
                        class="relative inline-flex w-2.5 h-2.5 rounded-full"
                        :class="
                          data.isOnline
                            ? 'bg-emerald-500'
                            : 'bg-slate-300 dark:bg-zinc-600'
                        "
                      ></span>
                    </span>
                  </div>
                </template>
              </Column>

              <Column
                field="eqpId"
                frozen
                class="font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-900"
              ></Column>

              <Column field="type"
                ><template #body="{ data }"
                  ><span
                    class="font-medium text-slate-600 dark:text-slate-300"
                    >{{ data.type }}</span
                  ></template
                ></Column
              >
              <Column field="systemModel"></Column>
              <Column field="application"
                ><template #body="{ data }"
                  ><span
                    class="font-bold text-indigo-600 dark:text-indigo-400"
                    >{{ data.application }}</span
                  ></template
                ></Column
              >
              <Column field="version"
                ><template #body="{ data }"
                  ><span class="font-mono">{{ data.version }}</span></template
                ></Column
              >
              <Column field="dbVersion"
                ><template #body="{ data }"
                  ><span class="font-mono text-slate-500">{{
                    data.dbVersion
                  }}</span></template
                ></Column
              >
              <Column field="serialNum"
                ><template #body="{ data }"
                  ><span class="font-mono text-[10px]">{{
                    data.serialNum
                  }}</span></template
                ></Column
              >

              <Column field="pcName"></Column>
              <Column field="ipAddress">
                <template #body="{ data }">
                  <span
                    @click="copyToClipboard(data.ipAddress)"
                    class="font-mono cursor-pointer hover:text-teal-500 hover:underline"
                    title="Click to copy"
                    >{{ data.ipAddress }}</span
                  >
                </template>
              </Column>
              <Column field="macAddress"
                ><template #body="{ data }"
                  ><span class="font-mono text-[10px] text-slate-400">{{
                    data.macAddress
                  }}</span></template
                ></Column
              >
              <Column>
                <template #body="{ data }">
                  <div class="flex items-center gap-1">
                    <i class="pi pi-microsoft text-blue-500 text-[10px]"></i>
                    <span :title="formatOS(data.os, data.systemType)">{{
                      formatOS(data.os, data.systemType)
                    }}</span>
                  </div>
                </template>
              </Column>
              <Column field="locale"></Column>

              <Column field="timezone">
                <template #body="{ data }">
                  <span>{{ formatTimezone(data.timezone) }}</span>
                </template>
              </Column>

              <Column field="cpu"
                ><template #body="{ data }"
                  ><span :title="data.cpu">{{
                    formatSimpleCpu(data.cpu)
                  }}</span></template
                ></Column
              >
              <Column field="memory"></Column>
              <Column field="disk"
                ><template #body="{ data }"
                  ><span :title="data.disk">{{ data.disk }}</span></template
                ></Column
              >
              <Column field="vga"
                ><template #body="{ data }"
                  ><span :title="data.vga">{{ data.vga }}</span></template
                ></Column
              >

              <Column field="lastContact">
                <template #body="{ data }">
                  <span
                    :class="{
                      'text-rose-500 font-bold': !data.isOnline,
                      'text-slate-500': data.isOnline,
                    }"
                    >{{ formatDate(data.lastContact) }}</span
                  >
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center h-full opacity-50"
      >
        <div
          class="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-zinc-800"
        >
          <i
            class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-search"
          ></i>
        </div>
        <p class="text-sm font-bold text-slate-500">No equipment found.</p>
        <p class="text-xs text-slate-400">
          Try adjusting the filters or search query.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi, type EquipmentSpecDto } from "@/api/equipment";

// Components
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

// State
const viewMode = ref<"list" | "grid">("grid");
const selectedSite = ref("");
const selectedSdwt = ref("");
const globalFilter = ref("");
const isLoading = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const equipmentList = ref<EquipmentSpecDto[]>([]);

// Manual Pagination State
const first = ref(0);
const rowsPerPage = ref(15);

// Derived State
const filteredRecords = computed(() => {
  if (!globalFilter.value) return equipmentList.value;
  const lowerFilter = globalFilter.value.toLowerCase();

  return equipmentList.value.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(lowerFilter)
    )
  );
});

const totalRecords = computed(() => filteredRecords.value.length);

// Lifecycle
onMounted(async () => {
  try {
    sites.value = await dashboardApi.getSites();
  } catch (e) {
    console.error(e);
  }
});

// Handlers
const onSiteChange = async () => {
  selectedSdwt.value = "";
  equipmentList.value = [];
  first.value = 0;

  if (selectedSite.value) {
    isLoading.value = true;
    try {
      const [sdwtData, eqpData] = await Promise.all([
        dashboardApi.getSdwts(selectedSite.value),
        equipmentApi.getDetails(selectedSite.value),
      ]);
      sdwts.value = sdwtData;
      equipmentList.value = eqpData;
    } finally {
      isLoading.value = false;
    }
  } else {
    sdwts.value = [];
  }
};

const onSdwtChange = async () => {
  isLoading.value = true;
  first.value = 0;
  try {
    if (selectedSdwt.value) {
      equipmentList.value = await equipmentApi.getDetails(
        undefined,
        selectedSdwt.value
      );
    } else if (selectedSite.value) {
      equipmentList.value = await equipmentApi.getDetails(selectedSite.value);
    }
  } finally {
    isLoading.value = false;
  }
};

// Pagination Handlers
const prevPage = () => {
  if (first.value > 0) first.value -= rowsPerPage.value;
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value)
    first.value += rowsPerPage.value;
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
};

// Utilities
const formatOS = (os: string, sys: string) => {
  return `${
    os
      ?.replace("Microsoft Windows", "Win")
      .replace("Professional", "Pro")
      .replace("Enterprise", "Ent") || ""
  } ${sys?.replace("-bit", "") || ""}`.trim();
};

const formatSimpleCpu = (cpu: string) => {
  if (!cpu) return "-";
  return cpu.replace("Intel(R) Core(TM)", "").replace("CPU @", "").trim();
};

// [수정] 날짜 포맷 변경: 2025-09-30 -> 25-09-30, 시간 제거
const formatDate = (d: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  const yy = date.getUTCFullYear().toString().slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

// [추가] Timezone 약어 처리 함수
const formatTimezone = (tz: string) => {
  if (!tz) return "";
  switch (tz) {
    case "Korea Standard Time":
      return "KST";
    case "China Standard Time":
      return "CST";
    case "Pacific Standard Time":
      return "PST";
    case "Singapore Standard Time":
      return "SGT";
    default:
      return tz;
  }
};

const copyToClipboard = async (text: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
</script>

<style scoped>
/* Grid Animation */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Header Group Styling */
:deep(.custom-header-group .p-column-header-content) {
  justify-content: center;
}
:deep(.p-datatable-thead > tr > th) {
  background: transparent !important;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 0.5rem 0.5rem;
  font-size: 0.7rem;
  white-space: nowrap; /* 헤더 줄바꿈 방지 */
}
:deep(.dark .p-datatable-thead > tr > th) {
  border-color: #27272a;
  color: #a1a1aa;
}
:deep(.p-datatable-tbody > tr) {
  background: transparent !important;
}
:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  background-color: #18181b !important;
}
/* 줄바꿈 방지 스타일 적용 (white-space: nowrap) */
:deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

/* Dropdown & Input Styles (WaferFlatDataView Style) */
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}
:deep(.custom-input-text.small) {
  @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown),
:deep(.p-autocomplete-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg),
:deep(.p-autocomplete-dropdown svg) {
  @apply w-3 h-3;
}
</style>
