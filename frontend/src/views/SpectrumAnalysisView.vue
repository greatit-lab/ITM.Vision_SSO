<!-- frontend/src/views/SpectrumAnalysisView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i
          class="text-lg text-indigo-500 pi pi-wave-pulse dark:text-indigo-400"
        ></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Spectrum Analysis
        </h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >Advanced Metrology: EXP vs GEN & Reference.</span
        >
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
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filterStore.selectedSite"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filters.eqpId"
            :options="eqpIds"
            filter
            placeholder="EQP ID"
            :disabled="!filterStore.selectedSdwt"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filters.eqpId }"
            @change="onEqpChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filters.lotId"
            :options="lotIds"
            filter
            placeholder="Lot ID"
            :disabled="!filters.eqpId"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filters.lotId }"
            @change="onLotChange"
          />
        </div>

        <div class="min-w-[140px] shrink-0">
          <DatePicker
            v-model="filters.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start"
            class="w-full custom-dropdown small date-picker"
            :disabled="!filters.eqpId"
            @update:model-value="onDateChange"
          />
        </div>

        <div class="min-w-[140px] shrink-0">
          <DatePicker
            v-model="filters.endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End"
            class="w-full custom-dropdown small date-picker"
            :disabled="!filters.eqpId"
            @update:model-value="onDateChange"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Reset'"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
          @click="resetFilters"
        />
      </div>
    </div>

    <div
      v-if="filters.lotId"
      class="flex flex-1 min-h-0 gap-3 pb-2 overflow-hidden lg:flex-row flex-col animate-fade-in"
    >
      <div
        class="flex flex-col w-full lg:w-64 shrink-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden h-full"
      >
        <div
          class="p-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800"
        >
          <h3
            class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"
          >
            <i class="pi pi-filter"></i> Target Selection
          </h3>
        </div>
        <div
          class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 flex flex-col"
        >
          <div class="space-y-3 shrink-0">
            <div
              class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              <span
                class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px]"
                >1</span
              >
              Process Condition
            </div>
            <div class="pl-2 space-y-2">
              <div>
                <label class="text-[10px] text-slate-400 block mb-1"
                  >CASSETTE RCP</label
                >
                <Select
                  v-model="filters.cassetteRcp"
                  :options="cassetteRcps"
                  placeholder="Select Recipe"
                  class="w-full custom-dropdown small"
                  overlayClass="custom-dropdown-panel small"
                  @change="onCassetteChange"
                />
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1"
                  >STAGE GROUP</label
                >
                <Select
                  v-model="filters.stageGroup"
                  :options="stageGroups"
                  placeholder="Select Stage"
                  :disabled="!filters.cassetteRcp"
                  class="w-full custom-dropdown small"
                  overlayClass="custom-dropdown-panel small"
                  @change="onStageGroupChange"
                />
              </div>
            </div>
          </div>
          <div class="h-px bg-slate-100 dark:bg-zinc-800 shrink-0"></div>
          <div class="space-y-2 shrink-0">
            <div
              class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              <span
                class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px]"
                >2</span
              >
              Measurement Point
            </div>
            <div class="pl-2">
              <div
                v-if="isPointsLoading"
                class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400"
              >
                <i class="pi pi-spin pi-spinner"></i> Loading Points...
              </div>
              <Select
                v-else
                v-model="filters.pointId"
                :options="pointIds"
                placeholder="Select Point"
                :disabled="!filters.stageGroup || pointIds.length === 0"
                class="w-full custom-dropdown small"
                overlayClass="custom-dropdown-panel small"
              />
              <small
                v-if="
                  filters.stageGroup &&
                  !isPointsLoading &&
                  pointIds.length === 0
                "
                class="text-[10px] text-rose-400 ml-1"
                >No points found.</small
              >
            </div>
          </div>
          <div class="h-px bg-slate-100 dark:bg-zinc-800 shrink-0"></div>

          <div class="flex flex-col flex-1 min-h-0">
            <div class="flex items-center justify-between mb-2 shrink-0">
              <div
                class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                <span
                  class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px]"
                  >3</span
                >
                Wafers ({{ selectedWafers.length }})
              </div>
              <button
                v-if="filters.stageGroup"
                @click="toggleAllWafers"
                class="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold transition-colors"
              >
                {{
                  selectedWafers.length === waferList.length &&
                  waferList.length > 0
                    ? "Deselect All"
                    : "Select All"
                }}
              </button>
            </div>
            <div class="pl-2 flex-1 min-h-0 flex flex-col">
              <div
                v-if="!filters.stageGroup"
                class="text-[10px] text-slate-400 italic py-2"
              >
                Select conditions first.
              </div>
              <div
                v-else
                class="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-1 h-full"
              >
                <div
                  v-for="w in waferList"
                  :key="w"
                  @click="toggleWafer(w)"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all border group"
                  :class="
                    selectedWafers.includes(w)
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  "
                >
                  <div
                    class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                    :class="
                      selectedWafers.includes(w)
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                    "
                  >
                    <i
                      v-if="selectedWafers.includes(w)"
                      class="pi pi-check text-white text-[8px] font-bold"
                    ></i>
                  </div>
                  <span
                    class="text-xs font-mono font-medium"
                    :class="
                      selectedWafers.includes(w)
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                    "
                    >Slot #{{ w }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="mt-auto p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900"
        >
          <Button
            label="Analyze Spectrum"
            icon="pi pi-search"
            class="w-full !text-xs !font-bold !py-2.5 !rounded-lg !bg-indigo-600 hover:!bg-indigo-700 !border-indigo-600"
            :loading="isLoading"
            :disabled="!isReadyToSearch"
            @click="searchData"
          />
        </div>
      </div>

      <div class="flex flex-col flex-1 gap-3 overflow-hidden h-full">
        <div
          class="flex-[3] min-h-0 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 relative flex flex-col"
        >
          <div
            class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30"
          >
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
                <h3
                  class="text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Spectrum Trend
                </h3>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <span class="text-[10px] font-bold text-slate-400"
                  >Golden Ref:</span
                >
                <ToggleSwitch
                  v-model="showGoldenRef"
                  class="scale-75"
                  @change="toggleGoldenRef"
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="selectedModelWafer"
                class="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200"
              >
                <i class="pi pi-chart-line"></i> Model Fit: Slot #{{
                  selectedModelWafer
                }}
                <i
                  class="pi pi-times cursor-pointer ml-1 hover:text-amber-800"
                  @click="clearModelFit"
                ></i>
              </span>
              <span
                v-if="hasSearched"
                class="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded"
                >Hover to highlight</span
              >
            </div>
          </div>
          <div
            class="relative flex-1 w-full min-h-0 bg-slate-50/30 dark:bg-black/20"
          >
            <div
              v-if="!hasSearched"
              class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60 select-none"
            >
              <div
                class="w-16 h-16 bg-slate-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-3"
              >
                <i
                  class="pi pi-chart-line text-2xl text-slate-300 dark:text-zinc-600"
                ></i>
              </div>
              <p class="text-xs font-bold text-slate-500">No Data Displayed</p>
              <p class="text-[10px]">
                Select conditions on the left and click Analyze.
              </p>
            </div>
            <EChart
              v-else
              :option="chartOption"
              class="w-full h-full"
              @chartCreated="onChartCreated"
              @zr:mousemove="onChartMouseOver"
            />
            <transition name="fade">
              <button
                v-if="isZoomed"
                @click="resetZoom"
                class="absolute top-3 right-3 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all z-10 cursor-pointer"
              >
                <i class="pi pi-refresh text-[9px]"></i> Reset Zoom
              </button>
            </transition>
          </div>
        </div>

        <div
          v-if="hasSearched"
          class="flex-[2] min-h-0 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col animate-fade-in"
        >
          <div
            class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30"
          >
            <div class="flex items-center gap-2">
              <i class="pi pi-table text-indigo-500 text-xs"></i>
              <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
                Measurement Results
              </h3>
            </div>
            <span class="text-[10px] text-slate-400"
              >Click row to overlay Model(GEN)</span
            >
          </div>

          <div class="flex-1 overflow-auto p-0">
            <DataTable
              :value="tableData"
              class="p-datatable-sm text-xs"
              scrollable
              scrollHeight="flex"
              stripedRows
              rowHover
              resizableColumns
              columnResizeMode="expand"
              showGridlines
              v-model:selection="selectedTableRow"
              selectionMode="single"
              dataKey="waferId"
              @row-select="onRowSelect"
              @row-mouseenter="onRowMouseEnter"
              @row-mouseleave="onRowMouseLeave"
            >
              <Column
                field="lotId"
                header="Lot ID"
                class="font-mono text-slate-500"
                style="min-width: 120px"
              ></Column>

              <Column field="waferId" header="Wafer" style="min-width: 80px">
                <template #body="slotProps">
                  <span
                    class="font-bold text-indigo-600 dark:text-indigo-400"
                    >{{ slotProps.data.waferId }}</span
                  >
                </template>
              </Column>

              <Column field="gof" header="GOF" style="min-width: 90px">
                <template #body="slotProps">
                  <span :class="getCellClass('gof', slotProps.data.gof)">
                    {{ formatValue(slotProps.data.gof) }}
                  </span>
                </template>
              </Column>

              <Column
                v-for="col in tableColumns"
                :key="col"
                :field="col"
                :header="formatHeader(col)"
                style="min-width: 100px"
              >
                <template #body="slotProps">
                  <span :class="getCellClass(col, slotProps.data[col])">
                    {{ formatValue(slotProps.data[col]) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i class="text-4xl pi pi-filter text-slate-300 dark:text-zinc-600"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Select Global Filters</p>
      <p class="text-xs">Please select Site, SDWT, EQP, and Lot ID first.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { waferApi } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ToggleSwitch from "primevue/toggleswitch";

const filterStore = useFilterStore();
const isLoading = ref(false);
const isPointsLoading = ref(false);
const hasSearched = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const cassetteRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const waferList = ref<string[]>([]);
const pointIds = ref<string[]>([]);

const filters = reactive({
  eqpId: "",
  lotId: "",
  cassetteRcp: "",
  stageGroup: "",
  pointId: "",
  startDate: new Date(Date.now() - 7 * 864e5),
  endDate: new Date(),
});

const selectedWafers = ref<string[]>([]);
const chartSeries = ref<any[]>([]);
const isZoomed = ref(false);
let chartInstance: ECharts | null = null;
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver;

const isReadyToSearch = computed(
  () =>
    filters.lotId &&
    filters.cassetteRcp &&
    filters.stageGroup &&
    filters.pointId &&
    selectedWafers.value.length > 0
);

const tableData = ref<any[]>([]);
const tableColumns = ref<string[]>([]);
const goldenSeries = ref<any>(null);
const genSeries = ref<any>(null);
const showGoldenRef = ref(false);
const hoveredWaferId = ref<number | null>(null);
const selectedTableRow = ref();
const selectedModelWafer = ref<number | null>(null);

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  const savedSite = localStorage.getItem("spec_site");
  const savedSdwt = localStorage.getItem("spec_sdwt");
  const savedEqp = localStorage.getItem("spec_eqp");

  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.selectedSite = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
    if (savedSdwt && sdwts.value.includes(savedSdwt)) {
      filterStore.selectedSdwt = savedSdwt;
      eqpIds.value = await equipmentApi.getEqpIds(undefined, savedSdwt);
      if (savedEqp && eqpIds.value.includes(savedEqp)) {
        filters.eqpId = savedEqp;
        await loadLotIds();
      }
    }
  }

  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => {
      if (mu.attributeName === "class")
        isDarkMode.value = document.documentElement.classList.contains("dark");
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});

