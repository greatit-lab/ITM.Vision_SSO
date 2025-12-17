<!-- frontend/src/views/LotUniformityTrendView.vue -->
<template>
  <div class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden">
    <div class="flex items-center gap-3 px-1 mb-3 shrink-0">
      <div class="flex items-center justify-center w-8 h-8 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800">
        <i class="text-xl text-teal-600 pi pi-chart-line dark:text-teal-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Lot Uniformity
        </h1>
        <span class="text-slate-400 dark:text-slate-500 font-medium text-xs">
          Intra-wafer uniformity trend analysis.
        </span>
      </div>
    </div>

    <div class="mb-3 bg-white dark:bg-[#111111] p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-sm shrink-0 transition-colors duration-300">
      <div class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide">
        <div class="min-w-[140px] shrink-0">
          <Select v-model="filterStore.selectedSite" :options="sites" placeholder="Site" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onSiteChange" />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select v-model="filterStore.selectedSdwt" :options="sdwts" placeholder="SDWT" :disabled="!filterStore.selectedSite" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onSdwtChange" />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select v-model="filters.eqpId" :options="eqpIds" filter placeholder="EQP ID" :disabled="!filterStore.selectedSdwt" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onEqpChange" />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select v-model="filters.lotId" :options="lotIds" filter placeholder="Lot ID" :disabled="!filters.eqpId" showClear class="w-full custom-dropdown small" overlayClass="custom-dropdown-panel small" @change="onLotChange" />
        </div>
        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-2 shrink-0"></div>
        <div class="min-w-[140px] shrink-0">
          <DatePicker v-model="filters.startDate" showIcon dateFormat="yy-mm-dd" placeholder="Start" class="w-full custom-dropdown small date-picker" :disabled="!filters.eqpId" @update:model-value="onDateChange" />
        </div>
        <div class="min-w-[140px] shrink-0">
          <DatePicker v-model="filters.endDate" showIcon dateFormat="yy-mm-dd" placeholder="End" class="w-full custom-dropdown small date-picker" :disabled="!filters.eqpId" @update:model-value="onDateChange" />
        </div>
      </div>
      
      <div class="flex items-center gap-2 pl-3 border-l shrink-0 border-slate-100 dark:border-zinc-800">
        <Button 
          icon="pi pi-search" 
          rounded 
          class="!bg-teal-600 !border-teal-600 hover:!bg-teal-700 !w-8 !h-8 !text-xs !shadow-sm" 
          v-tooltip.bottom="'Search Options'"
          :disabled="!filters.lotId"
          :loading="isTopLoading"
          @click="onTopSearch" 
        />
        <Button icon="pi pi-refresh" text rounded severity="secondary" v-tooltip.bottom="'Reset'" class="!w-8 !h-8 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors" @click="resetFilters" />
      </div>
    </div>

    <div v-if="hasTopSearched" class="flex flex-col mb-3 shrink-0 animate-fade-in">
      <div class="flex flex-col md:flex-row gap-3 bg-white dark:bg-[#111111] p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm h-[165px]">
        
        <template v-for="(step, idx) in steps" :key="idx">
          <div class="flex flex-col flex-1 min-w-0 border rounded-xl border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 overflow-hidden transition-all duration-300"
               :class="{ 'opacity-50 grayscale pointer-events-none': step.disabled, 'ring-1 ring-teal-500/30 bg-teal-50/30 dark:bg-teal-900/10': step.selected }">
            
            <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <span class="flex items-center justify-center w-4 h-4 text-[9px] text-white rounded bg-slate-400 dark:bg-zinc-600"
                      :class="{'!bg-teal-500': step.selected}">{{ idx + 1 }}</span>
                {{ step.title }}
              </div>
              <i v-if="step.selected" class="pi pi-check-circle text-teal-500 text-xs"></i>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-1">
              <ul class="space-y-0.5">
                <li v-if="step.list.length === 0" class="py-4 text-[11px] text-center text-slate-400 italic flex flex-col items-center gap-1">
                   <i v-if="step.loading" class="pi pi-spin pi-spinner text-teal-500"></i>
                   <span>{{ step.emptyMsg }}</span>
                </li>
                <li v-for="item in step.list" :key="item" @click="step.action(item)"
                    class="px-3 py-1.5 text-[11px] font-medium rounded-lg cursor-pointer transition-all flex items-center justify-between group"
                    :class="step.selected === item 
                      ? 'bg-teal-500 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800'">
                  <span class="truncate">{{ item }}</span>
                  <i v-if="step.title === 'Y-Axis Metric' && step.selected === item" class="pi pi-chart-line text-[10px]"></i>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="idx < steps.length - 1" class="hidden md:flex items-center justify-center text-slate-300 dark:text-zinc-700">
            <i class="pi pi-angle-right text-lg"></i>
          </div>
        </template>

        <div class="flex items-center justify-center pl-2 md:pl-4 md:border-l border-dashed border-slate-200 dark:border-zinc-800 shrink-0">
          <Button 
            class="!flex !flex-col !items-center !justify-center !gap-1 !w-20 !h-full !rounded-xl !text-xs !font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md border-0"
            :class="isReadyToSearch 
              ? '!bg-gradient-to-br !from-indigo-500 !to-indigo-600 hover:!from-indigo-600 hover:!to-indigo-700 !text-white !cursor-pointer' 
              : '!bg-slate-100 dark:!bg-zinc-800 !text-slate-400 !cursor-not-allowed'"
            :loading="isLoading" 
            :disabled="!isReadyToSearch" 
            @click="searchData" 
            v-tooltip.left="'Generate Trend Chart'" 
          >
            <i class="text-2xl pi pi-chart-line mb-1" :class="{'animate-pulse': isLoading}"></i>
            <span>Analyze</span>
          </Button>
        </div>
      </div>
    </div>

    <div v-if="hasSearched" class="flex h-[565px] shrink-0 gap-3 pb-2 overflow-hidden lg:flex-row flex-col animate-fade-in">
      
      <div class="flex flex-col flex-1 overflow-hidden bg-white border shadow-sm rounded-2xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-teal-500 rounded-full"></div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Trend by Point ({{ filters.metric?.toUpperCase() }})
            </h3>
          </div>
          <span class="text-[10px] text-slate-400 font-mono" v-if="chartSeries.length > 0">
             {{ chartSeries.length }} Wafers / {{ totalPoints }} Points
          </span>
        </div>
        <div class="relative flex-1 w-full min-h-0">
          <EChart :option="lineChartOption" class="w-full h-full" @click="onLineChartClick" />
        </div>
      </div>

      <div class="flex flex-col flex-none aspect-square overflow-hidden bg-white border shadow-sm rounded-2xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <div class="flex items-center gap-2">
            <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Wafer Map
            </h3>
          </div>
          <div class="flex bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg">
            <button @click="setMapMode('point')" class="px-3 py-1 text-[10px] font-bold rounded-md transition-all"
              :class="mapMode === 'point' ? 'bg-white dark:bg-zinc-700 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'">Point</button>
            <button @click="setMapMode('heatmap')" class="px-3 py-1 text-[10px] font-bold rounded-md transition-all"
              :class="mapMode === 'heatmap' ? 'bg-white dark:bg-zinc-700 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'">Heatmap</button>
          </div>
        </div>

        <div class="px-4 py-2 bg-white dark:bg-zinc-900 border-b border-dashed border-slate-100 dark:border-zinc-800 flex items-center gap-2 h-10 shrink-0 overflow-hidden transition-opacity duration-300"
             :class="{ 'opacity-40 pointer-events-none grayscale': mapMode === 'point' }">
           <span class="text-[10px] text-slate-500 font-bold shrink-0">Wafer:</span>
           <div class="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
             <button v-for="wId in availableWafers" :key="wId"
               @click="selectWafer(wId)"
               class="min-w-[28px] h-[22px] text-[10px] font-mono rounded flex items-center justify-center transition-all shrink-0 border"
               :class="selectedWaferId === wId 
                 ? 'bg-teal-500 text-white border-teal-500 font-bold shadow-sm' 
                 : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400 hover:border-teal-300 hover:text-teal-600'">
               {{ wId }}
             </button>
           </div>
        </div>

        <div class="relative flex-1 w-full min-h-0 p-3 flex items-center justify-center overflow-hidden">
          <div class="relative h-full w-full max-w-full aspect-square flex items-center justify-center bg-slate-50/30 dark:bg-black/20 rounded-full border border-dashed border-slate-200 dark:border-zinc-800/50">
             <div v-if="mapMode === 'heatmap' && !selectedWaferId" 
                  class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] text-center p-4 rounded-full">
                <i class="pi pi-th-large text-2xl text-slate-400 mb-2 animate-pulse"></i>
                <p class="text-xs font-bold text-slate-600 dark:text-slate-300">Select a Wafer</p>
                <p class="text-[10px] text-slate-400 mt-1">Select from the list above or click the trend line.</p>
             </div>
             <EChart :option="mapChartOption" class="w-full h-full rounded-full overflow-hidden" :key="mapMode" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]">
      <div class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800">
        <i class="text-4xl pi pi-chart-scatter text-slate-300 dark:text-zinc-600"></i>
      </div>
      <p class="text-sm font-medium">Ready to Analyze</p>
      <p class="text-xs mt-1">Select filters and click search to view trends.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { waferApi, type LotUniformitySeriesDto } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

