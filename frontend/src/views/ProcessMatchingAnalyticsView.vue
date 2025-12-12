<!-- frontend/src/views/ProcessMatchingAnalyticsView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-sky-500 pi pi-clone dark:text-sky-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Process Matching Analytics
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Multi-chamber comparison & cluster analysis.
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
            v-model="refEqpId"
            :options="refEqpList"
            filter
            placeholder="Ref. EQP (Standard)"
            :disabled="!filterStore.selectedSdwt"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !refEqpId }"
            @change="onRefEqpChange"
          />
        </div>

        <div class="w-px h-6 mx-1 bg-slate-200 dark:bg-zinc-700 shrink-0"></div>

        <div class="min-w-[140px] shrink-0">
          <DatePicker
            v-model="filters.startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start"
            class="w-full custom-dropdown small date-picker"
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
      class="flex flex-col flex-1 min-h-0 gap-3 pb-2 overflow-hidden lg:flex-row animate-fade-in"
    >
      <div
        class="flex flex-col w-full lg:w-72 shrink-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden h-full"
      >
        <div
          class="p-3 border-b bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <h3
            class="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300"
          >
            <i class="pi pi-filter"></i> Analysis Setup
          </h3>
        </div>

        <div class="flex-1 p-3 space-y-5 overflow-y-auto custom-scrollbar">
          <div class="space-y-3">
            <div
              class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
            >
              <span
                class="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[9px]"
                >1</span
              >
              Target Condition
            </div>
            <div class="pl-2 space-y-2">
              <div v-if="!refEqpId" class="text-[10px] text-amber-500 italic mb-2 pl-1">
                * Please select Reference EQP first.
              </div>
              
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">CASSETTE RCP</label>
                <Select
                  v-model="filters.cassetteRcp"
                  :options="cassetteRcps"
                  placeholder="Select Recipe"
                  filter
                  :disabled="!refEqpId"
                  class="w-full custom-dropdown small"
                  overlayClass="custom-dropdown-panel small"
                  @change="onCassetteChange"
                />
              </div>
              
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">STAGE GROUP</label>
                <Select
                  v-model="filters.stageGroup"
                  :options="stageGroups"
                  placeholder="Select Stage"
                  :disabled="!filters.cassetteRcp"
                  class="w-full custom-dropdown small"
                  overlayClass="custom-dropdown-panel small"
                  @change="onConditionChange"
                />
              </div>
              
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">FILM</label>
                <Select
                  v-model="filters.film"
                  :options="films"
                  placeholder="Select Film"
                  :disabled="!filters.stageGroup"
                  class="w-full custom-dropdown small"
                  overlayClass="custom-dropdown-panel small"
                  @change="onConditionChange"
                />
              </div>
            </div>
          </div>

          <div class="h-px bg-slate-100 dark:bg-zinc-800 shrink-0"></div>

          <div class="flex flex-col flex-1 min-h-0 space-y-2">
            <div class="flex items-center justify-between">
              <div
                class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                <span
                  class="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[9px]"
                  >2</span
                >
                Compare Targets
              </div>

              <div
                v-if="isListVisible && targetEqps.length > 0"
                class="flex items-center gap-2"
              >
                <button
                  @click="toggleAllEquipments"
                  class="text-[10px] font-bold transition-colors text-sky-500 hover:text-sky-600"
                >
                  {{
                    selectedEqps.length === targetEqps.length
                      ? "Deselect All"
                      : "Select All"
                  }}
                </button>
                <span class="text-[10px] font-bold text-slate-400">
                  {{ selectedEqps.length }} / {{ targetEqps.length }}
                </span>
              </div>
            </div>

            <div v-if="isEqpLoading" class="flex justify-center py-4">
              <i class="pi pi-spin pi-spinner text-sky-500"></i>
            </div>

            <div
              v-else-if="!isListVisible"
              class="text-[10px] text-slate-400 italic pl-2 py-4 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-lg"
            >
              <i class="block mb-1 pi pi-exclamation-circle"></i>
              Select full conditions to find matching equipments.
            </div>

            <div
              v-else-if="targetEqps.length === 0"
              class="text-[10px] text-slate-400 italic pl-2"
            >
              No matching equipments found.
            </div>

            <div
              v-else
              class="flex-1 p-1 overflow-y-auto border rounded-lg custom-scrollbar border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30"
            >
              <div
                v-for="eqp in targetEqps"
                :key="eqp"
                @click="toggleEqp(eqp)"
                class="flex items-center gap-2 px-3 py-2 mb-1 transition-all rounded-md cursor-pointer select-none"
                :class="[
                  selectedEqps.includes(eqp)
                    ? (eqp === refEqpId 
                        ? 'bg-indigo-500 text-white shadow-sm font-bold ring-1 ring-indigo-400' 
                        : 'bg-sky-500 text-white shadow-sm font-bold')
                    : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400'
                ]"
              >
                <i
                  :class="
                    selectedEqps.includes(eqp)
                      ? 'pi pi-check-circle'
                      : 'pi pi-circle'
                  "
                  class="text-[10px]"
                ></i>
                <span class="text-xs">{{ eqp }}</span>
                <span v-if="eqp === refEqpId" class="ml-auto text-[9px] bg-white/20 px-1.5 rounded font-bold border border-white/30">REF</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-3 mt-auto border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900"
        >
          <Button
            label="Analyze Matching"
            icon="pi pi-chart-bar"
            class="w-full !text-xs !font-bold !py-2.5 !rounded-lg !bg-sky-600 hover:!bg-sky-700 !border-sky-600"
            :loading="isDataLoading"
            :disabled="selectedEqps.length < 1"
            @click="loadComparisonData"
          />
        </div>
      </div>

      <div class="flex flex-col flex-1 h-full gap-3 overflow-hidden">
        
        <div
          class="flex-[3] min-h-0 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col relative"
        >
          <div
            class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30"
          >
            <div class="flex items-center gap-2">
              <div class="w-1 h-3 rounded-full bg-sky-500"></div>
              <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
                Parameter Distribution (Box Plot)
              </h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400 font-bold">Metric:</span>
              <div class="w-32">
                <Select
                  v-model="selectedMetric"
                  :options="metricOptions"
                  class="w-full custom-dropdown small"
                  overlayClass="custom-dropdown-panel small"
                />
              </div>
            </div>
          </div>
          <div class="relative flex-1 w-full min-h-0">
            <div
              v-if="!hasSearched"
              class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"
            >
              <i class="mb-2 text-3xl pi pi-chart-bar opacity-30"></i>
              <span class="text-xs">Select targets and click Analyze.</span>
            </div>
            <EChart v-else :option="boxPlotOption" class="w-full h-full" />
          </div>
        </div>

        <div
          class="flex-[4] min-h-0 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col relative"
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
                  Correlation Cluster
                </h3>
              </div>

              <div class="flex items-center gap-2 pl-3 ml-2 border-l border-slate-200 dark:border-zinc-700">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mr-1">Analytics:</span>
                <div 
                  class="flex items-center gap-1.5"
                  :class="{ 'opacity-50 pointer-events-none': !hasSearched }"
                >
                  <div 
                    v-for="opt in analyticsOptions" 
                    :key="opt.code"
                    @click="hasSearched && toggleAnalytics(opt.code)"
                    v-tooltip.top="opt.desc"
                    class="flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-200 select-none"
                    :class="[
                      !hasSearched ? 'cursor-not-allowed bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-300' : 'cursor-pointer',
                      selectedAnalytics.includes(opt.code) && hasSearched
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50 dark:text-indigo-300 shadow-sm' 
                        : hasSearched ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-700' : ''
                    ]"
                  >
                    <i 
                      class="pi text-[9px]" 
                      :class="selectedAnalytics.includes(opt.code) && hasSearched ? 'pi-check-circle' : 'pi-circle'"
                    ></i>
                    <span class="text-[10px] font-bold">{{ opt.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-slate-400 font-bold">X:</span>
                <div class="w-28">
                  <Select
                    v-model="scatterX"
                    :options="scatterOptions"
                    class="w-full custom-dropdown small"
                    overlayClass="custom-dropdown-panel small"
                  />
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-slate-400 font-bold">Y:</span>
                <div class="w-28">
                  <Select
                    v-model="scatterY"
                    :options="scatterOptions"
                    class="w-full custom-dropdown small"
                    overlayClass="custom-dropdown-panel small"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="relative flex-1 w-full min-h-0">
            <div
              v-if="!hasSearched"
              class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"
            >
              <i class="mb-2 text-3xl pi pi-chart-scatter opacity-30"></i>
              <span class="text-xs">Scatter plot will appear here.</span>
            </div>
            
            <EChart 
              v-else 
              :key="selectedAnalytics.sort().join(',')" 
              :option="scatterOption" 
              class="w-full h-full" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { waferApi } from "@/api/wafer";
import { equipmentApi } from "@/api/equipment"; 
import EChart from "@/components/common/EChart.vue";

// Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

// Type Definitions
interface ComparisonRow {
  eqpid: string;
  lotid: string;
  waferid: string;
  point?: number;
  [key: string]: string | number | null | undefined;
}

interface FilterState {
  startDate: Date;
  endDate: Date;
  cassetteRcp?: string;
  stageGroup?: string;
  film?: string;
}

// Stores & State
const filterStore = useFilterStore();
const isEqpLoading = ref(false);
const isDataLoading = ref(false);
const hasSearched = ref(false);

// [수정] Analytics State & Options (한글 툴팁 설명 추가)
const selectedAnalytics = ref<string[]>([]); 
const analyticsOptions = ref([
  { name: 'Centroid', code: 'centroid', desc: '군집의 중심점(평균) 표시' },
  { name: '95% Ellipse', code: 'ellipse', desc: '데이터 95% 포함되는 신뢰구간 표시' },
  { name: 'Regression', code: 'regression', desc: '데이터 경향성. 선형 회귀선 표시' }
]);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);

// Reference EQP State
const refEqpId = ref<string>("");
const refEqpList = ref<string[]>([]);

const filters = reactive<FilterState>({
  startDate: new Date(Date.now() - 7 * 864e5),
  endDate: new Date(),
  cassetteRcp: undefined,
  stageGroup: undefined,
  film: undefined,
});

const cassetteRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);