// --- Filter Change Handlers ---
const onSiteChange = async () => {
  resetFrom(0);
  if (filterStore.selectedSite) {
    localStorage.setItem("spec_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("spec_site");
    sdwts.value = [];
  }
};

const onSdwtChange = async () => {
  resetFrom(1);
  if (filterStore.selectedSdwt) {
    localStorage.setItem("spec_sdwt", filterStore.selectedSdwt);
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filterStore.selectedSdwt
    );
  } else {
    localStorage.removeItem("spec_sdwt");
    eqpIds.value = [];
  }
};

const onEqpChange = () => {
  resetFrom(2);
  if (filters.eqpId) {
    localStorage.setItem("spec_eqp", filters.eqpId);
    loadLotIds();
  } else {
    localStorage.removeItem("spec_eqp");
  }
};

const onDateChange = () => {
  if (filters.eqpId) loadLotIds();
};

const loadLotIds = async () => {
  lotIds.value = await waferApi.getDistinctValues("lotids", {
    eqpId: filters.eqpId,
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
  });
};

const onLotChange = async () => {
  resetFrom(3);
  if (filters.lotId) {
    cassetteRcps.value = await waferApi.getDistinctValues("cassettercps", {
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    });
  }
};

const onCassetteChange = async () => {
  resetFrom(4);
  if (filters.cassetteRcp) {
    stageGroups.value = await waferApi.getDistinctValues("stagegroups", {
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      cassetteRcp: filters.cassetteRcp,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    });
  }
};