const filterStore = useFilterStore();
const isLoading = ref(false);
const isTopLoading = ref(false);
const hasTopSearched = ref(false);
const hasSearched = ref(false);
const mapMode = ref<'point' | 'heatmap'>('point');
const selectedWaferId = ref<number | null>(null);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const cassetteRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);
const metrics = ref<string[]>([]);

const isMetricLoading = ref(false);

const filters = reactive({
  eqpId: "", lotId: "", startDate: new Date(Date.now() - 7 * 864e5), endDate: new Date(),
  cassetteRcp: "", stageGroup: "", film: "", metric: ""
});

const chartSeries = ref<LotUniformitySeriesDto[]>([]);
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

const steps = computed(() => [
  { 
    title: 'Cassette RCP', 
    list: cassetteRcps.value, 
    selected: filters.cassetteRcp, 
    action: selectCassette, 
    disabled: false, 
    loading: false, 
    emptyMsg: 'No Data' 
  },
  { 
    title: 'Stage Group', 
    list: stageGroups.value, 
    selected: filters.stageGroup, 
    action: selectStageGroup, 
    disabled: !filters.cassetteRcp, 
    loading: false, 
    emptyMsg: 'Select Previous' 
  },
  { 
    title: 'Film', 
    list: films.value, 
    selected: filters.film, 
    action: selectFilm, 
    disabled: !filters.stageGroup, 
    loading: false, 
    emptyMsg: 'Select Previous' 
  },
  { 
    title: 'Y-Axis Metric', 
    list: metrics.value, 
    selected: filters.metric, 
    action: (v: string) => filters.metric = v, 
    disabled: !filters.stageGroup, 
    loading: isMetricLoading.value, 
    emptyMsg: isMetricLoading.value ? 'Loading...' : (filters.film ? 'No Metrics Found' : 'Select Film First') 
  }
]);

