<!-- frontend/src/views/SpectrumAnalysisView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden">
    
    <div class="flex items-center gap-3 px-1 mb-3 shrink-0">
      <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <i class="text-lg text-indigo-500 pi pi-wave-pulse dark:text-indigo-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Spectrum Analysis</h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-[11px]">Wavelength vs Intensity multi-wafer comparison.</span>
      </div>
    </div>

    <div class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300">
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
        <div class="min-w-[120px] shrink-0">
          <Select v-model="filterStore.selectedSite" :options="sites" placeholder="Site" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" :class="{ '!text-slate-400': !filterStore.selectedSite }" @change="onSiteChange" />
        </div>
        <div class="min-w-[140px] shrink-0">
          <Select v-model="filterStore.selectedSdwt" :options="sdwts" placeholder="SDWT" :disabled="!filterStore.selectedSite" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" :class="{ '!text-slate-400': !filterStore.selectedSdwt }" @change="onSdwtChange" />
        </div>
        <div class="min-w-[140px] shrink-0">
          <Select v-model="filters.eqpId" :options="eqpIds" filter placeholder="EQP ID" :disabled="!filterStore.selectedSdwt" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" :class="{ '!text-slate-400': !filters.eqpId }" @change="onEqpChange" />
        </div>
        
        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[160px] shrink-0">
          <Select v-model="filters.lotId" :options="lotIds" filter placeholder="Lot ID" :disabled="!filters.eqpId" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" :class="{ '!text-slate-400': !filters.lotId }" @change="onLotChange" />
        </div>

        <div class="min-w-[120px] shrink-0">
          <DatePicker v-model="filters.startDate" showIcon dateFormat="yy-mm-dd" placeholder="Start" class="w-full custom-dropdown small date-picker" :disabled="!filters.eqpId" @update:model-value="onDateChange" />
        </div>
        <div class="min-w-[120px] shrink-0">
          <DatePicker v-model="filters.endDate" showIcon dateFormat="yy-mm-dd" placeholder="End" class="w-full custom-dropdown small date-picker" :disabled="!filters.eqpId" @update:model-value="onDateChange" />
        </div>
      </div>
      
      <div class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800">
        <Button icon="pi pi-refresh" text rounded severity="secondary" v-tooltip.bottom="'Reset'" class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors" @click="resetFilters" />
      </div>
    </div>

    <div v-if="filters.lotId" class="flex flex-1 min-h-0 gap-3 pb-2 overflow-hidden lg:flex-row flex-col animate-fade-in">
      
      <div class="flex flex-col w-full lg:w-72 shrink-0 bg-white dark:bg-[#111111] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div class="p-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-filter"></i> Target Selection
            </h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            
            <div class="space-y-3">
                <div class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <span class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px]">1</span>
                    Process Condition
                </div>
                
                <div class="pl-2 space-y-2">
                    <div>
                        <label class="text-[10px] text-slate-400 block mb-1">CASSETTE RCP</label>
                        <Select 
                            v-model="filters.cassetteRcp" 
                            :options="cassetteRcps" 
                            placeholder="Select Recipe" 
                            class="w-full custom-dropdown small" 
                            overlayClass="custom-dropdown-panel small"
                            :class="{ '!text-slate-400': !filters.cassetteRcp }"
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
                            :class="{ '!text-slate-400': !filters.stageGroup }"
                            @change="onStageGroupChange"
                        />
                    </div>
                </div>
            </div>

            <div class="h-px bg-slate-100 dark:bg-zinc-800"></div>

            <div class="space-y-2">
                <div class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <span class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px]">2</span>
                    Measurement Point
                </div>
                <div class="pl-2">
                    <div v-if="isPointsLoading" class="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400">
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
                    <small v-if="filters.stageGroup && !isPointsLoading && pointIds.length === 0" class="text-[10px] text-rose-400 ml-1">No points found.</small>
                </div>
            </div>

            <div class="h-px bg-slate-100 dark:bg-zinc-800"></div>

            <div class="flex flex-col flex-1 min-h-0">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        <span class="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px]">3</span>
                        Wafers ({{ selectedWafers.length }})
                    </div>
                    <button 
                        v-if="filters.stageGroup"
                        @click="toggleAllWafers" 
                        class="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold transition-colors"
                    >
                        {{ selectedWafers.length === waferList.length && waferList.length > 0 ? "Deselect All" : "Select All" }}
                    </button>
                </div>
                
                <div class="pl-2">
                    <div v-if="!filters.stageGroup" class="text-[10px] text-slate-400 italic py-2">Select conditions first.</div>
                    
                    <div v-else class="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-1 max-h-[200px]">
                        <div v-for="w in waferList" :key="w" @click="toggleWafer(w)" class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all border group" :class="selectedWafers.includes(w) ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50' : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'">
                            <div class="w-4 h-4 rounded border flex items-center justify-center transition-colors" :class="selectedWafers.includes(w) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'">
                                <i v-if="selectedWafers.includes(w)" class="pi pi-check text-white text-[8px] font-bold"></i>
                            </div>
                            <span class="text-xs font-mono font-medium" :class="selectedWafers.includes(w) ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'">Wafer #{{ w }}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="mt-auto p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
          <Button label="Analyze Spectrum" icon="pi pi-search" class="w-full !text-xs !font-bold !py-2.5 !rounded-lg !bg-indigo-600 hover:!bg-indigo-700 !border-indigo-600" :loading="isLoading" :disabled="!isReadyToSearch" @click="searchData" />
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 relative">
        <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-indigo-500 rounded-full"></div>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">Spectrum Trend</h3>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="chartSeries.length > 0" class="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Range: 200nm ~ 800nm</span>
          </div>
        </div>
        <div class="relative flex-1 w-full min-h-0 bg-slate-50/30 dark:bg-black/20">
          <div v-if="!hasSearched" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60 select-none">
            <div class="w-16 h-16 bg-slate-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-3">
              <i class="pi pi-chart-line text-2xl text-slate-300 dark:text-zinc-600"></i>
            </div>
            <p class="text-xs font-bold text-slate-500">No Data Displayed</p>
            <p class="text-[10px]">Select conditions on the left and click Analyze.</p>
          </div>
          <EChart v-else :option="chartOption" class="w-full h-full" @chartCreated="onChartCreated" />
          <transition name="fade">
            <button v-if="isZoomed" @click="resetZoom" class="absolute top-3 right-3 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all z-10 cursor-pointer">
              <i class="pi pi-refresh text-[9px]"></i> Reset Zoom
            </button>
          </transition>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]">
      <div class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800">
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
  () => filters.lotId && filters.cassetteRcp && filters.stageGroup && filters.pointId && selectedWafers.value.length > 0
);

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  const savedSite = localStorage.getItem("spec_site");
  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.selectedSite = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
  }
  themeObserver = new MutationObserver((m) => {
    m.forEach((mu) => {
      if (mu.attributeName === "class")
        isDarkMode.value = document.documentElement.classList.contains("dark");
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => { if (themeObserver) themeObserver.disconnect(); });

// Global Filter Handlers
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("spec_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else { sdwts.value = []; }
  resetFrom(0);
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    eqpIds.value = await equipmentApi.getEqpIds(undefined, filterStore.selectedSdwt);
  } else { eqpIds.value = []; }
  resetFrom(1);
};

const onEqpChange = () => { 
  if (filters.eqpId) loadLotIds(); 
  else resetFrom(2); 
};

// --- Sidebar Cascade Logic (날짜 포함) ---

const onLotChange = async () => {
  if (filters.lotId) {
    // [중요] LotID 식별을 위해 Date Range 포함
    cassetteRcps.value = await waferApi.getDistinctValues("cassettercps", {
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    });
  }
  resetFrom(3);
};

const onCassetteChange = async () => {
  if (filters.cassetteRcp) {
    stageGroups.value = await waferApi.getDistinctValues("stagegroups", {
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      cassetteRcp: filters.cassetteRcp,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    });
  }
  resetFrom(4);
};

const onStageGroupChange = async () => {
  if (filters.stageGroup) {
    const wafers = await waferApi.getDistinctValues("waferids", {
       eqpId: filters.eqpId,
       lotId: filters.lotId,
       cassetteRcp: filters.cassetteRcp,
       stageGroup: filters.stageGroup,
       startDate: filters.startDate?.toISOString(),
       endDate: filters.endDate?.toISOString()
    });
    waferList.value = wafers.sort((a, b) => Number(a) - Number(b));
    selectedWafers.value = wafers.slice(0, 3); 

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
      endDate: filters.endDate?.toISOString()
    });
    pointIds.value = points;
    if (points.length > 0) {
      filters.pointId = points[0] ?? "";
    }
  } catch (e) {
    console.error(e);
  } finally {
    isPointsLoading.value = false;
  }
};