const targetEqps = ref<string[]>([]);
const selectedEqps = ref<string[]>([]);

const rawData = ref<ComparisonRow[]>([]);
const metricOptions = ref<string[]>(["t1", "gof", "mse", "thickness"]);
const scatterOptions = ref<string[]>(["point", "t1", "gof"]);

const selectedMetric = ref<string>("t1");
const scatterX = ref<string>("point");
const scatterY = ref<string>("t1");

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver;

const colors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

const isListVisible = computed(() => {
  if (!filters.stageGroup) return false;
  if (films.value.length > 0 && !filters.film) return false;
  return true;
});

// Lifecycle Hooks
onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  
  const savedSite = localStorage.getItem("pm_site");
  const savedSdwt = localStorage.getItem("pm_sdwt");
  
  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.selectedSite = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
    
    if (savedSdwt) {
      filterStore.selectedSdwt = savedSdwt;
      await loadRefEqpList();
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

onUnmounted(() => themeObserver?.disconnect());

// Handlers
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("pm_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("pm_site");
    sdwts.value = [];
  }
  filterStore.selectedSdwt = "";
  localStorage.removeItem("pm_sdwt");
  
  refEqpId.value = "";
  refEqpList.value = [];
  resetConditions();
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("pm_sdwt", filterStore.selectedSdwt);
    await loadRefEqpList();
  } else {
    localStorage.removeItem("pm_sdwt");
    refEqpList.value = [];
  }
  refEqpId.value = "";
  resetConditions();
};