const onStageGroupChange = async () => {
  if (filters.stageGroup) {
    const wafers = await waferApi.getDistinctValues("waferids", {
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      cassetteRcp: filters.cassetteRcp,
      stageGroup: filters.stageGroup,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    });
    waferList.value = wafers.sort((a, b) => Number(a) - Number(b));
    selectedWafers.value = wafers.slice(0, 5);
    await loadPoints();
  } else {
    resetFrom(5);
  }
};

const loadPoints = async () => {
  isPointsLoading.value = true;
  pointIds.value = [];
  filters.pointId = "";
  try {
    const points = await waferApi.getPoints({
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      cassetteRcp: filters.cassetteRcp,
      stageGroup: filters.stageGroup,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    });
    pointIds.value = points;
    if (points.length > 0) filters.pointId = points[0] ?? "";
  } catch (e) {
    console.error(e);
  } finally {
    isPointsLoading.value = false;
  }
};

const resetFrom = (level: number) => {
  if (level <= 0) {
    filterStore.selectedSdwt = "";
    localStorage.removeItem("spec_sdwt");
    eqpIds.value = [];
  }
  if (level <= 1) {
    filters.eqpId = "";
    localStorage.removeItem("spec_eqp");
  }
  if (level <= 2) {
    filters.lotId = "";
    lotIds.value = [];
  }
  if (level <= 3) {
    filters.cassetteRcp = "";
    cassetteRcps.value = [];
  }
  if (level <= 4) {
    filters.stageGroup = "";
    stageGroups.value = [];
  }
  if (level <= 5) {
    waferList.value = [];
    selectedWafers.value = [];
    pointIds.value = [];
    filters.pointId = "";
    chartSeries.value = [];
    tableData.value = [];
    tableColumns.value = [];
    goldenSeries.value = null;
    genSeries.value = null;
    hasSearched.value = false;
  }
};