const isReadyToSearch = computed(() => filters.lotId && filters.cassetteRcp && filters.stageGroup && filters.film && filters.metric);
const availableWafers = computed(() => chartSeries.value.map(s => s.waferId).sort((a, b) => a - b));
const totalPoints = computed(() => chartSeries.value.reduce((acc, s) => acc + s.dataPoints.length, 0));

const globalStats = computed(() => {
  if (chartSeries.value.length === 0) return { min: 0, max: 100 };
  let allValues: number[] = [];
  chartSeries.value.forEach(s => { s.dataPoints.forEach(p => allValues.push(p.value)); });
  if (allValues.length === 0) return { min: 0, max: 100 };
  return { min: Math.min(...allValues), max: Math.max(...allValues) };
});

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  const savedSite = localStorage.getItem("lot_site");
  const savedSdwt = localStorage.getItem("lot_sdwt");
  const savedEqpId = localStorage.getItem("lot_eqpid");

  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.selectedSite = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
    if (savedSdwt) {
      filterStore.selectedSdwt = savedSdwt;
      eqpIds.value = await equipmentApi.getEqpIds(undefined, savedSdwt);
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        filters.eqpId = savedEqpId;
        await loadLotIds(); 
      }
    }
  }
  themeObserver = new MutationObserver((m) => { m.forEach((mu) => { if (mu.attributeName === "class") isDarkMode.value = document.documentElement.classList.contains("dark"); }); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});
onUnmounted(() => themeObserver?.disconnect());