const onDateChange = () => { if (filters.eqpId) loadLotIds(); };

const resetFrom = (level: number) => {
  if (level <= 0) { filterStore.selectedSdwt = ""; eqpIds.value = []; }
  if (level <= 1) { filters.eqpId = ""; }
  if (level <= 2) { filters.lotId = ""; lotIds.value = []; }
  if (level <= 3) { 
    filters.cassetteRcp = ""; cassetteRcps.value = []; 
  }
  if (level <= 4) {
    filters.stageGroup = ""; stageGroups.value = [];
  }
  if (level <= 5) {
    waferList.value = []; selectedWafers.value = []; 
    pointIds.value = []; filters.pointId = "";
    chartSeries.value = []; hasSearched.value = false; 
  }
};

const loadLotIds = async () => {
  lotIds.value = await waferApi.getDistinctValues("lotids", {
    eqpId: filters.eqpId, startDate: filters.startDate?.toISOString(), endDate: filters.endDate?.toISOString(),
  });
};

const toggleWafer = (w: string) => {
  if (selectedWafers.value.includes(w)) selectedWafers.value = selectedWafers.value.filter((item) => item !== w);
  else selectedWafers.value.push(w);
};
const toggleAllWafers = () => {
  if (selectedWafers.value.length === waferList.value.length) selectedWafers.value = [];
  else selectedWafers.value = [...waferList.value];
};