const loadRefEqpList = async () => {
  if (filterStore.selectedSdwt) {
    refEqpList.value = await equipmentApi.getEqpIds(undefined, filterStore.selectedSdwt, 'wafer');
  }
};

const onRefEqpChange = async () => {
  resetConditions();
  if (refEqpId.value) {
    await loadOptions();
  }
};

const onDateChange = async () => {
  if (refEqpId.value) {
    resetConditions();
    await loadOptions();
  }
};

const resetConditions = () => {
  filters.cassetteRcp = undefined;
  filters.stageGroup = undefined;
  filters.film = undefined;
  cassetteRcps.value = [];
  stageGroups.value = [];
  films.value = [];
  targetEqps.value = [];
  selectedEqps.value = [];
};

const getBaseParams = () => ({
  site: filterStore.selectedSite || "",
  sdwt: filterStore.selectedSdwt || "",
  eqpId: refEqpId.value || "",
  startDate: filters.startDate ? new Date(filters.startDate).toISOString() : "",
  endDate: filters.endDate ? new Date(filters.endDate).toISOString() : "",
});

const loadOptions = async () => {
  if (filterStore.selectedSdwt && refEqpId.value)
    cassetteRcps.value = await waferApi.getDistinctValues(
      "cassettercps",
      getBaseParams()
    );
};