const clearStepsFrom = (stepIndex: number) => {
  if (stepIndex <= 0) { filters.lotId = ""; lotIds.value = []; hasTopSearched.value = false; }
  if (stepIndex <= 1) { filters.cassetteRcp = ""; cassetteRcps.value = []; }
  if (stepIndex <= 2) { filters.stageGroup = ""; stageGroups.value = []; }
  if (stepIndex <= 3) { filters.film = ""; films.value = []; filters.metric = ""; metrics.value = []; }
  hasSearched.value = false; chartSeries.value = []; selectedWaferId.value = null;
};

const onSiteChange = async () => { 
  if(filterStore.selectedSite) { localStorage.setItem("lot_site", filterStore.selectedSite); sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite); } 
  else { sdwts.value=[]; } 
  filterStore.selectedSdwt = ""; localStorage.removeItem("lot_sdwt"); 
  filters.eqpId = ""; localStorage.removeItem("lot_eqpid");
  clearStepsFrom(0); 
};
const onSdwtChange = async () => { 
  if(filterStore.selectedSdwt) { localStorage.setItem("lot_sdwt", filterStore.selectedSdwt); eqpIds.value = await equipmentApi.getEqpIds(undefined, filterStore.selectedSdwt); } 
  else { eqpIds.value=[]; } 
  filters.eqpId = ""; localStorage.removeItem("lot_eqpid");
  clearStepsFrom(0); 
};
const onEqpChange = () => { 
  if (filters.eqpId) { localStorage.setItem("lot_eqpid", filters.eqpId); loadLotIds(); } 
  else { clearStepsFrom(0); } 
};

const onLotChange = () => { 
  clearStepsFrom(1);
  hasTopSearched.value = false;
};

const onDateChange = () => { if(filters.eqpId) loadLotIds(); };

const onTopSearch = async () => {
  if (!filters.lotId) return;
  isTopLoading.value = true;
  try {
    clearStepsFrom(1);
    await loadCassettes();
    hasTopSearched.value = true;
  } finally {
    isTopLoading.value = false;
  }
};

const loadLotIds = async () => { lotIds.value = await waferApi.getDistinctValues("lotids", getBaseParams()); };

const loadCassettes = async () => { 
  cassetteRcps.value = await waferApi.getDistinctValues("cassettercps", { ...getBaseParams(), lotId: filters.lotId }); 
};

const selectCassette = async (val: string) => { 
  filters.cassetteRcp = val; filters.stageGroup = ""; stageGroups.value = []; filters.film = ""; films.value = []; filters.metric = ""; metrics.value = [];
  stageGroups.value = await waferApi.getDistinctValues("stagegroups", { ...getBaseParams(), lotId: filters.lotId, cassetteRcp: val }); 
};

const selectStageGroup = async (val: string) => {
  filters.stageGroup = val; filters.film = ""; films.value = []; filters.metric = ""; metrics.value = [];
  films.value = await waferApi.getDistinctValues("films", { ...getBaseParams(), lotId: filters.lotId, cassetteRcp: filters.cassetteRcp, stageGroup: val });
};

const selectFilm = async (val: string) => {
  filters.film = val; filters.metric = ""; metrics.value = []; 
  isMetricLoading.value = true;
  try {
    const p = { ...getBaseParams(), lotId: filters.lotId, cassetteRcp: filters.cassetteRcp, stageGroup: filters.stageGroup, film: val };
    const m = await waferApi.getAvailableMetrics(p);
    metrics.value = m.sort((a, b) => { 
      if (a.toLowerCase() === 't1') return -1; 
      if (b.toLowerCase() === 't1') return 1; 
      return a.localeCompare(b); 
    });
    if (metrics.value.length > 0) { filters.metric = metrics.value[0] ?? ""; }
  } finally {
    isMetricLoading.value = false;
  }
};

const getBaseParams = () => ({ eqpId: filters.eqpId, startDate: filters.startDate?.toISOString(), endDate: filters.endDate?.toISOString() });

const searchData = async () => {
  if (!isReadyToSearch.value) return; 
  isLoading.value = true; 
  hasSearched.value = true; 
  selectedWaferId.value = null;
  try { 
    chartSeries.value = await waferApi.getLotUniformityTrend({ 
      ...getBaseParams(), 
      lotId: filters.lotId, 
      cassetteRcp: filters.cassetteRcp, 
      stageGroup: filters.stageGroup, 
      film: filters.film, 
      metric: filters.metric 
    }); 
  } finally { 
    isLoading.value = false; 
  }
};

