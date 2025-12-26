<!-- frontend/src/views/OpticalTrendView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] overflow-hidden"
  >
    <div class="flex items-center gap-3 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-amber-500 pi pi-eye dark:text-amber-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Optical Health Analytics
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Real-time Spectrum quantification & intensity trend monitoring.
        </span>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm shrink-0 transition-colors duration-300"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[120px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.eqpId"
            :options="eqpIds"
            :loading="isEqpIdLoading"
            placeholder="EQP ID"
            :disabled="!filter.sdwt"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
          />
        </div>

        <div
          class="w-px h-6 mx-1 bg-slate-200 dark:bg-zinc-700 shrink-0"
        ></div>

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
        class="flex items-center gap-2 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          label="Analyze"
          class="!px-4 !py-1.5 !text-xs !font-bold !rounded-lg !bg-amber-600 !border-amber-600 hover:!bg-amber-700 !text-white transition-opacity"
          :loading="isLoading"
          :disabled="!filter.eqpId"
          @click="fetchData"
        />

        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Reset Filters'"
          class="!w-8 !h-8 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
          @click="resetFilter"
        />
      </div>
    </div>

    <div
      v-if="hasSearched && trendData.length > 0"
      class="flex flex-col flex-1 gap-4 overflow-y-auto custom-scrollbar pr-1 pb-4"
    >
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4 shrink-0">
        <div
          class="relative overflow-hidden bg-white border shadow-sm cursor-help rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="p-4 transition-all duration-300 group-hover:blur-[2px] group-hover:opacity-50"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  Avg Total Intensity
                </p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span
                    class="text-2xl font-black text-slate-800 dark:text-white"
                    >{{
                      currentStats.avgTotal.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                    }}</span
                  >
                  <span
                    class="text-[10px] font-bold"
                    :class="getDiffClass(currentStats.totalDiff)"
                  >
                    {{ currentStats.totalDiff > 0 ? "+" : ""
                    }}{{ currentStats.totalDiff }}%
                  </span>
                </div>
              </div>
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500"
              >
                <i class="pi pi-sun"></i>
              </div>
            </div>
            <div
              class="w-full h-1 mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
            >
              <div
                class="h-full transition-all duration-1000 bg-amber-500"
                style="width: 75%"
              ></div>
            </div>
          </div>
          <div
            class="absolute inset-0 z-10 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          >
            <p
              class="text-xs font-bold leading-relaxed text-center text-slate-700 dark:text-slate-100 drop-shadow-sm"
            >
              전체 파장 대역에 대한<br />신호 강도의 평균 총합입니다.
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-white border shadow-sm cursor-help rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="p-4 transition-all duration-300 group-hover:blur-[2px] group-hover:opacity-50"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  Avg Peak Signal
                </p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span
                    class="text-2xl font-black text-slate-800 dark:text-white"
                    >{{ currentStats.avgPeak.toFixed(1) }}</span
                  >
                  <span class="text-[10px] text-slate-400">counts</span>
                </div>
              </div>
              <div
                class="flex items-center justify-center w-8 h-8 text-indigo-500 rounded-lg bg-indigo-50 dark:bg-indigo-900/30"
              >
                <i class="pi pi-chart-line"></i>
              </div>
            </div>
            <div
              class="w-full h-1 mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
            >
              <div
                class="h-full transition-all duration-1000 bg-indigo-500"
                style="width: 60%"
              ></div>
            </div>
          </div>
          <div
            class="absolute inset-0 z-10 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          >
            <p
              class="text-xs font-bold leading-relaxed text-center text-slate-700 dark:text-slate-100 drop-shadow-sm"
            >
              각 스캔에서 측정된<br />최대 신호값(Peak)들의 평균입니다.
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-white border shadow-sm cursor-help rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="p-4 transition-all duration-300 group-hover:blur-[2px] group-hover:opacity-50"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  Wavelength Shift
                </p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-2xl font-black text-purple-500">{{
                    currentStats.avgWavelength.toFixed(1)
                  }}</span>
                  <span class="text-[10px] font-bold text-slate-400">nm</span>
                </div>
              </div>
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500"
              >
                <i class="pi pi-wave-pulse"></i>
              </div>
            </div>
            <div
              class="w-full h-1 mt-3 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
            >
              <div
                class="h-full transition-all duration-1000 bg-purple-500"
                style="width: 85%"
              ></div>
            </div>
          </div>
          <div
            class="absolute inset-0 z-10 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          >
            <p
              class="text-xs font-bold leading-relaxed text-center text-slate-700 dark:text-slate-100 drop-shadow-sm"
            >
              광원의 중심 파장(Color)이<br />이동했는지 감시합니다.
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-white border shadow-sm cursor-help rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 group"
        >
          <div
            class="p-4 transition-all duration-300 group-hover:blur-[2px] group-hover:opacity-50"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  Avg SNR
                </p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span
                    class="text-xl font-black"
                    :class="currentStats.healthColor"
                    >{{ currentStats.avgSnr.toFixed(1) }}</span
                  >
                  <span class="text-[10px] font-bold text-slate-400">dB</span>
                </div>
              </div>
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 animate-pulse"
              >
                <i class="pi pi-check-circle"></i>
              </div>
            </div>
            <p class="mt-3 text-[10px] text-slate-400">
              Calculated from Real Data
            </p>
          </div>
          <div
            class="absolute inset-0 z-10 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          >
            <p
              class="text-xs font-bold leading-relaxed text-center text-slate-700 dark:text-slate-100 drop-shadow-sm"
            >
              신호 대 잡음비(SNR)를 통한<br />신호 순도 및 건강 상태입니다.
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-[315px] shrink-0">
        <div
          class="col-span-1 lg:col-span-2 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 relative flex flex-col group/chart overflow-hidden"
        >
          <div class="flex items-center justify-between mb-2 shrink-0">
            <div class="flex items-center gap-2">
              <h3
                class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                <i class="pi pi-chart-bar text-amber-500"></i> Intensity Trend
                Monitoring
              </h3>
              <button
                class="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors flex items-center gap-1 cursor-pointer"
                :class="
                  showMainGuide
                    ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                "
                @click="showMainGuide = !showMainGuide"
              >
                <i class="pi pi-info-circle text-[9px]"></i>
                Guide
              </button>
            </div>

            <div class="flex gap-2">
              <span class="flex items-center gap-1 text-[10px] text-slate-500"
                ><div class="w-2 h-2 rounded-full bg-amber-500"></div>
                Total Intensity</span
              >
              <span class="flex items-center gap-1 text-[10px] text-slate-500"
                ><div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Peak Intensity</span
              >
            </div>
          </div>

          <div class="relative flex-1 w-full min-h-0">
            <div
              class="w-full h-full transition-all duration-300"
              :class="{ 'blur-[2px] opacity-60': showMainGuide }"
            >
              <EChart :option="chartOption" class="w-full h-full" />
            </div>

            <div
              v-if="showMainGuide"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 cursor-pointer animate-fade-in"
              @click="showMainGuide = false"
            >
              <div
                class="max-w-md p-5 bg-white border shadow-lg dark:bg-zinc-900 rounded-xl border-slate-100 dark:border-zinc-700 cursor-default"
                @click.stop
              >
                <div class="flex items-center justify-between mb-3">
                  <h4
                    class="text-sm font-extrabold text-center text-slate-800 dark:text-white"
                  >
                    차트 가이드
                  </h4>
                  <button
                    @click="showMainGuide = false"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>

                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-amber-50 dark:bg-amber-900/20"
                    >
                      <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                    </div>
                    <div>
                      <p
                        class="text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        Total Intensity (전체 광량)
                      </p>
                      <p
                        class="text-[11px] text-slate-500 dark:text-slate-400"
                      >
                        전 파장 대역의 광량을 합산한 값입니다. 광원(Lamp)의
                        전반적인 노후화 상태나 오염 여부를 판단하는 핵심
                        지표입니다.
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-indigo-50 dark:bg-indigo-900/20"
                    >
                      <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    </div>
                    <div>
                      <p
                        class="text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        Peak Intensity (피크 신호)
                      </p>
                      <p
                        class="text-[11px] text-slate-500 dark:text-slate-400"
                      >
                        특정 파장에서 측정된 가장 높은 신호값입니다. 순간적인
                        신호 튐(Spike) 현상이나 센서 감도 변화를 감지할 때
                        사용합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p
                class="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/50 px-2 py-1 rounded-full"
              >
                화면을 클릭하면 닫힙니다
              </p>
            </div>
          </div>
        </div>

        <div
          class="col-span-1 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 flex flex-col"
        >
          <div class="flex items-center gap-2 mb-4">
            <i class="text-emerald-500 pi pi-sparkles"></i>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
              Intelligent Diagnostics
            </h3>
          </div>

          <div class="flex-1 space-y-3">
            <div
              class="p-3 border rounded-lg bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold uppercase text-slate-400"
                  >Trend Analysis</span
                >
                <span
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  :class="diagnostics.trendColor"
                  >{{ diagnostics.trendStatus }}</span
                >
              </div>
              <p
                class="text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                {{ diagnostics.trendMessage }}
              </p>
            </div>

            <div
              class="p-3 border rounded-lg bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold uppercase text-slate-400"
                  >Signal Quality (SNR)</span
                >
                <div class="flex items-center gap-1">
                  <span class="text-[10px] font-bold text-indigo-500"
                    >{{ diagnostics.snrValue }} dB</span
                  >
                </div>
              </div>
              <div
                class="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mt-1"
              >
                <div
                  class="h-1.5 bg-indigo-500 rounded-full"
                  :style="{
                    width: Math.min(diagnostics.snrValue, 100) + '%',
                  }"
                ></div>
              </div>
              <p class="mt-1 text-[10px] text-slate-500">
                Noise Floor 대비 신호 강도 비율
              </p>
            </div>

            <div
              class="p-3 mt-auto border rounded-lg bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30"
            >
              <div class="flex items-start gap-2">
                <i class="mt-0.5 text-xs pi pi-wrench text-amber-500"></i>
                <div>
                  <span
                    class="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400"
                    >Action Guide</span
                  >
                  <p
                    class="text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    {{ diagnostics.actionGuide }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 min-h-[300px] shrink-0">
        <div
          class="p-4 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden relative group/shift"
        >
          <div class="flex items-center justify-between mb-2 shrink-0">
            <h3
              class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <i class="text-purple-500 pi pi-wave-pulse"></i> Spectrum Shift
              (Peak Wavelength)
            </h3>
            <button
              class="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors flex items-center gap-1 cursor-pointer"
              :class="
                showShiftGuide
                  ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                  : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
              "
              @click="showShiftGuide = !showShiftGuide"
            >
              <i class="pi pi-info-circle text-[9px]"></i>
              Guide
            </button>
          </div>
          <div class="flex-1 w-full min-h-0 relative">
            <div
              class="w-full h-full transition-all duration-300"
              :class="{ 'blur-[2px] opacity-60': showShiftGuide }"
            >
              <EChart :option="wavelengthChartOption" class="w-full h-full" />
            </div>

            <div
              v-if="showShiftGuide"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 cursor-pointer animate-fade-in"
              @click="showShiftGuide = false"
            >
              <div
                class="max-w-xs p-4 bg-white border shadow-lg dark:bg-zinc-900 rounded-xl border-slate-100 dark:border-zinc-700 cursor-default"
                @click.stop
              >
                <div class="flex items-center justify-between mb-2">
                  <h4
                    class="text-xs font-extrabold text-center text-slate-800 dark:text-white"
                  >
                    파장 이동 (Shift)
                  </h4>
                  <button
                    @click="showShiftGuide = false"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <i class="pi pi-times text-[10px]"></i>
                  </button>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300">
                  중심 파장(Peak Wavelength)의 변화 추이를 보여줍니다. 설정된
                  기준 파장에서 벗어나는 경우(Shift), 광학계의 색상 틀어짐이나
                  필터 변형을 의심할 수 있습니다.
                </p>
              </div>
              <p
                class="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/50 px-2 py-1 rounded-full"
              >
                화면을 클릭하면 닫힙니다
              </p>
            </div>
          </div>
        </div>

        <div
          class="p-4 bg-white border shadow-sm rounded-xl dark:bg-[#111111] border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden relative group/corr"
        >
          <div class="flex items-center justify-between mb-2 shrink-0">
            <h3
              class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <i class="text-teal-500 pi pi-sliders-h"></i> Intensity vs SNR
              Correlation
            </h3>
            <button
              class="px-2 py-0.5 text-[10px] font-bold rounded-full border transition-colors flex items-center gap-1 cursor-pointer"
              :class="
                showCorrGuide
                  ? 'bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800'
                  : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
              "
              @click="showCorrGuide = !showCorrGuide"
            >
              <i class="pi pi-info-circle text-[9px]"></i>
              Guide
            </button>
          </div>
          <div class="flex-1 w-full min-h-0 relative">
            <div
              class="w-full h-full transition-all duration-300"
              :class="{ 'blur-[2px] opacity-60': showCorrGuide }"
            >
              <EChart :option="correlationChartOption" class="w-full h-full" />
            </div>

            <div
              v-if="showCorrGuide"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 cursor-pointer animate-fade-in"
              @click="showCorrGuide = false"
            >
              <div
                class="max-w-xs p-4 bg-white border shadow-lg dark:bg-zinc-900 rounded-xl border-slate-100 dark:border-zinc-700 cursor-default"
                @click.stop
              >
                <div class="flex items-center justify-between mb-2">
                  <h4
                    class="text-xs font-extrabold text-center text-slate-800 dark:text-white"
                  >
                    상관 관계 분석
                  </h4>
                  <button
                    @click="showCorrGuide = false"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <i class="pi pi-times text-[10px]"></i>
                  </button>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-slate-300">
                  광량(Intensity)과 신호대잡음비(SNR)의 관계를 분석합니다.
                  일반적으로 광량이 높으면 SNR도 좋아야 합니다. 분포가 선형성을
                  벗어나면 센서 노이즈가 증가했음을 의미합니다.
                </p>
              </div>
              <p
                class="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/50 px-2 py-1 rounded-full"
              >
                화면을 클릭하면 닫힙니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!isLoading"
      class="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-50 select-none min-h-[400px]"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i
          class="text-4xl pi pi-chart-scatter text-slate-300 dark:text-zinc-600"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">No Data Analyzed</p>
      <p class="text-xs">
        Select Equipment and Date Range to analyze optical health.
      </p>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 space-y-4"
    >
      <div class="relative">
        <div
          class="w-12 h-12 border-4 rounded-full border-slate-100 dark:border-zinc-800"
        ></div>
        <div
          class="absolute top-0 left-0 w-12 h-12 border-4 rounded-full border-amber-500 border-t-transparent animate-spin"
        ></div>
      </div>
      <p class="text-xs font-bold text-slate-400 animate-pulse">
        Calculating Spectrum Data...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { waferApi, type OpticalTrendDto } from "@/api/wafer";
