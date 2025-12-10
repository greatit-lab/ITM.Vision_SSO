<!-- frontend/src/views/ErrorAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-rose-500 pi pi-exclamation-circle dark:text-rose-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Alert History
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          System error logs & trend analysis.
        </span>
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
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSdwtChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            filter
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="filter.endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-rose-500 !border-rose-500 hover:!bg-rose-600 !w-8 !h-8 !text-xs"
          @click="search"
          :loading="isLoading"
          :disabled="!filter.sdwt || !filter.startDate || !filter.endDate"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.left="'Reset'"
          @click="reset"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex flex-col flex-1 min-h-0 gap-4 pb-2 overflow-hidden animate-fade-in"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3 shrink-0">
        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"
          ></div>
          <p
            class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400"
          >
            Total Alerts
          </p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-3xl font-black text-rose-500">{{
              summary.totalErrorCount.toLocaleString()
            }}</span>
            <span class="mb-1 text-xs font-medium text-slate-400">events</span>
          </div>
        </div>

        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"
          ></div>
          <p
            class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400"
          >
            Impacted Units
          </p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-3xl font-black text-slate-800 dark:text-white">{{
              summary.errorEqpCount.toLocaleString()
            }}</span>
            <span class="mb-1 text-xs font-medium text-slate-400"
              >machines</span
            >
          </div>
        </div>

        <div
          class="relative p-4 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl group"
        >
          <div
            class="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"
          ></div>
          <p
            class="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400"
          >
            Most Frequent Alert
          </p>
          <div class="mt-1">
            <div class="flex items-baseline justify-between">
              <span
                class="text-lg font-bold text-blue-600 dark:text-blue-400 truncate pr-2"
                :title="summary.topErrorId"
              >
                {{ summary.topErrorId || "-" }}
              </span>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300"
                >{{ summary.topErrorCount.toLocaleString() }} times</span
              >
            </div>
            <p
              class="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5"
              :title="summary.topErrorLabel"
            >
              {{ summary.topErrorLabel || "No Data" }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[224px] shrink-0">
        <div
          class="flex flex-col overflow-hidden bg-white border shadow-sm lg:col-span-2 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl relative group"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800"
          >
            <h3
              class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <i class="pi pi-chart-bar text-rose-500"></i> Daily Trend
            </h3>
            <button
              v-if="gridFilter.date"
              @click.stop="clearGridDateFilter"
              class="text-[10px] px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
          <div class="relative flex-1 w-full min-h-0 cursor-pointer">
            <EChart
              v-if="trendData.length > 0"
              :option="trendOption"
              @chartCreated="onTrendChartInit"
            />
            <div
              v-else
              class="flex items-center justify-center h-full text-xs text-slate-400"
            >
              No trend data available
            </div>
          </div>
        </div>

        <div
          class="flex flex-col overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl relative group"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800"
          >
            <h3
              class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <i class="pi pi-sort-amount-down text-orange-500"></i> Worst
              Equipment
            </h3>
            <button
              v-if="gridFilter.eqpId"
              @click.stop="clearGridEqpFilter"
              class="text-[10px] px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
          <div class="relative flex-1 w-full min-h-0 cursor-pointer">
            <EChart
              v-if="summary.errorCountByEqp.length > 0"
              :option="byEqpOption"
              @chartCreated="onEqpChartInit"
            />
            <div
              v-else
              class="flex items-center justify-center h-full text-xs text-slate-400"
            >
              No equipment data available
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col h-[450px] shrink-0 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
      >
        <div
          class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0"
        >
          <div class="flex items-center gap-2">
            <i class="text-slate-400 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Error Log Details
            </h3>
            <div class="flex gap-1 ml-2">
              <span
                v-if="gridFilter.date"
                class="px-2 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900/30"
              >
                Date: {{ formatDate(gridFilter.date, true) }}
              </span>
              <span
                v-if="gridFilter.eqpId"
                class="px-2 py-0.5 text-[10px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded border border-purple-100 dark:border-purple-900/30"
              >
                EQP: {{ gridFilter.eqpId }}
              </span>
            </div>
          </div>

          <div
            class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">Rows:</span>
              <select
                v-model="rowsPerPage"
                @change="
                  first = 0;
                  loadGridData();
                "
                class="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
            <div class="h-3 mx-1 w-px bg-slate-200 dark:bg-zinc-700"></div>
            <span class="font-medium min-w-[70px] text-right">
              {{ totalRecords === 0 ? 0 : first + 1 }} -
              {{ Math.min(first + rowsPerPage, totalRecords) }} /
              {{ totalRecords }}
            </span>
            <div class="flex items-center gap-1 ml-1">
              <button
                @click="
                  first = 0;
                  loadGridData();
                "
                :disabled="first === 0"
                class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <i class="pi pi-angle-double-left text-[10px]"></i>
              </button>
              <button
                @click="prevPage"
                :disabled="first === 0"
                class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <i class="pi pi-angle-left text-[10px]"></i>
              </button>
              <button
                @click="nextPage"
                :disabled="first + rowsPerPage >= totalRecords"
                class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <i class="pi pi-angle-right text-[10px]"></i>
              </button>
              <button
                @click="lastPage"
                :disabled="first + rowsPerPage >= totalRecords"
                class="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <i class="pi pi-angle-double-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="relative w-full flex-1 min-h-0">
          <DataTable
            :value="logs"
            :lazy="true"
            :paginator="false"
            :rows="rowsPerPage"
            :loading="isGridLoading"
            class="absolute inset-0 text-xs p-datatable-sm custom-header-group"
            stripedRows
            scrollable
            scrollHeight="flex"
            removableSort
          >
            <template #empty>
              <div
                class="flex flex-col items-center justify-center h-full text-slate-400"
              >
                <i class="mb-2 text-3xl opacity-30 pi pi-filter-slash"></i>
                <p class="font-medium">No logs found.</p>
              </div>
            </template>
            <Column field="timeStamp" header="Time" style="min-width: 140px">
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-700 dark:text-slate-300">
                    {{ formatDate(data.timeStamp).split(" ")[0] }}
                  </span>
                  <span class="text-slate-400 font-mono">
                    {{ formatDate(data.timeStamp).split(" ")[1] }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="eqpId" header="EQP ID" style="min-width: 120px">
              <template #body="{ data }">
                <span class="font-bold text-slate-700 dark:text-slate-200">{{
                  data.eqpId
                }}</span>
              </template>
            </Column>
            <Column field="errorId" header="Error ID" style="min-width: 100px">
              <template #body="{ data }">
                <span class="font-mono font-bold">{{ data.errorId }}</span>
              </template>
            </Column>
            <Column
              field="errorLabel"
              header="Label"
              style="min-width: 180px"
            ></Column>
            <Column
              field="errorDesc"
              header="Description"
              style="min-width: 250px"
            ></Column>
            <Column
              field="extraMessage1"
              header="Extra 1"
              style="min-width: 150px"
            ></Column>
            <Column
              field="extraMessage2"
              header="Extra 2"
              style="min-width: 150px"
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] opacity-50 select-none"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-search"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Ready to Search</p>
      <p class="mt-1 text-xs text-slate-400">
        Please select filters to analyze alert history.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import {
  errorApi,
  type ErrorAnalyticsSummaryDto,
  type ErrorLogDto,
} from "@/api/error";
import EChart from "@/components/common/EChart.vue";

// Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// State
const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
});

