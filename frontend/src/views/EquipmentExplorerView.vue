<!-- frontend/src/views/EquipmentExplorerView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex flex-col items-center justify-between gap-3 md:flex-row">
      <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i
            class="text-lg text-teal-600 pi pi-desktop dark:text-teal-400"
          ></i>
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
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
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
            showClear
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

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="selectedEqpId"
            :options="availableEqpIds"
            placeholder="Select Eqp ID"
            :disabled="!selectedSdwt || equipmentList.length === 0"
            showClear
            filter
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onEqpIdChange"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pr-1 ml-auto border-l border-slate-100 dark:border-zinc-800 pl-2"
      >
        <Button
          icon="pi pi-refresh"
          rounded
          text
          severity="secondary"
          v-tooltip.left="'Reset Filters'"
          @click="resetFilters"
          :disabled="!selectedSite"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      class="flex-1 min-h-0 w-full pb-2 overflow-hidden grid grid-rows-1 grid-cols-1"
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
        class="w-full h-full row-start-1 col-start-1 overflow-hidden flex flex-col bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 animate-fade-in relative"
      >
        <div
          class="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-10"
        >
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-teal-500 rounded-full"></div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              ITM Equip List
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
                <option :value="20">20</option>
                <option :value="40">40</option>
                <option :value="60">60</option>
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

        <div
          class="flex-1 w-0 min-w-full overflow-hidden relative equip-table-container"
        >
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
            removableSort
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="Status" :rowspan="2" style="width: 60px" />
                <Column
                  header="EQP ID"
                  :rowspan="2"
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
                  header="Application"
                  field="application"
                  style="min-width: 120px"
                  headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                />
                <Column
                  header="App Ver"
                  field="version"
                  sortable
                  style="min-width: 80px"
                  headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                />
                <Column
                  header="DB Ver"
                  field="dbVersion"
                  sortable
                  style="min-width: 80px"
                  headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                />
                <Column
                  header="Serial NUM"
                  field="serialNum"
                  style="min-width: 120px"
                  headerClass="bg-indigo-50/30 dark:bg-indigo-900/5"
                />

                <Column
                  header="PC Name"
                  field="pcName"
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
                <Column
                  header="Operation System(OS)"
                  field="os"
                  sortable
                  style="min-width: 200px"
                />
                <Column
                  header="Locale"
                  field="locale"
                  sortable
                  style="min-width: 80px"
                />
                <Column
                  header="Timezone"
                  field="timezone"
                  sortable
                  style="min-width: 80px"
                />
                <Column
                  header="CPU"
                  field="cpu"
                  sortable
                  style="min-width: 200px"
                />
                <Column
                  header="Mem"
                  field="memory"
                  sortable
                  style="min-width: 100px"
                />
                <Column header="Disk" field="disk" style="min-width: 150px" />
                <Column
                  header="VGA"
                  field="vga"
                  sortable
                  style="min-width: 150px"
                />
              </Row>
            </ColumnGroup>

            <Column header="Status">
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
              class="font-bold text-slate-700 dark:text-slate-200"
            ></Column>

            <Column field="type">
              <template #body="{ data }">
                <span class="font-medium text-slate-600 dark:text-slate-300">{{
                  data.type
                }}</span>
              </template>
            </Column>
            <Column field="systemModel"></Column>
            <Column field="application">
              <template #body="{ data }">
                <span class="font-bold text-slate-700 dark:text-slate-200">{{
                  data.application
                }}</span>
              </template>
            </Column>
            <Column field="version">
              <template #body="{ data }">
                <span class="font-mono">{{ data.version }}</span>
              </template>
            </Column>
            <Column field="dbVersion">
              <template #body="{ data }">
                <span class="font-mono text-slate-500">{{
                  data.dbVersion
                }}</span>
              </template>
            </Column>
            <Column field="serialNum">
              <template #body="{ data }">
                <span class="font-mono text-[10px]">{{ data.serialNum }}</span>
              </template>
            </Column>

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
            <Column field="macAddress">
              <template #body="{ data }">
                <span class="font-mono text-[10px] text-slate-400">{{
                  formatMacAddress(data.macAddress)
                }}</span>
              </template>
            </Column>
            <Column>
              <template #body="{ data }">
                <div class="flex items-center gap-1.5">
                  <i
                    class="pi pi-microsoft text-[10px]"
                    :class="getOsIconClass(data.os)"
                  ></i>
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

            <Column field="cpu">
              <template #body="{ data }">
                <span :title="data.cpu">{{ formatSimpleCpu(data.cpu) }}</span>
              </template>
            </Column>
            <Column field="memory"></Column>
            <Column field="disk">
              <template #body="{ data }">
                <span :title="data.disk">{{ data.disk }}</span>
              </template>
            </Column>
            <Column field="vga">
              <template #body="{ data }">
                <span :title="data.vga">{{ data.vga }}</span>
              </template>
            </Column>

            <Column field="lastContact">
              <template #body="{ data }">
                <span class="text-slate-600 dark:text-slate-400">{{
                  formatDate(data.lastContact)
                }}</span>
              </template>
            </Column>
          </DataTable>
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
        <p class="text-sm font-bold text-slate-500">
          Ready to view specifications.
        </p>
        <p class="text-xs text-slate-400">
          Please select a <b>Site</b> and <b>SDWT</b> to load data.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth"; // [추가] Auth Store
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi, type EquipmentSpecDto } from "@/api/equipment";

// Components
import Select from "primevue/select";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