const toggleWafer = (w: string) => {
  if (selectedWafers.value.includes(w))
    selectedWafers.value = selectedWafers.value.filter((item) => item !== w);
  else selectedWafers.value.push(w);
};
const toggleAllWafers = () => {
  if (selectedWafers.value.length === waferList.value.length)
    selectedWafers.value = [];
  else selectedWafers.value = [...waferList.value];
};

const searchData = async () => {
  if (!isReadyToSearch.value) return;
  isLoading.value = true;
  hasSearched.value = true;
  isZoomed.value = false;
  clearModelFit();

  try {
    const data = await waferApi.getSpectrumTrend({
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      pointId: filters.pointId,
      waferIds: selectedWafers.value.join(","),
      cassetteRcp: filters.cassetteRcp,
      stageGroup: filters.stageGroup,
    });

    const mappedData = data
      ? data.map((d: any) => ({
          ...d,
          name: `Slot #${d.waferId}`,
        }))
      : [];

    // WaferID 기준 오름차순 정렬
    mappedData.sort((a: any, b: any) => a.waferId - b.waferId);

    chartSeries.value = mappedData;

    if (data && data.length > 0) {
      const firstMeta = data[0]?.meta || {};
      const allKeys = Object.keys(firstMeta).filter(
        (k) =>
          ![
            "timestamp",
            "lotId",
            "gof",
            "scanTs",
            "eqpId",
            "rawWaferId",
            "pointId",
          ].includes(k)
      );

      tableColumns.value = allKeys.filter((col) => {
        return data.some((d: any) => {
          const val = d.meta[col];
          return (
            val !== null &&
            val !== undefined &&
            val !== "" &&
            String(val).toLowerCase() !== "n/a"
          );
        });
      });

      // [핵심] Backend에서 넘어온 eqpId, scanTs, rawWaferId, pointId를 테이블 데이터에 저장
      // (pointId는 series 루트에 있으므로 d.pointId 사용)
      tableData.value = data
        .map((d: any) => ({
          waferId: d.waferId,
          lotId: d.meta?.lotId || filters.lotId,
          scanTs: d.meta?.scanTs,
          eqpId: d.meta?.eqpId,
          rawWaferId: d.meta?.rawWaferId,
          pointId: d.pointId,
          ...d.meta,
        }))
        .sort((a: any, b: any) => Number(a.waferId) - Number(b.waferId));
    } else {
      tableColumns.value = [];
      tableData.value = [];
    }

    if (showGoldenRef.value) await fetchGoldenRef();
  } catch (e) {
    console.error(e);
    chartSeries.value = [];
    tableData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const toggleGoldenRef = async () => {
  if (showGoldenRef.value) {
    await fetchGoldenRef();
  } else {
    // Golden Ref가 꺼질 때 명시적으로 null로 설정하여 차트 재계산을 유도합니다.
    // chartOption에서 이를 감지하여 "Dummy Series"를 넣어 잔상을 제거합니다.
    goldenSeries.value = null;
  }
};

const fetchGoldenRef = async () => {
  try {
    const golden = await waferApi.getGoldenSpectrum({
      eqpId: filters.eqpId,
      cassetteRcp: filters.cassetteRcp,
      stageGroup: filters.stageGroup,
      pointId: filters.pointId,
    });

    if (golden && golden.wavelengths && golden.values) {
      const dataPoints = golden.wavelengths.map((w: number, i: number) => [
        w,
        (golden.values[i] ?? 0) * 100,
      ]);

      goldenSeries.value = {
        name: "Golden Ref",
        type: "line",
        data: dataPoints,
        showSymbol: false,
        lineStyle: { width: 3, color: "#FFD700", type: "solid", opacity: 0.8 },
        areaStyle: { color: "rgba(255, 215, 0, 0.1)" },
        z: 1,
      };
    } else {
      goldenSeries.value = null;
    }
  } catch (e) {
    console.error("Golden Ref Error:", e);
    goldenSeries.value = null;
  }
};

const onRowSelect = async (event: any) => {
  const wid = event.data.waferId;
  const rawWid = event.data.rawWaferId;
  const ts = event.data.scanTs;
  const eqp = event.data.eqpId;
  const pid = event.data.pointId;

  selectedModelWafer.value = wid;

  // GEN 데이터 요청 시, 화면의 필터 값이 아닌 '해당 행(Row)'의 정보를 사용해야 정확합니다.
  try {
    const genData = await waferApi.getSpectrumGen({
      lotId: filters.lotId,
      waferId: rawWid, // DB 원본 Wafer ID
      pointId: pid, // 해당 행의 Point ID
      eqpId: eqp, // 해당 행의 EQP ID
      ts: ts, // 해당 행의 Timestamp
    });

    if (genData) {
      console.log("GEN Data Fetched:", genData); // 디버깅용 로그
      genSeries.value = {
        ...genData,
        name: `Model (Slot #${wid})`,
        id: "model-gen",
        color: "#ef4444",
        itemStyle: { color: "#ef4444" },
        smooth: true,
        z: 50,
      };
    } else {
      console.warn("No GEN Data found for:", { wid, rawWid, pid, eqp, ts });
      genSeries.value = null;
    }
  } catch (e) {
    console.error("Failed to fetch GEN Spectrum:", e);
    genSeries.value = null;
  }
};

const clearModelFit = () => {
  selectedModelWafer.value = null;
  genSeries.value = null;
  selectedTableRow.value = null;
};

const resetFilters = () => {
  filterStore.reset();
  localStorage.removeItem("spec_site");
  localStorage.removeItem("spec_sdwt");
  localStorage.removeItem("spec_eqp");
  resetFrom(0);
};

// --- Sync Logic ---
const onChartMouseOver = (params: any) => {
  if (params && params.seriesName) {
    const name = params.seriesName;
    if (name.includes("Slot #")) {
      const wid = Number(name.replace("Slot #", ""));
      if (!isNaN(wid)) hoveredWaferId.value = wid;
    }
  }
};
const onRowMouseEnter = (event: any) =>
  (hoveredWaferId.value = event.data.waferId);
const onRowMouseLeave = () => (hoveredWaferId.value = null);

const onChartCreated = (instance: any) => {
  chartInstance = instance;
  instance.on("dataZoom", () => {
    const opt = instance.getOption();
    const zoom = Array.isArray(opt.dataZoom) ? opt.dataZoom[0] : opt.dataZoom;
    if (zoom && zoom.start !== undefined && zoom.end !== undefined) {
      isZoomed.value = zoom.start > 0 || zoom.end < 100;
    }
  });
};
const resetZoom = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    isZoomed.value = false;
  }
};