const resetFilters = () => { 
  filterStore.reset(); 
  localStorage.removeItem("lot_site"); localStorage.removeItem("lot_sdwt"); localStorage.removeItem("lot_eqpid"); 
  filters.eqpId=""; filters.startDate=new Date(Date.now()-7*864e5); filters.endDate=new Date(); 
  sdwts.value=[]; eqpIds.value=[]; 
  clearStepsFrom(0); 
};

const setMapMode = (mode: 'point' | 'heatmap') => { mapMode.value = mode; if (mode === 'point') { selectedWaferId.value = null; } };
const selectWafer = (id: number) => { selectedWaferId.value = id; mapMode.value = 'heatmap'; };
const onLineChartClick = (params: any) => { if (params.seriesName) { const id = parseInt(params.seriesName.replace('W', '')); if (!isNaN(id)) { selectedWaferId.value = id; mapMode.value = 'heatmap'; } } };

const getHeatmapColor = (value: number, min: number, max: number) => {
  if (isNaN(value)) return `rgba(0,0,0,0)`;
  let ratio = (value - min) / (max - min);
  ratio = Math.max(0, Math.min(1, ratio));
  const stops = [ { pos: 0.0, r: 59, g: 130, b: 246 }, { pos: 0.25, r: 6, g: 182, b: 212 }, { pos: 0.5, r: 34, g: 197, b: 94 }, { pos: 0.75, r: 234, g: 179, b: 8 }, { pos: 1.0, r: 239, g: 68, b: 68 } ];
  let lowerIndex = 0;
  for (let i = 0; i < stops.length - 1; i++) { const nextStop = stops[i + 1]; if (nextStop && ratio <= nextStop.pos) { lowerIndex = i; break; } lowerIndex = i; }
  const s1 = stops[lowerIndex]; const s2 = stops[lowerIndex + 1] || stops[stops.length - 1];
  if (!s1 || !s2) return `rgb(59, 130, 246)`;
  const t = (ratio - s1.pos) / (s2.pos - s1.pos);
  const r = Math.round(s1.r + (s2.r - s1.r) * t); const g = Math.round(s1.g + (s2.g - s1.g) * t); const b = Math.round(s1.b + (s2.b - s1.b) * t);
  return `rgb(${r},${g},${b})`;
};

// [핵심 변경] 데이터 보간 로직 개선 (Spotlight 현상 제거 & 부드러운 그라데이션)
const interpolateData = (targetPoints: {x:number, y:number, value:number}[]) => {
  const RESOLUTION = 180; // [변경] 해상도 상향 (더 부드러운 입자)
  const LIMIT = 150; 
  const STEP = (LIMIT * 2) / RESOLUTION; 
  const result = [];
  
  for (let x = -LIMIT; x <= LIMIT; x += STEP) {
    for (let y = -LIMIT; y <= LIMIT; y += STEP) {
      // 원형 마스크 처리
      if (x*x + y*y > LIMIT*LIMIT) continue; 
      
      let numerator = 0; 
      let denominator = 0;
      
      for (const p of targetPoints) {
        const d = Math.sqrt((x - p.x)**2 + (y - p.y)**2); 
        
        // [튜닝 포인트]
        // 1. Smoothing Offset (d + 80): 
        //    기존 10 -> 80~100으로 증가시켜, 포인트 바로 위만 진한 현상을 막고 색상을 넓게 퍼뜨립니다.
        // 2. Power (2): 
        //    거리 제곱에 반비례하도록 하여 물리적으로 자연스러운 확산을 유도합니다.
        const w = 1 / Math.pow(d + 35, 2); 
        
        numerator += p.value * w; 
        denominator += w;
      }
      
      if (denominator > 0) { 
        result.push({ x, y, value: numerator / denominator }); 
      }
    }
  }
  return result;
};

const lineChartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const allPoints = chartSeries.value.flatMap(s => s.dataPoints.map(p => p.point));
  const minPoint = allPoints.length > 0 ? Math.min(...allPoints) : 0;
  const maxPoint = allPoints.length > 0 ? Math.max(...allPoints) : 20;

  const series = chartSeries.value.map((s) => {
    const isSelected = selectedWaferId.value === s.waferId;
    const isAnySelected = selectedWaferId.value !== null;
    return {
      name: `W${s.waferId}`, type: "line", showSymbol: true, symbolSize: isSelected ? 8 : 5, 
      data: s.dataPoints.map(p => [p.point, p.value]), smooth: true,
      lineStyle: { width: isSelected ? 3 : 2, opacity: isAnySelected && !isSelected ? 0.2 : 0.8 },
      itemStyle: { opacity: isAnySelected && !isSelected ? 0.2 : 1 },
      z: isSelected ? 10 : 1, triggerLineEvent: true 
    };
  });
  return {
    backgroundColor: "transparent",
    tooltip: { 
      trigger: "axis", confine: true, backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b", fontSize: 11 },
      formatter: (params: any) => {
        let html = `<div class="font-bold mb-1 border-b pb-1 text-xs">Point #${params[0].value[0]}</div>`;
        html += `<div style="max-height: 200px; overflow-y: auto;">`;
        params.forEach((p: any) => {
           html += `<div class="flex justify-between items-center gap-3 text-xs mb-0.5"><span>${p.marker} ${p.seriesName}</span><span class="font-mono font-bold">${p.value[1].toFixed(3)}</span></div>`;
        });
        html += `</div>`;
        return html;
      }
    },
    grid: { left: 40, right: 30, top: 30, bottom: 30, containLabel: true },
    legend: { show: true, type: 'scroll', top: 0, right: 10, textStyle: { color: textColor, fontSize: 10 } },
    dataZoom: [{ type: 'inside', xAxisIndex: 0 }, { type: 'slider', xAxisIndex: 0, bottom: 0, height: 16 }],
    xAxis: { type: "value", min: minPoint - 1, max: maxPoint + 1, minInterval: 1, interval: 1, axisLabel: { color: textColor }, splitLine: { show: true, lineStyle: { color: gridColor, type: 'dashed' } } },
    yAxis: { type: "value", scale: true, axisLabel: { color: textColor }, splitLine: { lineStyle: { color: gridColor } } },
    series: series
  };
});