const searchData = async () => {
  if (!isReadyToSearch.value) return;
  isLoading.value = true;
  hasSearched.value = true;
  isZoomed.value = false;
  try {
    chartSeries.value = await waferApi.getSpectrumTrend({
      lotId: filters.lotId, 
      pointId: filters.pointId, 
      waferIds: selectedWafers.value.join(","),
    });
  } catch (e) { console.error(e); chartSeries.value = []; } finally { isLoading.value = false; }
};

const resetFilters = () => { filterStore.reset(); resetFrom(0); };
const onChartCreated = (instance: any) => {
  chartInstance = instance;
  instance.on('dataZoom', () => { const opt = instance.getOption(); if(opt.dataZoom && opt.dataZoom[0]) { const s = opt.dataZoom[0].start; const e = opt.dataZoom[0].end; isZoomed.value = (s > 0 || e < 100); } });
};
const resetZoom = () => { if(chartInstance) { chartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 }); isZoomed.value = false; } };

const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0", textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 }, axisPointer: { type: "cross" } },
    legend: { data: chartSeries.value.map((s) => s.name), textStyle: { color: textColor, fontSize: 11 }, type: "scroll", top: 0, icon: "circle" },
    grid: { left: 50, right: 30, top: 40, bottom: 40, containLabel: false },
    dataZoom: [{ type: "inside", xAxisIndex: 0 }, { type: "slider", xAxisIndex: 0, bottom: 0, height: 16, borderColor: 'transparent', fillerColor: 'rgba(99, 102, 241, 0.1)' }],
    xAxis: { type: "value", name: "Wavelength (nm)", nameLocation: "middle", nameGap: 25, nameTextStyle: { color: textColor, fontWeight: "bold", fontSize: 11 }, min: 200, max: 800, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { show: true, lineStyle: { color: gridColor, type: 'dashed' } }, axisLine: { lineStyle: { color: gridColor } } },
    yAxis: { type: "value", name: "Intensity", scale: true, nameTextStyle: { color: textColor, fontSize: 11, padding: [0, 20, 0, 0] }, axisLabel: { color: textColor, fontSize: 10 }, splitLine: { lineStyle: { color: gridColor } } },
    series: chartSeries.value.map((s) => ({ name: s.name, type: "line", data: s.data, smooth: true, showSymbol: false, lineStyle: { width: 1.5 }, emphasis: { focus: "series" } })),
  };
});
</script>

<style scoped>
:deep(.p-select), :deep(.custom-dropdown) { @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors; }
:deep(.custom-dropdown .p-select-label) { @apply text-[12px] py-[5px] px-3; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.date-picker .p-inputtext) { @apply !text-[12px] !py-1 !px-2 !h-7; }
:deep(.p-select-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none; }
:deep(.p-select-dropdown svg) { @apply w-3 h-3; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