const onCassetteChange = async () => {
  filters.stageGroup = undefined;
  filters.film = undefined;
  selectedEqps.value = [];
  targetEqps.value = [];
  
  if (filters.cassetteRcp) {
    const params = { ...getBaseParams(), cassetteRcp: filters.cassetteRcp };
    stageGroups.value = await waferApi.getDistinctValues("stagegroups", params);
  }
};

const onConditionChange = async () => {
  if (filters.stageGroup) {
    const params = {
      ...getBaseParams(),
      cassetteRcp: filters.cassetteRcp ?? "",
      stageGroup: filters.stageGroup ?? "",
    };
    films.value = await waferApi.getDistinctValues("films", params);
  }
  loadEquipments();
};

const loadEquipments = async () => {
  if (!filters.cassetteRcp || !filters.stageGroup) return;
  
  isEqpLoading.value = true;
  try {
    const params = {
      ...getBaseParams(), 
      cassetteRcp: filters.cassetteRcp ?? "",
      stageGroup: filters.stageGroup ?? "",
      film: filters.film ?? "",
    };
    
    targetEqps.value = await waferApi.getMatchingEquipments(params);
    
    if (refEqpId.value && targetEqps.value.includes(refEqpId.value)) {
        selectedEqps.value = [refEqpId.value];
    } else {
        selectedEqps.value = [];
    }
  } catch (e) {
    console.error(e);
  } finally {
    isEqpLoading.value = false;
  }
};

const toggleEqp = (eqp: string) => {
  if (selectedEqps.value.includes(eqp))
    selectedEqps.value = selectedEqps.value.filter((e) => e !== eqp);
  else selectedEqps.value.push(eqp);
};

const toggleAllEquipments = () => {
  if (selectedEqps.value.length === targetEqps.value.length)
    selectedEqps.value = [];
  else selectedEqps.value = [...targetEqps.value];
};

const toggleAnalytics = (code: string) => {
  // [추가] 차트가 그려지지 않은 상태에서는 동작하지 않음
  if (!hasSearched.value) return; 
  
  const index = selectedAnalytics.value.indexOf(code);
  if (index > -1) {
    selectedAnalytics.value.splice(index, 1);
  } else {
    selectedAnalytics.value.push(code);
  }
};

const loadComparisonData = async () => {
  if (selectedEqps.value.length === 0) return;
  isDataLoading.value = true;
  hasSearched.value = true;

  try {
    const params = {
      ...getBaseParams(),
      cassetteRcp: filters.cassetteRcp ?? "",
      stageGroup: filters.stageGroup ?? "",
      film: filters.film ?? "",
      targetEqps: selectedEqps.value.join(","),
    };
    const data = await waferApi.getComparisonData(params);
    rawData.value = data as ComparisonRow[];

    if (data.length > 0 && data[0]) {
      const measurementKeys = Object.keys(data[0]).filter(
        (k) =>
          !["eqpid", "lotid", "waferid", "point"].includes(k) &&
          typeof data[0][k] === "number"
      );

      if (measurementKeys.length > 0) {
        metricOptions.value = measurementKeys;
        scatterOptions.value = ["point", ...measurementKeys];

        const t1 = measurementKeys.find((k) => k.toLowerCase() === "t1");
        const defaultMetric = t1 || measurementKeys[0] || "";

        if (!selectedMetric.value || !metricOptions.value.includes(selectedMetric.value)) {
             selectedMetric.value = defaultMetric;
        }
        
        scatterX.value = "point";
        scatterY.value = defaultMetric;
      }
    }
  } catch (e) {
    console.error(e);
    rawData.value = [];
  } finally {
    isDataLoading.value = false;
  }
};

const resetFilters = () => {
  filterStore.reset();
  refEqpId.value = "";
  refEqpList.value = [];
  resetConditions();
  hasSearched.value = false;
  selectedAnalytics.value = [];
  localStorage.removeItem("pm_site");
  localStorage.removeItem("pm_sdwt");
};