// 차트 인터랙션용 필터
const gridFilter = reactive({
  date: null as string | null,
  eqpId: null as string | null,
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const isLoading = ref(false);
const isGridLoading = ref(false);
const hasSearched = ref(false);

// Data
const summary = ref<ErrorAnalyticsSummaryDto>({
  totalErrorCount: 0,
  errorEqpCount: 0,
  topErrorId: "",
  topErrorCount: 0,
  topErrorLabel: "",
  errorCountByEqp: [],
});
const trendData = ref<any[]>([]);
const logs = ref<ErrorLogDto[]>([]);
const totalRecords = ref(0);
const rowsPerPage = ref(10);
const first = ref(0);

// Theme
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      isDarkMode.value = document.documentElement.classList.contains("dark");
    }
  });
});

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // [추가] 초기화 시 localStorage에서 필터 값 복원
  const savedSite = localStorage.getItem("error_site");
  const savedSdwt = localStorage.getItem("error_sdwt");
  const savedEqpId = localStorage.getItem("error_eqpid");

  if (savedSite && sites.value.includes(savedSite)) {
    filter.site = savedSite;
    // Site가 유효할 때만 SDWT 목록 로드
    sdwts.value = await dashboardApi.getSdwts(savedSite);

    if (savedSdwt) {
      filter.sdwt = savedSdwt;
      // SDWT가 유효할 때만 EQPID 목록 로드
      eqpIds.value = await equipmentApi.getEqpIds(undefined, savedSdwt);

      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        filter.eqpId = savedEqpId;
      }
    }
  }
});