import EChart from "@/components/common/EChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";

interface ExtendedOpticalTrendDto extends OpticalTrendDto {
  peakWavelength: number;
  darkNoise: number;
}

const authStore = useAuthStore();
// [추가] LocalStorage 키 정의
const LS_KEYS = {
  SITE: "optical_site",
  SDWT: "optical_sdwt",
  EQPID: "optical_eqpid",
};

const isLoading = ref(false);
const isEqpIdLoading = ref(false);
const hasSearched = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains("dark"));

const showMainGuide = ref(false);
const showShiftGuide = ref(false);
const showCorrGuide = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
  endDate: new Date(),
});

const trendData = ref<ExtendedOpticalTrendDto[]>([]);

let themeObserver: MutationObserver;

onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  // 1. 초기 필터 결정 (우선순위: LocalStorage > Auth)
  let targetSite = localStorage.getItem(LS_KEYS.SITE) || "";
  let targetSdwt = "";

  if (targetSite) {
     targetSdwt = localStorage.getItem(LS_KEYS.SDWT) || "";
  } else {
     targetSite = authStore.user?.site || "";
     targetSdwt = authStore.user?.sdwt || "";
  }

  // 2. Site 적용 및 SDWT 로드
  if (targetSite && sites.value.includes(targetSite)) {
    filter.site = targetSite;
    
    try {
      sdwts.value = await dashboardApi.getSdwts(targetSite);
      
      // 3. SDWT 적용 및 EQP 로드
      if (targetSdwt && sdwts.value.includes(targetSdwt)) {
        filter.sdwt = targetSdwt;
        isEqpIdLoading.value = true;
        try {
          eqpIds.value = await equipmentApi.getEqpIds(
            undefined,
            targetSdwt,
            "wafer"
          );
        } finally {
          isEqpIdLoading.value = false;
        }

        // 4. EQP ID 복원
        const savedEqpId = localStorage.getItem(LS_KEYS.EQPID) || "";
        if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
          filter.eqpId = savedEqpId;
          // 필요 시 fetchData();
        }
      } else {
        filter.sdwt = "";
        eqpIds.value = [];
      }
    } catch (e) {
      console.error("Failed to restore filter state:", e);
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

// [추가] EQP ID 변경 감지 및 저장
watch(() => filter.eqpId, (newVal) => {
  if (newVal) localStorage.setItem(LS_KEYS.EQPID, newVal);
  else localStorage.removeItem(LS_KEYS.EQPID);
});

// Handlers with LocalStorage Logic
const onSiteChange = async () => {
  if (filter.site) {
    localStorage.setItem(LS_KEYS.SITE, filter.site);
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    localStorage.removeItem(LS_KEYS.SITE);
    sdwts.value = [];
  }
  
  // 하위 필터 초기화
  filter.sdwt = "";
  localStorage.removeItem(LS_KEYS.SDWT);
  
  filter.eqpId = "";
  localStorage.removeItem(LS_KEYS.EQPID);
  
  eqpIds.value = [];
};

const onSdwtChange = async () => {
  if (filter.sdwt) {
    localStorage.setItem(LS_KEYS.SDWT, filter.sdwt);
    isEqpIdLoading.value = true;
    try {
      eqpIds.value = await equipmentApi.getEqpIds(
        undefined,
        filter.sdwt,
        "wafer"
      );
    } finally {
      isEqpIdLoading.value = false;
    }
  } else {
    localStorage.removeItem(LS_KEYS.SDWT);
    eqpIds.value = [];
  }
  
  // 하위 필터 초기화
  filter.eqpId = "";
  localStorage.removeItem(LS_KEYS.EQPID);
};

const resetFilter = async () => {
  localStorage.removeItem(LS_KEYS.SITE);
  localStorage.removeItem(LS_KEYS.SDWT);
  localStorage.removeItem(LS_KEYS.EQPID);

  // 완전 초기화
  filter.site = "";
  filter.sdwt = "";
  filter.eqpId = "";
  sdwts.value = [];
  eqpIds.value = [];

  filter.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  filter.endDate = new Date();
  trendData.value = [];
  hasSearched.value = false;
  showMainGuide.value = false;
  showShiftGuide.value = false;
  showCorrGuide.value = false;
};

const fetchData = async () => {
  if (!filter.eqpId) return;
  isLoading.value = true;
  hasSearched.value = true;
  trendData.value = []; 
  showMainGuide.value = false;
  showShiftGuide.value = false;
  showCorrGuide.value = false;

  try {
    const rawData = await waferApi.getOpticalTrend({
      eqpId: filter.eqpId,
      startDate: filter.startDate.toISOString(),
      endDate: filter.endDate.toISOString(),
    });

    trendData.value = (rawData as ExtendedOpticalTrendDto[]).sort(
      (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
    );
  } catch (e) {
    console.error("Failed to fetch optical trend:", e);
  } finally {
    isLoading.value = false;
  }
};

const diagnostics = computed(() => {
  if (trendData.value.length < 2) {
    return {
      trendStatus: "N/A",
      trendColor: "bg-slate-100 text-slate-500",
      trendMessage: "분석할 데이터가 부족합니다.",
      snrValue: 0,
      actionGuide: "데이터를 더 수집하세요.",
    };
  }

  const firstItem = trendData.value[0];
  const lastItem = trendData.value[trendData.value.length - 1];

  const start = firstItem?.totalIntensity ?? 0;
  const end = lastItem?.totalIntensity ?? 0;

  const slope = (end - start) / trendData.value.length; 

  let trendStatus = "안정적 (Stable)";
  let trendColor = "bg-emerald-100 text-emerald-600";
  let trendMessage = "광량 수준이 안정적입니다.";
  let actionGuide = "정기적인 모니터링으로 충분합니다.";

  if (slope < -50) {
    trendStatus = "장애 감지 (Failure)";
    trendColor = "bg-rose-100 text-rose-600";
    trendMessage = "광량의 급격한 하락이 감지되었습니다.";
    actionGuide = "즉시 램프 전원 및 케이블을 점검하세요.";
  } else if (slope < -10) {
    trendStatus = "노후화 (Aging)";
    trendColor = "bg-amber-100 text-amber-600";
    trendMessage = "점진적인 광량 감소 (정상 노화)입니다.";
    actionGuide = "조만간 램프 교체를 계획하세요.";
  }

  const signal = lastItem?.peakIntensity ?? 0;
  const noise = lastItem?.darkNoise || 1; 
  const snr = noise > 0 && signal > 0 ? 20 * Math.log10(signal / noise) : 0;

  if (snr < 20) {
    actionGuide += " 센서/필터 점검 필요 (낮은 신호대잡음비).";
  }

  return {
    trendStatus,
    trendColor,
    trendMessage,
    snrValue: Math.round(snr * 10) / 10,
    actionGuide,
  };
});

const currentStats = computed(() => {
  if (trendData.value.length === 0) {
    return {
      avgTotal: 0,
      avgPeak: 0,
      avgWavelength: 0,
      avgSnr: 0,
      totalDiff: 0,
      stabilityScore: 0,
      healthStatus: "UNKNOWN",
      healthColor: "text-slate-400",
    };
  }

  const len = trendData.value.length;

  const sumTotal = trendData.value.reduce(
    (acc, v) => acc + v.totalIntensity,
    0
  );
  const sumPeak = trendData.value.reduce((acc, v) => acc + v.peakIntensity, 0);
  const sumWave = trendData.value.reduce(
    (acc, v) => acc + (v.peakWavelength || 0),
    0
  );

  const sumSnr = trendData.value.reduce((acc, v) => {
    const s = v.peakIntensity;
    const n = v.darkNoise || 1;
    return acc + (n > 0 && s > 0 ? 20 * Math.log10(s / n) : 0);
  }, 0);

  const avgTotal = sumTotal / len;
  const avgPeak = sumPeak / len;
  const avgWavelength = sumWave / len;
  const avgSnr = sumSnr / len;

  const baselineCount = Math.max(1, Math.floor(len * 0.1));
  const baselineData = trendData.value.slice(0, baselineCount);
  const baselineAvg =
    baselineData.reduce((acc, v) => acc + v.totalIntensity, 0) / baselineCount;

  const totalDiff =
    baselineAvg !== 0
      ? Math.round(((avgTotal - baselineAvg) / baselineAvg) * 100)
      : 0;

  const variance =
    trendData.value.reduce(
      (acc, v) => acc + Math.pow(v.totalIntensity - avgTotal, 2),
      0
    ) / len;
  const stdDev = Math.sqrt(variance);
  const cv = avgTotal !== 0 ? stdDev / avgTotal : 0;

  let stabilityScore = Math.round(100 - cv * 500);
  if (stabilityScore > 100) stabilityScore = 100;
  if (stabilityScore < 0) stabilityScore = 0;

  let healthStatus = "HEALTHY";
  let healthColor = "text-emerald-500";

  if (totalDiff < -20 || stabilityScore < 70 || avgSnr < 20) {
    healthStatus = "CRITICAL";
    healthColor = "text-rose-500";
  } else if (totalDiff < -10 || stabilityScore < 85 || avgSnr < 40) {
    healthStatus = "WARNING";
    healthColor = "text-amber-500";
  }

  return {
    avgTotal,
    avgPeak,
    avgWavelength,
    avgSnr,
    totalDiff,
    stabilityScore,
    healthStatus,
    healthColor,
  };
});

const getDiffClass = (diff: number) => {
  if (diff < -10) return "text-rose-500";
  if (diff < 0) return "text-amber-500";
  return "text-emerald-500";
};

const chartOption = computed(() => {
  if (trendData.value.length === 0) return {};

  const textColor = isDarkMode.value ? "#94a3b8" : "#64748b";
  const gridColor = isDarkMode.value ? "#334155" : "#e2e8f0";

  const dates = trendData.value.map((d) => {
    const date = new Date(d.ts);
    return `${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
  });
  const totalVals = trendData.value.map((d) => d.totalIntensity);
  const peakVals = trendData.value.map((d) => d.peakIntensity);

  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#f1f5f9" : "#1e293b" },
    },
    grid: { left: 60, right: 60, top: 40, bottom: 40, containLabel: true },
    legend: { textStyle: { color: textColor } },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", bottom: 0, height: 20 },
    ],
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor, fontSize: 10 },
    },
    yAxis: [
      {
        type: "value",
        name: "Total Intensity",
        position: "left",
        splitLine: { lineStyle: { color: gridColor, type: "dashed" } },
        axisLabel: { color: textColor },
        nameTextStyle: { color: textColor, fontWeight: "bold" },
      },
      {
        type: "value",
        name: "Peak Count",
        position: "right",
        splitLine: { show: false },
        axisLabel: { color: textColor },
        nameTextStyle: { color: textColor, fontWeight: "bold" },
      },
    ],
    series: [
      {
        name: "Total Intensity",
        type: "line",
        data: totalVals,
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        itemStyle: { color: "#f59e0b" }, 
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245, 158, 11, 0.3)" },
              { offset: 1, color: "rgba(245, 158, 11, 0)" },
            ],
          },
        },
      },
      {
        name: "Peak Intensity",
        type: "line",
        data: peakVals,
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        itemStyle: { color: "#6366f1" },
        lineStyle: { type: "solid" }, 
      },
    ],
  };
});

const wavelengthChartOption = computed(() => {
  if (trendData.value.length === 0) return {};

  const textColor = isDarkMode.value ? "#94a3b8" : "#64748b";
  const gridColor = isDarkMode.value ? "#334155" : "#e2e8f0";

  const dates = trendData.value.map((d) => {
    const date = new Date(d.ts);
    return `${
      date.getMonth() + 1
    }/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
  });
  const waveVals = trendData.value.map((d) => d.peakWavelength);

  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#f1f5f9" : "#1e293b" },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 20, containLabel: true },
    xAxis: { type: "category", data: dates, show: false }, 
    yAxis: {
      type: "value",
      name: "nm",
      scale: true,
      splitLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor },
    },
    series: [
      {
        name: "Peak Wavelength",
        type: "line",
        data: waveVals,
        smooth: true,
        showSymbol: false,
        itemStyle: { color: "#a855f7" }, 
      },
    ],
  };
});