const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  const series: any[] = [];

  // 1. Golden Reference
  // showGoldenRef가 true이고 데이터가 있을 때만 실제 데이터를 그림
  if (showGoldenRef.value && goldenSeries.value) {
    series.push({
      ...goldenSeries.value,
      id: "golden-ref", // 고정 ID
      name: "Golden Ref",
      type: "line",
      symbol: "none",
      smooth: false,
      lineStyle: { width: 3, color: "#FFD700", type: "solid", opacity: 0.8 },
      color: "#FFD700",
      itemStyle: { color: "#FFD700" },
      z: 1,
    });
  } else {
    // [핵심] 꺼졌을 때 빈 데이터의 'Golden Ref' 시리즈를 보내어 ECharts가 이전 선을 지우도록 유도
    series.push({
      id: "golden-ref", // 같은 ID 사용
      name: "Golden Ref",
      type: "line",
      data: [], // 빈 데이터
      showSymbol: false,
      lineStyle: { opacity: 0 },
      smooth: false,
      z: 0,
    });
  }

  // 2. Wafer Series
  chartSeries.value.forEach((s, idx) => {
    const isHovered = hoveredWaferId.value === s.waferId;
    const isSelected = selectedModelWafer.value === s.waferId;
    const isFocus =
      (hoveredWaferId.value === null && selectedModelWafer.value === null) ||
      isHovered ||
      isSelected;

    series.push({
      id: `wafer-${s.waferId}`,
      name: s.name,
      type: "line",
      symbol: "none",
      smooth: false,
      lineStyle: {
        width: isHovered || isSelected ? 3 : 1,
        opacity: isFocus ? 1 : 0.15,
      },
      data: s.data,
      z: 5 + idx,
    });
  });

  // 3. GEN (Model Fit)
  if (genSeries.value && genSeries.value.data?.length > 0) {
    series.push({
      ...genSeries.value,
      id: "model-gen",
      name: genSeries.value.name,
      z: 50,
      lineStyle: {
        width: 2,
        type: "dashed",
        color: "#ef4444",
        opacity: 1, // [핵심 수정] 명시적으로 불투명도(1)를 설정하여 이전 상태(0)를 덮어씀
      },
      itemStyle: {
        color: "#ef4444", // [추가] 색상 명시
        opacity: 1 
      }
    });
  } else {
    // [기존 유지] 데이터가 없으면 투명하게 숨김
    series.push({
      id: "model-gen",
      name: "Model", 
      type: "line",
      data: [],
      showSymbol: false,
      lineStyle: { opacity: 0 },
      smooth: false,
      z: 0,
    });
  }

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 },
      formatter: (params: any[]) => {
        if (!params || params.length === 0) return "";

        let html = `<div class="font-bold mb-1 border-b border-slate-500/30 pb-1">Wavelength: ${params[0].axisValue} nm</div>`;

        params.forEach((p) => {
          if (p.seriesName === "Golden Ref") {
            if (!p.value || p.value.length === 0) return;
            html += `<div style="color:${p.color}" class="text-[10px]">● ${p.seriesName}</div>`;
            return;
          }
          if (p.seriesName.startsWith("Model")) {
            html += `<div style="color:${p.color}" class="text-[10px]">● ${p.seriesName}</div>`;
            return;
          }

          const wid = p.seriesName.replace("Slot #", "");
          const intensity =
            p.value[1] !== undefined ? p.value[1].toFixed(2) : "-";

          html += `
            <div class="flex items-center justify-between gap-4 text-[11px]">
              <span style="color:${p.color}">● Slot #${wid}</span>
              <span class="font-mono font-bold">Int: ${intensity}</span>
            </div>
          `;
        });
        return html;
      },
    },
    // [핵심] 범례 데이터 생성 시, 현재 series 배열에 있는 모든 이름을 포함시킵니다.
    // 단, 데이터가 빈 껍데기(Dummy)인 경우 범례에서 제외하고 싶다면 필터링을 추가할 수 있습니다.
    // 여기서는 사용자가 켰는데 데이터가 없는 경우를 제외하고는 모두 보여줍니다.
    legend: {
      data: series
        .filter((s) => {
          // Golden Ref는 꺼져있으면 범례에서도 숨김
          if (s.id === "golden-ref" && !showGoldenRef.value) return false;
          // Model은 데이터가 없으면(Dummy) 범례에서 숨김
          if (s.id === "model-gen" && (!s.data || s.data.length === 0))
            return false;
          return true;
        })
        .map((s: any) => s.name),
      textStyle: { color: textColor, fontSize: 11 },
      type: "scroll",
      top: 0,
      icon: "circle",
    },
    grid: { left: 50, right: 30, top: 40, bottom: 40, containLabel: false },
    dataZoom: [
      { type: "inside", xAxisIndex: 0 },
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: 0,
        height: 16,
        borderColor: "transparent",
        fillerColor: "rgba(99, 102, 241, 0.1)",
      },
    ],
    xAxis: {
      type: "value",
      name: "Wavelength (nm)",
      nameLocation: "middle",
      nameGap: 25,
      nameTextStyle: { color: textColor, fontWeight: "bold", fontSize: 11 },
      min: (v: any) => Math.floor(v.min),
      max: (v: any) => Math.ceil(v.max),
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: {
        show: true,
        lineStyle: { color: gridColor, type: "dashed" },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "Intensity",
      scale: true,
      nameTextStyle: { color: textColor, fontSize: 11, padding: [0, 20, 0, 0] },
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: series,
    animationDuration: 1000,
    animationEasing: "cubicOut",
  };
});