const mapChartOption = computed(() => {
  const LIMIT = 175; 
  const GRID_INTERVAL = 25;
  const axisColor = isDarkMode.value ? "#52525b" : "#cbd5e1"; 
  const crossHairColor = isDarkMode.value ? "#71717a" : "#94a3b8";

  let series = [];
  let visualMapOption: any = null;
  const isHeatMode = mapMode.value === 'heatmap' && selectedWaferId.value;

  if (isHeatMode) {
    const targetWafer = chartSeries.value.find(s => s.waferId === selectedWaferId.value);
    if (targetWafer) {
      // 보간 데이터 생성 (해상도 150, 부드러운 가중치 적용)
      const interpolated = interpolateData(targetWafer.dataPoints);
      const minVal = globalStats.value.min;
      const maxVal = globalStats.value.max;

      visualMapOption = {
        show: true, min: minVal, max: maxVal, calculable: true, 
        orient: 'horizontal', right: 'center', top: 0, itemWidth: 15, itemHeight: 200, 
        inRange: { color: ['#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#ef4444'] },
        textStyle: { color: axisColor, fontSize: 10 }
      };

      series.push({
        type: 'custom',
        data: [{ value: [0, 0], extras: interpolated, min: minVal, max: maxVal }],
        renderItem: (_params: any, api: any) => {
           const width = api.getWidth(); const height = api.getHeight();
           const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
           const ctx = canvas.getContext('2d')!;
           const points = interpolated; const min = minVal; const max = maxVal;
           const p1 = api.coord([0, 0]); const p2 = api.coord([3.75, 0]);
           
           // 픽셀 크기 약간 넉넉하게 하여 빈틈 없앰
           const pixelSize = Math.abs(p2[0] - p1[0]); 
           const drawSize = Math.ceil(pixelSize) + 1; 

           points.forEach(p => {
              const coord = api.coord([p.x, p.y]);
              ctx.fillStyle = getHeatmapColor(p.value, min, max);
              ctx.fillRect(coord[0] - drawSize/2, coord[1] - drawSize/2, drawSize, drawSize);
           });
           const center = api.coord([0, 0]); const rPoint = api.coord([150, 0]); const radius = Math.abs(rPoint[0] - center[0]);
           ctx.globalCompositeOperation = 'destination-in'; ctx.beginPath(); ctx.arc(center[0], center[1], radius, 0, Math.PI * 2); ctx.fill();
           return { type: 'image', style: { image: canvas, x: 0, y: 0, width: width, height: height } };
        },
        silent: true 
      });

      series.push({
        name: "Values", type: 'scatter', symbol: 'circle', symbolSize: 1, 
        itemStyle: { color: 'transparent', borderColor: 'transparent' },
        data: targetWafer.dataPoints.map(p => [p.x, p.y, p.value, p.point]), z: 200,
        label: { show: true, formatter: (p: any) => p.data[3], color: '#ffffff', fontSize: 10, fontWeight: 'bold', textBorderColor: '#000000', textBorderWidth: 2, position: 'center', hideOverlap: false },
        tooltip: { show: true, trigger: 'item', formatter: (p: any) => `<div class="text-xs font-bold">Point #${p.data[3]}</div><div class="text-xs">Value: ${p.data[2].toFixed(3)}</div>` },
        silent: false 
      });
    }
  } else {
    visualMapOption = { show: false, min: 0, max: 100, inRange: { color: ['#2dd4bf'] } };
    let seriesData: any[] = [];
    const uniquePoints = new Set<string>();
    chartSeries.value.forEach(s => {
      s.dataPoints.forEach(p => {
        const key = `${p.point}`;
        if (!uniquePoints.has(key)) { uniquePoints.add(key); seriesData.push({ value: [p.x, p.y, p.point] }); }
      });
    });

    series.push({
      name: "Data", type: 'scatter', symbolSize: 18, 
      itemStyle: { color: '#2dd4bf', borderColor: isDarkMode.value ? '#000' : '#fff', borderWidth: 1, opacity: 1 }, 
      data: seriesData,
      label: { show: true, formatter: (p: any) => p.data.value[2], color: isDarkMode.value ? '#fff' : '#000', fontSize: 10, fontWeight: 'bold', position: 'inside' },
      tooltip: { show: true, formatter: (p:any) => `Point #${p.data.value[2]}` }
    });
  }

  series.unshift({
    type: 'line', symbol: 'none', lineStyle: { color: isDarkMode.value ? '#333' : '#ddd', width: 2, type: 'solid' },
    data: (() => { const d = []; for(let i=0; i<=360; i+=5) { const rad = i * Math.PI / 180; d.push([150 * Math.cos(rad), 150 * Math.sin(rad)]); } return d; })(),
    silent: true 
  });

  return {
    backgroundColor: "transparent",
    visualMap: visualMapOption,
    tooltip: { trigger: "item", backgroundColor: isDarkMode.value ? "rgba(24, 24, 27, 0.9)" : "rgba(255, 255, 255, 0.95)", textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" } },
    grid: { left: 10, right: 10, top: 40, bottom: 10 },
    xAxis: { type: "value", min: -LIMIT, max: LIMIT, interval: GRID_INTERVAL, show: true, axisLabel: { show: false }, axisLine: { show: true, lineStyle: { color: crossHairColor, width: 1 } }, splitLine: { show: true, lineStyle: { color: axisColor, type: 'dashed', width: 0.5 } } },
    yAxis: { type: "value", min: -LIMIT, max: LIMIT, interval: GRID_INTERVAL, show: true, axisLabel: { show: false }, axisLine: { show: true, lineStyle: { color: crossHairColor, width: 1 } }, splitLine: { show: true, lineStyle: { color: axisColor, type: 'dashed', width: 0.5 } } },
    series: series
  };
});
</script>

<style scoped>
:deep(.p-select), :deep(.custom-dropdown) { @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors; }
:deep(.custom-dropdown .p-select-label) { @apply text-[13px] py-[5px] px-3; }
:deep(.custom-dropdown.small) { @apply h-7; }
:deep(.custom-dropdown:hover) { @apply !bg-slate-200 dark:!bg-zinc-800; }
:deep(.date-picker .p-inputtext) { @apply !text-[13px] !py-1 !px-2 !h-7; }
:deep(.p-select-dropdown) { @apply text-slate-400 dark:text-zinc-500 w-6; }
:deep(.p-select-dropdown svg) { @apply w-3 h-3; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