const correlationChartOption = computed(() => {
  if (trendData.value.length === 0) return {};

  const textColor = isDarkMode.value ? "#94a3b8" : "#64748b";
  const gridColor = isDarkMode.value ? "#334155" : "#e2e8f0";

  const dates = trendData.value.map((d) => {
    const date = new Date(d.ts);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const intensityVals = trendData.value.map((d) => d.totalIntensity);
  const snrVals = trendData.value.map((d) => {
    const s = d.peakIntensity;
    const n = d.darkNoise || 1;
    return n > 0 && s > 0 ? 20 * Math.log10(s / n) : 0;
  });

  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.9)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#f1f5f9" : "#1e293b" },
    },
    grid: { left: 40, right: 40, top: 30, bottom: 20, containLabel: true },
    legend: { textStyle: { color: textColor } },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { show: false },
    },
    yAxis: [
      {
        type: "value",
        name: "Intensity",
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      {
        type: "value",
        name: "SNR (dB)",
        position: "right",
        splitLine: { lineStyle: { color: gridColor } },
        axisLabel: { color: textColor },
      },
    ],
    series: [
      {
        name: "Intensity",
        type: "line",
        data: intensityVals,
        smooth: true,
        showSymbol: false,
        itemStyle: { color: "#f59e0b" },
        yAxisIndex: 0,
      },
      {
        name: "SNR",
        type: "line",
        data: snrVals,
        smooth: true,
        showSymbol: false,
        itemStyle: { color: "#14b8a6" },
        yAxisIndex: 1,
      }, 
    ],
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
:deep(.p-datepicker-input) {
  @apply !text-[12px] !py-1 !px-2;
}
:deep(.date-picker .p-inputtext) {
  @apply !h-7;
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