// State
const authStore = useAuthStore(); // [추가]
const selectedSite = ref("");
const selectedSdwt = ref("");
const selectedEqpId = ref("");
const isLoading = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const equipmentList = ref<EquipmentSpecDto[]>([]);

// Manual Pagination State
const first = ref(0);
const rowsPerPage = ref(20);

// Derived State
const availableEqpIds = computed(() => {
  if (!equipmentList.value.length) return [];
  return [...new Set(equipmentList.value.map((item) => item.eqpId))].sort();
});

const filteredRecords = computed(() => {
  let records = equipmentList.value;

  if (selectedEqpId.value) {
    records = records.filter((item) => item.eqpId === selectedEqpId.value);
  }

  return records;
});

const totalRecords = computed(() => filteredRecords.value.length);

// Lifecycle
onMounted(async () => {
  try {
    // 1. Site 목록 로드
    sites.value = await dashboardApi.getSites();

    // 2. 기본 필터 결정 (우선순위: DB 사용자 설정 -> 페이지 전용 로컬 스토리지)
    let defaultSite = authStore.user?.site;
    let defaultSdwt = authStore.user?.sdwt;

    // DB에 없으면 로컬 스토리지 확인 (페이지 전용 키: explorer_site, explorer_sdwt)
    if (!defaultSite) {
      defaultSite = localStorage.getItem("explorer_site") || undefined;
      if (defaultSite) {
        defaultSdwt = localStorage.getItem("explorer_sdwt") || undefined;
      }
    }

    // 3. 결정된 Site가 유효하면 적용 및 SDWT 로드
    if (defaultSite && sites.value.includes(defaultSite)) {
      selectedSite.value = defaultSite;
      sdwts.value = await dashboardApi.getSdwts(defaultSite);

      // 4. SDWT 적용 및 데이터 로드
      if (defaultSdwt) {
        selectedSdwt.value = defaultSdwt;
        await loadEquipmentData(); // 데이터 로드

        // 5. EQP ID 복원 (마지막 선택 장비, 페이지 전용 키: explorer_eqpid)
        const savedEqpId = localStorage.getItem("explorer_eqpid");
        if (savedEqpId) {
          // 로드된 리스트에 해당 ID가 있는지 확인
          const exists = equipmentList.value.some(
            (e) => e.eqpId === savedEqpId
          );
          if (exists) {
            selectedEqpId.value = savedEqpId;
          } else {
            localStorage.removeItem("explorer_eqpid"); // 유효하지 않으면 삭제
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
});

// Handlers
const onSiteChange = async () => {
  if (selectedSite.value) {
    localStorage.setItem("explorer_site", selectedSite.value); // [추가] 저장
    isLoading.value = true;
    try {
      sdwts.value = await dashboardApi.getSdwts(selectedSite.value);
    } finally {
      isLoading.value = false;
    }
  } else {
    localStorage.removeItem("explorer_site");
    sdwts.value = [];
  }

  // 하위 필터 초기화
  selectedSdwt.value = "";
  localStorage.removeItem("explorer_sdwt");
  selectedEqpId.value = "";
  localStorage.removeItem("explorer_eqpid");
  equipmentList.value = [];
  first.value = 0;
};

const onSdwtChange = async () => {
  if (selectedSite.value && selectedSdwt.value) {
    localStorage.setItem("explorer_sdwt", selectedSdwt.value); // [추가] 저장
    await loadEquipmentData();
  } else {
    localStorage.removeItem("explorer_sdwt");
    equipmentList.value = [];
  }

  // 하위 필터 초기화
  selectedEqpId.value = "";
  localStorage.removeItem("explorer_eqpid");
  first.value = 0;
};

// [추가] EqpId 변경 시 저장 핸들러
const onEqpIdChange = () => {
  if (selectedEqpId.value) {
    localStorage.setItem("explorer_eqpid", selectedEqpId.value);
  } else {
    localStorage.removeItem("explorer_eqpid");
  }
  first.value = 0;
};

// [추가] 데이터 로드 로직 분리 (재사용을 위해)
const loadEquipmentData = async () => {
  isLoading.value = true;
  try {
    equipmentList.value = await equipmentApi.getDetails(
      undefined,
      selectedSdwt.value
    );
  } catch (e) {
    console.error(e);
    equipmentList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = () => {
  selectedSite.value = "";
  selectedSdwt.value = "";
  selectedEqpId.value = "";

  // [추가] 저장소 초기화
  localStorage.removeItem("explorer_site");
  localStorage.removeItem("explorer_sdwt");
  localStorage.removeItem("explorer_eqpid");

  sdwts.value = [];
  equipmentList.value = [];
  first.value = 0;
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

const getOsIconClass = (os: string | null) => {
  const lowerOs = (os || "").toLowerCase();
  if (lowerOs.includes("11")) return "text-indigo-500";
  if (lowerOs.includes("10")) return "text-blue-500";
  if (lowerOs.includes("server")) return "text-slate-500";
  if (lowerOs.includes("7")) return "text-amber-500";
  return "text-slate-400";
};

const formatSimpleCpu = (cpu: string) => {
  if (!cpu) return "-";
  return cpu.replace("Intel(R) Core(TM)", "").replace("CPU @", "").trim();
};

const formatDate = (d: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  const yy = date.getUTCFullYear().toString().slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

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
    case "Tokyo Standard Time":
      return "JST";
    default:
      return tz;
  }
};

const formatMacAddress = (mac: string | null) => {
  if (!mac) return "-";
  const cleanMac = mac.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const formatted = cleanMac.match(/.{1,2}/g)?.join("-");
  return formatted || mac;
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
  white-space: nowrap;
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
:deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

/* Dropdown & Input Styles */
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