// Handlers
const onSiteChange = async () => {
  // [추가] 변경 시 localStorage 저장 및 하위 필터 초기화
  if (filter.site) {
    localStorage.setItem("error_site", filter.site);
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    localStorage.removeItem("error_site");
    sdwts.value = [];
  }

  // 하위 필터 초기화 및 저장소 삭제
  filter.sdwt = "";
  localStorage.removeItem("error_sdwt");
  filter.eqpId = "";
  localStorage.removeItem("error_eqpid");
  eqpIds.value = [];
};

const onSdwtChange = async () => {
  if (filter.sdwt) {
    localStorage.setItem("error_sdwt", filter.sdwt);
    // [수정] type: 'error' 전달
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filter.sdwt,
      "error"
    );
  } else {
    localStorage.removeItem("error_sdwt");
    eqpIds.value = [];
  }

  // 하위 필터 초기화 및 저장소 삭제
  filter.eqpId = "";
  localStorage.removeItem("error_eqpid");
};

// [추가] EQP ID 변경 시 localStorage 처리 핸들러 추가
const onEqpIdChange = () => {
  if (filter.eqpId) {
    localStorage.setItem("error_eqpid", filter.eqpId);
  } else {
    localStorage.removeItem("error_eqpid");
  }
};

const getEffectiveParams = () => {
  let start = filter.startDate;
  let end = filter.endDate;
  let eqps = filter.eqpId;

  if (gridFilter.date) {
    start = new Date(gridFilter.date);
    start.setHours(0, 0, 0, 0);
    end = new Date(gridFilter.date);
    end.setHours(23, 59, 59, 999);
  }

  if (gridFilter.eqpId) {
    eqps = gridFilter.eqpId;
  }

  return {
    site: filter.site,
    sdwt: filter.sdwt,
    eqpids: eqps,
    startDate: start ? start.toISOString() : "",
    endDate: end ? end.toISOString() : "",
  };
};