// --- Helper Functions for Table ---
const formatHeader = (key: string) => {
  return key.replace(/_/g, " ").toUpperCase();
};

const formatValue = (val: any) => {
  if (typeof val === "number") {
    if (Math.abs(val) < 10) return val.toFixed(4);
    return val.toFixed(2);
  }
  return val;
};

const getCellClass = (col: string, val: any) => {
  if (col.toLowerCase() === "gof") {
    return val < 0.9 ? "text-rose-500 font-bold" : "text-emerald-600 font-bold";
  }
  return "";
};
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[12px] py-[5px] px-3;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.date-picker .p-inputtext) {
  @apply !text-[12px] !py-1 !px-2 !h-7;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg) {
  @apply w-3 h-3;
}
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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

/* PrimeVue DataTable Custom */
:deep(.p-datatable-thead > tr > th) {
  @apply bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 !py-2 !text-[11px] font-extrabold uppercase;
}
:deep(.p-datatable-tbody > tr > td) {
  @apply !py-1.5 !text-[11px] text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800;
}
:deep(.p-datatable-tbody > tr:hover) {
  @apply bg-indigo-50/50 dark:bg-indigo-900/20 cursor-pointer;
}
:deep(.p-datatable-tbody > tr.p-highlight) {
  @apply bg-amber-50 dark:bg-amber-900/20 !text-slate-900 dark:!text-white;
}
</style>