// --- Math Helpers for Advanced Analytics ---

const getBasicStats = (points: number[][]) => {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0;
  points.forEach((p) => {
    sumX += p[0] ?? 0;
    sumY += p[1] ?? 0;
  });
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sumXX = 0, sumYY = 0, sumXY = 0;
  points.forEach((p) => {
    const x = p[0] ?? 0;
    const y = p[1] ?? 0;
    sumXX += (x - meanX) ** 2;
    sumYY += (y - meanY) ** 2;
    sumXY += (x - meanX) * (y - meanY);
  });

  return {
    meanX, meanY,
    covXX: sumXX / (n - 1),
    covYY: sumYY / (n - 1),
    covXY: sumXY / (n - 1),
  };
};

const getEllipsePoints = (
  meanX: number, meanY: number, covXX: number, covYY: number, covXY: number, steps = 100
) => {
  const lambda1 = (covXX + covYY + Math.sqrt((covXX - covYY) ** 2 + 4 * covXY ** 2)) / 2;
  const lambda2 = (covXX + covYY - Math.sqrt((covXX - covYY) ** 2 + 4 * covXY ** 2)) / 2;

  const chiSquare95 = 5.991;
  const majorAxis = 2 * Math.sqrt(chiSquare95 * Math.abs(lambda1));
  const minorAxis = 2 * Math.sqrt(chiSquare95 * Math.abs(lambda2));

  const angle = Math.atan2(lambda1 - covXX, covXY);

  const points: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const x = (majorAxis / 2) * Math.cos(theta);
    const y = (minorAxis / 2) * Math.sin(theta);

    const rX = x * Math.cos(angle) - y * Math.sin(angle) + meanX;
    const rY = x * Math.sin(angle) + y * Math.cos(angle) + meanY;
    points.push([rX, rY]);
  }
  return points;
};

const getRegressionLine = (points: number[][]) => {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  let minX = Infinity, maxX = -Infinity;

  points.forEach((p) => {
    const x = p[0] ?? 0;
    const y = p[1] ?? 0;
    sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  });

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const padding = (maxX - minX) * 0.1;
  const x1 = minX - padding;
  const x2 = maxX + padding;

  return [
    [x1, slope * x1 + intercept],
    [x2, slope * x2 + intercept],
  ];
};

// --- Chart Options ---

const calculateBoxPlotData = (data: readonly (number | undefined)[]): number[] => {
  const values: number[] = [];
  for (const v of data) {
    if (typeof v === "number" && !Number.isNaN(v)) values.push(v);
  }
  if (values.length === 0) return [0, 0, 0, 0, 0];
  const sorted = values.slice().sort((a, b) => a - b);

  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;

  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  return [min, q1, median, q3, max];
};

const quantile = (sorted: number[], q: number): number => {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  const baseVal = sorted[base] ?? 0;
  const nextVal = sorted[base + 1];

  if (typeof nextVal === "number") {
    return baseVal + rest * (nextVal - baseVal);
  }
  return baseVal;
};

const boxPlotOption = computed(() => {
  if (rawData.value.length === 0) return {};
  const categories = selectedEqps.value;
  const boxData: number[][] = [];
  const outliers: number[][] = [];

  categories.forEach((eqp, index) => {
    const values: number[] = [];
    for (const r of rawData.value) {
      if (r.eqpid !== eqp) continue;
      const v = r[selectedMetric.value];
      if (typeof v === "number" && !Number.isNaN(v)) values.push(v);
    }
    const stats = calculateBoxPlotData(values);
    boxData.push(stats);

    const q1 = stats[1] ?? 0;
    const q3 = stats[3] ?? 0;
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;

    values.forEach((v) => {
      if (v < lower || v > upper) outliers.push([index, v]);
    });
  });

  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "item", confine: true },
    grid: { left: 50, right: 20, bottom: 30, top: 30 },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: selectedMetric.value.toUpperCase(),
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: "boxplot",
        type: "boxplot",
        data: boxData,
        itemStyle: {
          color: "#0ea5e9",
          borderColor: isDarkMode.value ? "#fff" : "#555",
        },
      },
      {
        name: "outlier",
        type: "scatter",
        data: outliers,
        itemStyle: { color: "#ef4444" },
      },
    ],
  };
});