const search = async () => {
  if (!filter.startDate || !filter.endDate) return;

  gridFilter.date = null;
  gridFilter.eqpId = null;

  isLoading.value = true;
  hasSearched.value = true;
  first.value = 0;

  try {
    await Promise.all([updateSummaryData(), updateTrendData()]);
    await loadGridData();
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const updateSummaryData = async () => {
  const params = getEffectiveParams();
  summary.value = await errorApi.getSummary(params);
};

const updateTrendData = async () => {
  const params = getEffectiveParams();
  trendData.value = await errorApi.getTrend(params);
};

const loadGridData = async () => {
  isGridLoading.value = true;
  try {
    const params = {
      ...getEffectiveParams(),
      page: Math.floor(first.value / rowsPerPage.value),
      pageSize: rowsPerPage.value,
    };
    const res = await errorApi.getLogs(params);
    logs.value = res.items;
    totalRecords.value = res.totalItems;
  } finally {
    isGridLoading.value = false;
  }
};

const onTrendChartInit = (instance: any) => {
  instance.on("click", async (params: any) => {
    if (params.dataIndex !== undefined && trendData.value[params.dataIndex]) {
      gridFilter.date = trendData.value[params.dataIndex].date;
      first.value = 0;
      await updateSummaryData();
      loadGridData();
    }
  });
};

const onEqpChartInit = (instance: any) => {
  instance.on("click", async (params: any) => {
    if (params.name) {
      gridFilter.eqpId = params.name;
      first.value = 0;
      await updateTrendData();
      loadGridData();
    }
  });
};

const clearGridDateFilter = async () => {
  gridFilter.date = null;
  await updateSummaryData();
  first.value = 0;
  loadGridData();
};

const clearGridEqpFilter = async () => {
  gridFilter.eqpId = null;
  await updateTrendData();
  first.value = 0;
  loadGridData();
};

const prevPage = () => {
  if (first.value > 0) {
    first.value -= rowsPerPage.value;
    loadGridData();
  }
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value) {
    first.value += rowsPerPage.value;
    loadGridData();
  }
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
  loadGridData();
};

const reset = () => {
  hasSearched.value = false;
  filter.site = "";
  filter.sdwt = "";
  filter.eqpId = "";
  filter.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  filter.endDate = new Date();

  gridFilter.date = null;
  gridFilter.eqpId = null;

  sdwts.value = [];
  eqpIds.value = [];

  // [추가] 리셋 시 localStorage 값 삭제
  localStorage.removeItem("error_site");
  localStorage.removeItem("error_sdwt");
  localStorage.removeItem("error_eqpid");

  summary.value = {
    totalErrorCount: 0,
    errorEqpCount: 0,
    topErrorId: "",
    topErrorCount: 0,
    topErrorLabel: "",
    errorCountByEqp: [],
  };
  trendData.value = [];
  logs.value = [];
};

// ... (ECharts Options는 기존과 동일) ...
const trendOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
    },
    grid: { left: 40, right: 20, top: 30, bottom: 20, containLabel: true },
    xAxis: {
      type: "category",
      data: trendData.value.map((d) => formatDate(d.date, true)),
      axisLabel: { color: textColor, fontSize: 10 },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: "Alerts",
        type: "bar",
        data: trendData.value.map((d) => d.count),
        itemStyle: { color: "#f43f5e", borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 50,
        cursor: "pointer",
        label: {
          show: true,
          position: "top",
          color: textColor,
          fontSize: 10,
          formatter: "{c} 건",
        },
      },
    ],
  };
});

const byEqpOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const data = summary.value.errorCountByEqp.slice(0, 10);
  const colors = [
    "#f97316",
    "#ef4444",
    "#f59e0b",
    "#84cc16",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
  ];

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
    },
    grid: { left: 40, right: 20, top: 30, bottom: 30, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => d.label),
      axisLabel: { color: textColor, fontSize: 10, interval: 0, rotate: 30 },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: "Count",
        type: "bar",
        data: data.map((d, index) => ({
          value: d.value,
          itemStyle: {
            color: colors[index % colors.length],
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 30,
        cursor: "pointer",
        label: {
          show: true,
          position: "top",
          color: textColor,
          fontSize: 10,
          formatter: "{c} 건",
        },
      },
    ],
  };
});

const formatDate = (dateStr: string, short = false, twoDigitYear = false) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const yy = d.getFullYear();
  const yy2 = String(yy).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  if (short) return `${mm}-${dd}`;
  if (twoDigitYear) {
    return `${yy2}-${mm}-${dd} ${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}:${String(
      d.getSeconds()
    ).padStart(2, "0")}`;
  }
  return `${yy}-${mm}-${dd} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};
</script>

<style scoped>
/* Style unchanged */
:deep(.p-datatable-thead > tr > th) {
  @apply font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-700 z-10 sticky top-0;
}
:deep(.p-datatable-tbody > tr > td) {
  @apply py-2 px-3 text-[12px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  @apply !bg-[#27272a] !text-white;
}
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
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg) {
  @apply w-3 h-3;
}
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
</style>