const scatterOption = computed(() => {
  if (rawData.value.length === 0) return {};
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  // Check Analytics State
  const showCentroid = selectedAnalytics.value.includes('centroid');
  const showEllipse = selectedAnalytics.value.includes('ellipse');
  const showRegression = selectedAnalytics.value.includes('regression');

  const series: any[] = [];

  selectedEqps.value.forEach((eqp, idx) => {
    const color = colors[idx % colors.length];

    const points = rawData.value
      .filter(
        (r): r is ComparisonRow & Record<string, number> =>
          r.eqpid === eqp &&
          typeof r[scatterX.value] === "number" &&
          typeof r[scatterY.value] === "number"
      )
      .map((r) => [
        r[scatterX.value] as number,
        r[scatterY.value] as number,
        r.lotid,
        r.waferid,
      ]);

    // Main Scatter Series
    series.push({
      name: eqp,
      type: "scatter",
      symbolSize: 6,
      itemStyle: { color: color, opacity: selectedAnalytics.value.length > 0 ? 0.3 : 0.8 },
      data: points,
      emphasis: { focus: "series" },
    });

    if (points.length > 2) {
      const numPoints = points.map((p) => [Number(p[0]), Number(p[1])]);
      const stats = getBasicStats(numPoints);

      if (stats) {
        if (showCentroid) {
          series.push({
            name: `${eqp} Center`,
            type: "scatter",
            symbol: "diamond",
            symbolSize: 12,
            itemStyle: {
              color: color,
              borderColor: isDarkMode.value ? "#fff" : "#000",
              borderWidth: 1,
              opacity: 1,
            },
            data: [[stats.meanX, stats.meanY]],
            tooltip: {
              formatter: `${eqp} Center<br/>X: ${stats.meanX.toFixed(3)}<br/>Y: ${stats.meanY.toFixed(3)}`,
            },
            z: 100,
          });
        }

        if (showEllipse) {
          const ellipsePoints = getEllipsePoints(
            stats.meanX, stats.meanY, stats.covXX, stats.covYY, stats.covXY
          );
          series.push({
            name: `${eqp} 95% Conf.`,
            type: "line",
            symbol: "none",
            smooth: true,
            data: ellipsePoints,
            lineStyle: { width: 1, type: "dashed", color: color },
            itemStyle: { color: color },
            z: 50,
          });
        }

        if (showRegression) {
          const regLine = getRegressionLine(numPoints);
          if (regLine) {
            series.push({
              name: `${eqp} Regression`,
              type: "line",
              symbol: "none",
              data: regLine,
              lineStyle: { width: 2, type: "solid", color: color },
              itemStyle: { color: color },
              z: 60,
            });
          }
        }
      }
    }
  });

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: isDarkMode.value ? "rgba(24,24,27,0.9)" : "rgba(255,255,255,0.95)",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
      formatter: (params: any) => {
        if (
          params.seriesName.includes("Center") ||
          params.seriesName.includes("Regression") ||
          params.seriesName.includes("Conf.")
        ) {
          return `<div class="text-xs font-bold">${params.seriesName}</div>`;
        }
        return `
          <div class="mb-1 text-xs font-bold">${params.seriesName}</div>
          Lot: ${params.data[2]}<br/>
          Wafer: ${params.data[3]}<br/>
          ${scatterX.value}: <b>${Number(params.data[0]).toFixed(3)}</b><br/>
          ${scatterY.value}: <b>${Number(params.data[1]).toFixed(3)}</b>
        `;
      },
    },
    legend: { type: "scroll", top: 0, textStyle: { color: textColor } },
    grid: { left: 50, right: 30, bottom: 30, top: 40 },
    xAxis: {
      type: "value",
      name: scatterX.value.toUpperCase(),
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: scatterY.value.toUpperCase(),
      scale: true,
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } },
    },
    dataZoom: [
      { type: "inside", xAxisIndex: 0, filterMode: "filter" },
      { type: "inside", yAxisIndex: 0, filterMode: "filter" },
    ],
    series: series,
  };
});
</script>

<style scoped>
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
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

<style>
.custom-dropdown-panel.small .p-select-option {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
.custom-dropdown-panel.small .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
</style>
