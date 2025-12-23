<!-- frontend/src/views/WaferFlatDataView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex items-center gap-2 px-1 mb-2">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-teal-600 pi pi-chart-pie dark:text-teal-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Wafer Flat Data
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Detailed metrology data analysis.
        </span>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col gap-2 shadow-sm transition-colors duration-300"
    >
      <div class="flex items-center justify-between gap-2">
        <div
          class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
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
              showClear
              :disabled="!filterStore.selectedSite"
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
              :loading="isEqpLoading"
              showClear
              class="w-full custom-dropdown small"
              overlayClass="custom-dropdown-panel small"
              @change="onEqpChange"
            />
          </div>

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
              @change="onLotChange"
            />
          </div>

          <div class="min-w-[100px] shrink-0">
            <Select
              v-model="filters.waferId"
              :options="waferIds"
              filter
              placeholder="Wafer"
              :disabled="!filters.lotId"
              showClear
              class="w-full custom-dropdown small"
              overlayClass="custom-dropdown-panel small"
            />
          </div>

          <div class="min-w-[130px] shrink-0">
            <DatePicker
              v-model="filters.startDate"
              showIcon
              showClear
              dateFormat="yy-mm-dd"
              placeholder="Start"
              class="w-full custom-dropdown small date-picker"
              :disabled="!filters.eqpId"
              @update:model-value="loadFilterOptions"
            />
          </div>

          <div class="min-w-[130px] shrink-0">
            <DatePicker
              v-model="filters.endDate"
              showIcon
              showClear
              dateFormat="yy-mm-dd"
              placeholder="End"
              class="w-full custom-dropdown small date-picker"
              :disabled="!filters.eqpId"
              @update:model-value="loadFilterOptions"
            />
          </div>
        </div>

        <div
          class="flex items-center gap-1 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
        >
          <Button
            icon="pi pi-search"
            rounded
            class="!bg-teal-600 !border-teal-600 hover:!bg-teal-700 !w-8 !h-8 !text-xs"
            @click="searchData"
            :loading="isLoading"
            :disabled="!filters.eqpId"
          />
          <Button
            icon="pi pi-refresh"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Reset'"
            class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300"
            @click="resetFilters"
          />
          <Button
            :icon="showAdvanced ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            rounded
            severity="secondary"
            v-tooltip.bottom="'Advanced Filters'"
            class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300"
            @click="showAdvanced = !showAdvanced"
          />
        </div>
      </div>

      <div
        v-show="showAdvanced"
        class="grid grid-cols-4 gap-2 px-1 pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800 animate-fade-in"
      >
        <Select
          v-model="filters.cassetteRcp"
          :options="cassetteRcps"
          placeholder="Cassette RCP"
          showClear
          class="w-full custom-dropdown small"
          overlayClass="custom-dropdown-panel small"
          @change="onAdvancedFilterChange"
        />
        <Select
          v-model="filters.stageRcp"
          :options="stageRcps"
          placeholder="Stage RCP"
          showClear
          class="w-full custom-dropdown small"
          overlayClass="custom-dropdown-panel small"
          @change="onAdvancedFilterChange"
        />
        <Select
          v-model="filters.stageGroup"
          :options="stageGroups"
          placeholder="Stage Group"
          showClear
          class="w-full custom-dropdown small"
          overlayClass="custom-dropdown-panel small"
          @change="onAdvancedFilterChange"
        />
        <Select
          v-model="filters.film"
          :options="films"
          placeholder="Film"
          showClear
          class="w-full custom-dropdown small"
          overlayClass="custom-dropdown-panel small"
          @change="onAdvancedFilterChange"
        />
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex flex-col flex-1 min-h-0 gap-4 pb-4 overflow-hidden 2xl:flex-row fade-in"
    >
      <div class="flex flex-col flex-1 w-full h-full gap-3 overflow-hidden">
        <div
          class="flex flex-col overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shrink-0 h-[424px]"
        >
          <div
            class="flex items-center justify-between p-2 bg-white border-b border-slate-100 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div class="flex items-center gap-2 pl-2">
              <div class="w-1 h-3 bg-teal-500 rounded-full"></div>
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">
                Data Results
              </h3>
            </div>

            <div
              class="flex items-center gap-3 pr-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium">Rows:</span>
                <select
                  v-model="rowsPerPage"
                  @change="onRowsChange"
                  class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
              </div>
              <span class="font-medium min-w-[60px] text-right">
                {{ totalRecords === 0 ? 0 : first + 1 }} -
                {{ Math.min(first + rowsPerPage, totalRecords) }} /
                {{ totalRecords }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  @click="
                    first = 0;
                    loadDataGrid();
                  "
                  :disabled="first === 0"
                  class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-double-left text-[10px]"></i>
                </button>
                <button
                  @click="prevPage"
                  :disabled="first === 0"
                  class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-left text-[10px]"></i>
                </button>
                <button
                  @click="nextPage"
                  :disabled="first + rowsPerPage >= totalRecords"
                  class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-right text-[10px]"></i>
                </button>
                <button
                  @click="lastPage"
                  :disabled="first + rowsPerPage >= totalRecords"
                  class="p-1 transition-colors rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                >
                  <i class="pi pi-angle-double-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="relative flex-1 overflow-auto">
            <DataTable
              :value="flatData"
              v-model:selection="selectedRow"
              selectionMode="single"
              :metaKeySelection="false"
              dataKey="servTs"
              @rowSelect="onRowSelect"
              :loading="isLoading"
              class="absolute inset-0 text-sm p-datatable-sm custom-datatable"
              stripedRows
            >
              <template #empty>
                <div
                  class="flex flex-col items-center justify-center h-full text-slate-400"
                >
                  <i class="mb-2 text-3xl opacity-30 pi pi-filter-slash"></i>
                  <p class="font-medium">No data found.</p>
                </div>
              </template>

              <Column
                field="servTs"
                header="DATE TIME"
                style="min-width: 160px"
                frozen
                :bodyStyle="{ paddingLeft: '16px' }"
                headerStyle="padding-left: 16px"
              >
                <template #body="{ data }">
                  <span class="font-mono">{{ formatDate(data.servTs) }}</span>
                </template>
              </Column>
              <Column field="lotId" header="LOT ID" style="min-width: 130px">
                <template #body="{ data }"
                  ><span class="font-bold text-slate-600 dark:text-slate-300">{{
                    data.lotId
                  }}</span></template
                >
              </Column>
              <Column field="waferId" header="WAFER" style="min-width: 80px">
                <template #body="{ data }">
                  <span
                    class="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-mono font-bold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300"
                    >{{ data.waferId }}</span
                  >
                </template>
              </Column>
              <Column
                field="cassetteRcp"
                header="CASSETTE RCP"
                style="min-width: 140px"
              ></Column>
              <Column
                field="stageRcp"
                header="STAGE RCP"
                style="min-width: 140px"
              ></Column>
              <Column
                field="stageGroup"
                header="STAGE GROUP"
                style="min-width: 120px"
              ></Column>

              <Column field="film" header="FILM" style="min-width: 80px">
                <template #body="{ data }">
                  <span class="text-slate-600 dark:text-slate-300">{{
                    data.film
                  }}</span>
                </template>
              </Column>

              <Column
                field="dateTime"
                header="EQP TIME"
                style="min-width: 160px"
              >
                <template #body="{ data }"
                  ><span class="font-mono text-slate-500 dark:text-slate-400">{{
                    formatDate(data.dateTime)
                  }}</span></template
                >
              </Column>
            </DataTable>
          </div>
        </div>

        <div
          class="flex flex-col flex-1 min-h-0 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 rounded-xl border-slate-200 dark:border-zinc-800"
        >
          <div class="flex border-b border-slate-100 dark:border-zinc-800">
            <button
              @click="activeTab = 'points'"
              class="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors border-b-2"
              :class="
                activeTab === 'points'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              "
            >
              <i class="text-xs pi pi-list"></i> Wafer Points
            </button>
            <button
              @click="activeTab = 'stats'"
              class="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors border-b-2"
              :class="
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              "
            >
              <i class="text-xs pi pi-chart-bar"></i> Statistics
            </button>
          </div>

          <div class="relative flex-1 overflow-auto">
            <div
              v-if="isStatsLoading || isPointsLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80"
            >
              <ProgressSpinner style="width: 25px; height: 25px" />
            </div>

            <div
              v-if="!selectedRow"
              class="flex items-center justify-center h-full text-sm text-slate-400"
            >
              Select a row to view details
            </div>

            <div
              v-else-if="activeTab === 'points'"
              class="overflow-auto"
              style="max-height: 280px"
            >
              <table
                v-if="pointData && pointData.data && pointData.data.length > 0"
                class="w-full text-xs text-center border-collapse table-fixed"
              >
                <thead
                  class="sticky top-0 z-20 text-xs font-bold uppercase shadow-sm bg-teal-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300"
                >
                  <tr>
                    <th
                      v-for="h in pointData.headers"
                      :key="h"
                      v-show="h !== 'datetime' && h !== 'serv_ts'"
                      class="py-2 px-4 whitespace-nowrap border-b dark:border-zinc-700 min-w-[80px]"
                      :class="[
                        h.toLowerCase() === 'point'
                          ? 'sticky left-0 z-30 bg-teal-50 dark:bg-zinc-800 text-left pl-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                          : 'text-right',
                      ]"
                    >
                      {{ h.toUpperCase() }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                  <tr
                    v-for="(row, idx) in pointData.data"
                    :key="idx"
                    class="transition-colors cursor-pointer group"
                    :class="{
                      'bg-teal-100 dark:bg-teal-900/40':
                        idx === selectedPointIdx,
                      'hover:bg-teal-50 dark:hover:bg-teal-900/20':
                        idx !== selectedPointIdx,
                    }"
                    @click="onPointClick(idx)"
                  >
                    <td
                      v-for="(cell, ci) in row"
                      :key="ci"
                      v-show="
                        pointData?.headers?.[ci] !== 'datetime' &&
                        pointData?.headers?.[ci] !== 'serv_ts'
                      "
                      class="py-1.5 px-4 min-w-[80px]"
                      :class="[
                        pointData?.headers?.[ci]?.toLowerCase() === 'point'
                          ? 'sticky left-0 z-10 text-left pl-4 font-bold bg-inherit'
                          : 'text-right',
                      ]"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="flex items-center justify-center h-full py-10 text-xs text-slate-400"
              >
                No point data available
              </div>
            </div>

            <div v-else-if="activeTab === 'stats'" class="h-full overflow-auto">
              <table
                v-if="statistics && statistics.t1"
                class="w-full text-xs border-collapse"
              >
                <thead
                  class="sticky top-0 text-xs font-bold uppercase bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"
                >
                  <tr>
                    <th
                      class="p-2 pl-4 text-left border-b dark:border-zinc-700 w-[20%]"
                    >
                      Statistics
                    </th>
                    <th
                      class="p-2 text-right border-b dark:border-zinc-700 w-[20%]"
                    >
                      T1(Å)
                    </th>
                    <th
                      class="p-2 text-right border-b dark:border-zinc-700 w-[20%]"
                    >
                      GOF
                    </th>
                    <th
                      class="p-2 text-right border-b dark:border-zinc-700 w-[20%]"
                    >
                      Z(µm)
                    </th>
                    <th
                      class="p-2 text-right pr-4 border-b dark:border-zinc-700 w-[20%]"
                    >
                      SRVISZ(µm)
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-slate-300"
                >
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Max
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.max, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.max, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.max, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.max, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Min
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.min, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.min, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.min, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.min, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Range
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.range, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.range, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.range, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.range, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Mean
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.mean, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.mean, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.mean, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.mean, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      StdD
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.stdDev, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.stdDev, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.stdDev, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.stdDev, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      %StdD
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.percentStdDev, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.percentStdDev, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.percentStdDev, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.percentStdDev, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="px-2 py-1 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      %NonU
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.t1.percentNonU, 3) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.gof.percentNonU, 4) }}
                    </td>
                    <td class="px-2 py-1 text-right">
                      {{ fmt(statistics.z.percentNonU, 4) }}
                    </td>
                    <td class="px-2 py-1 pr-4 text-right">
                      {{ fmt(statistics.srvisz.percentNonU, 4) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="flex items-center justify-center h-full text-xs text-slate-400"
              >
                No statistics available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-[450px] shrink-0 flex flex-col gap-4 h-full">
        <div
          class="h-[420px] shrink-0 rounded-xl dark:border-zinc-800 relative flex flex-col items-center justify-center p-7 overflow-hidden"
        >
          <div
            class="absolute top-3 left-4 text-sm font-bold text-slate-700 dark:text-slate-200 z-10 flex items-center"
          >
            <i class="pi pi-image mr-2 text-teal-500"></i> Wafer Map
          </div>

          <div
            class="relative h-full w-auto aspect-square max-w-full rounded-full border-4 border-slate-100 dark:border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] overflow-hidden bg-slate-50 dark:bg-black flex items-center justify-center"
          >
            <transition name="fade">
              <div
                v-if="isImageLoading"
                class="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-sm z-20"
              >
                <ProgressSpinner
                  style="width: 40px; height: 40px"
                  strokeWidth="4"
                />
                <span
                  class="mt-3 text-xs text-slate-500 font-bold animate-pulse"
                >
                  Processing Map…
                </span>
              </div>
            </transition>

            <transition name="fade">
              <div
                v-if="!pdfImageUrl && !isImageLoading"
                class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-50 pointer-events-none"
              >
                <i class="pi pi-circle text-6xl mb-3 opacity-20"></i>
                <span class="text-xs">No Map Image Available</span>
              </div>
            </transition>

            <transition name="fade">
              <img
                v-if="pdfImageUrl && !isImageLoading"
                :src="pdfImageUrl"
                class="absolute inset-0 w-full h-full object-contain rounded-full"
              />
            </transition>

            <div
              v-if="pdfImageUrl && selectedPointIdx !== -1"
              class="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
            >
              <div
                class="absolute top-0 bottom-0 left-1/2 w-px bg-red-500 transform -translate-x-1/2"
              ></div>
              <div
                class="absolute left-0 right-0 top-1/2 h-px bg-red-500 transform -translate-y-1/2"
              ></div>
            </div>
          </div>

          <div
            v-if="pdfExists && selectedPointIdx !== -1"
            class="absolute bottom-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-mono shadow-lg border border-white/10 z-30"
          >
            {{ selectedRow?.lotId }} W{{ selectedRow?.waferId }} #{{
              selectedPointValue
            }}
          </div>
        </div>

        <div
          class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 flex flex-col h-[290px]"
        >
          <div class="flex items-center justify-between relative mb-2 shrink-0">
            <h2
              class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              <i class="pi pi-wave-pulse text-teal-500"></i>
              Wave Spectrum
            </h2>

            <span
              v-if="selectedPointValue && selectedRow"
              class="absolute right-0 text-xs font-mono px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded border border-teal-100 dark:border-teal-800"
            >
              {{ selectedRow.lotId }} W{{ selectedRow.waferId }} #{{
                selectedPointValue
              }}
            </span>
          </div>

          <div class="relative flex-1 min-h-0 w-full overflow-hidden">
            <transition name="fade">
              <div
                v-if="isSpectrumLoading"
                class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[1px]"
              >
                <ProgressSpinner
                  style="width: 30px; height: 30px"
                  strokeWidth="4"
                />
                <span
                  class="mt-2 text-xs text-slate-500 font-medium animate-pulse"
                  >Loading...</span
                >
              </div>
            </transition>

            <div
              v-if="!isSpectrumLoading && spectrumData.length === 0"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-400"
            >
              <i class="pi pi-chart-line text-3xl mb-2 opacity-50"></i>
              <span class="text-xs">
                {{
                  selectedPointValue
                    ? "No Spectrum Data Available"
                    : "Select a Point to view spectrum data."
                }}
              </span>
            </div>

            <div
              v-if="spectrumData.length > 0"
              class="h-full w-full relative group"
            >
              <EChart :option="spectrumOption" @chartCreated="onChartCreated" />

              <transition name="fade">
                <button
                  v-if="isZoomed"
                  @click="resetZoom"
                  class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-30"
                >
                  <i class="pi pi-refresh" style="font-size: 0.7rem"></i>
                  Reset Zoom
                </button>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] text-slate-400 opacity-50"
    >
      <div
        class="flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i class="text-3xl pi pi-search text-slate-300 dark:text-zinc-600"></i>
      </div>
      <p class="text-sm font-medium">Please select filters and search.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
// [수정] 사용하지 않는 import 제거
import { useFilterStore } from "@/stores/filter";
import { useAuthStore } from "@/stores/auth";
import { dashboardApi } from "@/api/dashboard";
import {
  waferApi,
  type WaferFlatDataDto,
  type StatisticsDto,
  type PointDataResponseDto,
} from "@/api/wafer";
import { equipmentApi } from "@/api/equipment";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

// PrimeVue Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

// [수정] 사용하지 않는 변수 선언 제거 (route, menuStore)
const filterStore = useFilterStore();
const authStore = useAuthStore();
const showAdvanced = ref(false);
const isLoading = ref(false);
const hasSearched = ref(false);

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const filters = reactive({
  eqpId: "",
  lotId: "",
  waferId: "",
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  cassetteRcp: "",
  stageRcp: "",
  stageGroup: "",
  film: "",
});

const eqpIds = ref<string[]>([]);
// [유지] EQP ID 로딩 상태 변수
const isEqpLoading = ref(false);

const lotIds = ref<string[]>([]);
const waferIds = ref<string[]>([]);
const cassetteRcps = ref<string[]>([]);
const stageRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);

const flatData = ref<WaferFlatDataDto[]>([]);
const totalRecords = ref(0);
const selectedRow = ref<WaferFlatDataDto | null>(null);
const first = ref(0);
const rowsPerPage = ref(10);

const isStatsLoading = ref(false);
const isPointsLoading = ref(false);
const isImageLoading = ref(false);
const isSpectrumLoading = ref(false);

const statistics = ref<StatisticsDto | null>(null);
const pointData = ref<PointDataResponseDto>({ headers: [], data: [] });
const selectedPointIdx = ref(-1);
const selectedPointValue = ref<number | string>("");

const pdfExists = ref(false);
const pdfImageUrl = ref<string | null>(null);

const spectrumData = ref<any[]>([]);

const activeTab = ref<"points" | "stats">("points");

const isZoomed = ref(false);
let spectrumChartInstance: ECharts | null = null;

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

onMounted(async () => {
  // 1. Site 목록 로드
  sites.value = await dashboardApi.getSites();

  // 2. 기본 필터 결정 (우선순위: DB 사용자 설정 -> 로컬 스토리지)
  let defaultSite = authStore.user?.site;
  let defaultSdwt = authStore.user?.sdwt;

  // DB에 없으면 로컬 스토리지 확인 (페이지 전용 키 사용: wafer_site, wafer_sdwt)
  if (!defaultSite) {
    defaultSite = localStorage.getItem("wafer_site") || undefined;
    if (defaultSite) {
      defaultSdwt = localStorage.getItem("wafer_sdwt") || undefined;
    }
  }

  // 3. 결정된 Site가 유효하면 적용 및 SDWT 로드
  if (defaultSite && sites.value.includes(defaultSite)) {
    filterStore.selectedSite = defaultSite;
    sdwts.value = await dashboardApi.getSdwts(defaultSite);

    // 4. SDWT 적용 및 EqpID 로드
    if (defaultSdwt) {
      filterStore.selectedSdwt = defaultSdwt;
      await loadEqpIds();

      // 5. EqpID 복원 (마지막 선택 장비)
      const savedEqpId = localStorage.getItem("wafer_eqpid");
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        filters.eqpId = savedEqpId;
        await loadFilterOptions();
      }
    }
  }

  // Theme Observer (Dark Mode)
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
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

const onChartCreated = (instance: any) => {
  spectrumChartInstance = instance;
  instance.on("dataZoom", (params: any) => {
    const batch = params.batch?.[0];
    if (batch) {
      if (batch.start !== 0 || batch.end !== 100) {
        isZoomed.value = true;
      } else {
        isZoomed.value = false;
      }
    }
  });
};

const resetZoom = () => {
  if (spectrumChartInstance) {
    spectrumChartInstance.dispatchAction({
      type: "restore",
    });
    isZoomed.value = false;
  }
};

const spectrumOption = computed(() => {
  if (!spectrumData.value || spectrumData.value.length === 0) return {};

  const xValues = spectrumData.value.map((d) => d.wavelength);
  const minVal = Math.min(...xValues);
  const maxVal = Math.max(...xValues);
  const xMin = Math.floor(minVal / 10) * 10;
  const xMax = Math.ceil(maxVal / 10) * 10;

  const textColor = isDarkMode.value ? "#cbd5e1" : "#334155";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(0, 0, 0, 0.15)";

  return {
    backgroundColor: "transparent",
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0],
        filterMode: "filter",
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: {
        color: isDarkMode.value ? "#fff" : "#1e293b",
      },
      formatter: (params: any) => {
        const item = params[0].value;
        const xVal = item.wavelength;
        let html = `<div class="font-bold mb-1">${xVal} nm</div>`;
        params.forEach((p: any) => {
          const yKey = p.seriesName === "EXP" ? "exp" : "gen";
          const val = p.value[yKey];
          if (val !== null && val !== undefined) {
            const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
            html += `<div>${colorDot} ${p.seriesName}: ${val.toFixed(
              2
            )}%</div>`;
          }
        });
        return html;
      },
    },
    legend: {
      data: ["EXP", "GEN"],
      top: 5,
      right: 10,
      icon: "circle",
      itemGap: 15,
      textStyle: {
        color: textColor,
        fontSize: 11,
      },
    },
    grid: {
      left: 50,
      right: 20,
      bottom: 45,
      top: 30,
      containLabel: false,
    },
    dataset: {
      source: spectrumData.value,
    },
    xAxis: {
      type: "value",
      name: "Wavelength (nm)",
      nameLocation: "middle",
      nameGap: 25,
      nameTextStyle: {
        color: textColor,
        fontWeight: "bold",
        fontSize: 11,
      },
      min: xMin,
      max: xMax,
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: {
        show: true,
        lineStyle: { color: gridColor },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "TE-Reflectance (%)",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 35,
      nameTextStyle: {
        color: textColor,
        fontWeight: "bold",
        fontSize: 11,
      },
      min: 0,
      max: 100,
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { show: true, lineStyle: { color: gridColor } },
    },
    series: [
      {
        name: "EXP",
        type: "line",
        encode: { x: "wavelength", y: "exp" },
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: { color: "#F43F5E" },
      },
      {
        name: "GEN",
        type: "line",
        encode: { x: "wavelength", y: "gen" },
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: { color: "#6366F1" },
      },
    ],
  };
});

// Site 변경 핸들러
const onSiteChange = async () => {
  if (filterStore.selectedSite) {
    localStorage.setItem("wafer_site", filterStore.selectedSite);
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    localStorage.removeItem("wafer_site");
    sdwts.value = [];
  }

  // 하위 필터 초기화
  filterStore.selectedSdwt = "";
  localStorage.removeItem("wafer_sdwt");
  localStorage.removeItem("wafer_eqpid");

  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";
};

// SDWT 변경 핸들러
const onSdwtChange = () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("wafer_sdwt", filterStore.selectedSdwt);
    loadEqpIds();
  } else {
    localStorage.removeItem("wafer_sdwt");
    eqpIds.value = [];
  }

  localStorage.removeItem("wafer_eqpid");
  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";
};

// [유지] EqpID 로딩 상태 처리
const loadEqpIds = async () => {
  if (!filterStore.selectedSdwt) return;
  isEqpLoading.value = true;
  try {
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filterStore.selectedSdwt,
      "wafer"
    );
  } finally {
    isEqpLoading.value = false;
  }
};

// EqpID 변경 핸들러
const onEqpChange = () => {
  if (filters.eqpId) {
    localStorage.setItem("wafer_eqpid", filters.eqpId);
    filters.lotId = "";
    filters.waferId = "";
    loadFilterOptions();
  } else {
    localStorage.removeItem("wafer_eqpid");
    filters.lotId = "";
    filters.waferId = "";
  }
};

const onLotChange = () => {
  filters.waferId = "";
  if (filters.lotId) loadFilterOptions();
};

const onAdvancedFilterChange = () => {
  loadFilterOptions();
};

const loadFilterOptions = async () => {
  if (!filters.eqpId) return;
  const params = {
    eqpId: filters.eqpId,
    lotId: filters.lotId,
    waferId: filters.waferId,
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
    cassetteRcp: filters.cassetteRcp,
    stageRcp: filters.stageRcp,
    stageGroup: filters.stageGroup,
    film: filters.film,
  };
  const [lots, wafers, cRcps, sRcps, sGrps, filmsList] = await Promise.all([
    waferApi.getDistinctValues("lotids", params),
    waferApi.getDistinctValues("waferids", params),
    waferApi.getDistinctValues("cassettercps", params),
    waferApi.getDistinctValues("stagercps", params),
    waferApi.getDistinctValues("stagegroups", params),
    waferApi.getDistinctValues("films", params),
  ]);
  lotIds.value = lots;
  waferIds.value = wafers;
  cassetteRcps.value = cRcps;
  stageRcps.value = sRcps;
  stageGroups.value = sGrps;
  films.value = filmsList;
};

const searchData = async () => {
  first.value = 0;
  await loadDataGrid();
};

const loadDataGrid = async () => {
  isLoading.value = true;
  hasSearched.value = true;
  selectedRow.value = null;
  try {
    const res = await waferApi.getFlatData({
      eqpId: filters.eqpId,
      lotId: filters.lotId,
      waferId: filters.waferId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      cassetteRcp: filters.cassetteRcp,
      stageRcp: filters.stageRcp,
      stageGroup: filters.stageGroup,
      film: filters.film,
      page: first.value / rowsPerPage.value,
      pageSize: rowsPerPage.value,
    });
    flatData.value = res.items;
    totalRecords.value = res.totalItems;
  } finally {
    isLoading.value = false;
  }
};

const onRowsChange = () => {
  first.value = 0;
  loadDataGrid();
};
const prevPage = () => {
  if (first.value > 0) first.value -= rowsPerPage.value;
  loadDataGrid();
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value)
    first.value += rowsPerPage.value;
  loadDataGrid();
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
  loadDataGrid();
};

const onRowSelect = async (event: any) => {
  const row = event.data;
  selectedRow.value = row;
  isStatsLoading.value = true;
  isPointsLoading.value = true;
  pdfExists.value = false;
  pdfImageUrl.value = null;
  selectedPointIdx.value = -1;
  selectedPointValue.value = "";
  statistics.value = null;
  pointData.value = { headers: [], data: [] };
  spectrumData.value = [];

  try {
    const params = {
      ...row,
      eqpId: row.eqpId,
      lotId: row.lotId,
      waferId: row.waferId,
      servTs: row.servTs,
    };
    const [stats, pts, pdfCheck] = await Promise.all([
      waferApi.getStatistics(params),
      waferApi.getPointData(params),
      waferApi.checkPdf(row.eqpId, row.lotId, row.waferId, row.servTs),
    ]);
    statistics.value = stats;
    pointData.value = pts;
    pdfExists.value = pdfCheck;
  } catch (error) {
    console.error("Failed to load details:", error);
  } finally {
    isStatsLoading.value = false;
    isPointsLoading.value = false;
  }
};

const loadPointImage = async (pointValue: number) => {
  if (!pdfExists.value || !selectedRow.value) return;
  isImageLoading.value = true;
  pdfImageUrl.value = null;

  try {
    const base64 = await waferApi.getPdfImageBase64(
      selectedRow.value.eqpId,
      selectedRow.value.lotId,
      selectedRow.value.waferId,
      selectedRow.value.dateTime,
      pointValue
    );
    pdfImageUrl.value = `data:image/png;base64,${base64}`;
  } catch (error) {
    pdfImageUrl.value = null;
  } finally {
    isImageLoading.value = false;
  }
};

const loadSpectrumData = async (pointValue: number) => {
  if (!selectedRow.value) return;

  spectrumData.value = [];
  isSpectrumLoading.value = true;

  try {
    const params = {
      eqpId: selectedRow.value.eqpId,
      ts: selectedRow.value.dateTime,
      lotId: selectedRow.value.lotId,
      waferId: String(selectedRow.value.waferId),
      pointNumber: pointValue,
    };

    const rawData = await waferApi.getSpectrum(params);

    if (!rawData || rawData.length === 0) {
      console.warn("No spectrum data received.");
      return;
    }

    const expData = rawData.find(
      (d) => d.class && d.class.toUpperCase() === "EXP"
    );
    const genData = rawData.find(
      (d) => d.class && d.class.toUpperCase() === "GEN"
    );

    const base = expData?.wavelengths || genData?.wavelengths || [];

    spectrumData.value = base.map((wl: number, i: number) => {
      const expVal = expData?.values?.[i];
      const genVal = genData?.values?.[i];

      return {
        wavelength: wl,
        exp: expVal !== null && expVal !== undefined ? expVal * 100 : null,
        gen: genVal !== null && genVal !== undefined ? genVal * 100 : null,
      };
    });
  } catch (err) {
    console.error("Failed to load spectrum data:", err);
  } finally {
    isSpectrumLoading.value = false;
  }
};

const onPointClick = async (idx: number) => {
  let pointValue = idx + 1;

  if (pointData.value?.headers && pointData.value?.data?.[idx]) {
    const pointColIndex = pointData.value.headers.findIndex(
      (h) => h?.toLowerCase() === "point"
    );

    if (pointColIndex > -1) {
      const cellValue = pointData.value.data[idx][pointColIndex];
      const parsed = Number(cellValue);
      if (!isNaN(parsed)) {
        pointValue = parsed;
      }
    }
  }

  selectedPointValue.value = pointValue;
  selectedPointIdx.value = idx;

  const tasks: Promise<void>[] = [];

  if (pdfExists.value && selectedRow.value) {
    tasks.push(loadPointImage(pointValue));
  } else {
    pdfImageUrl.value = null;
  }

  tasks.push(loadSpectrumData(pointValue));

  try {
    await Promise.all(tasks);
  } catch (error) {
    console.error("Error loading point details:", error);
  }
};

// [수정] 초기화 시 로컬 스토리지 키도 함께 삭제
const resetFilters = () => {
  filterStore.selectedSite = "";
  filterStore.selectedSdwt = "";
  localStorage.removeItem("wafer_site");
  localStorage.removeItem("wafer_sdwt");
  localStorage.removeItem("wafer_eqpid");

  sdwts.value = [];
  eqpIds.value = [];

  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";
  filters.cassetteRcp = "";
  filters.stageRcp = "";
  filters.stageGroup = "";
  filters.film = "";
  flatData.value = [];
  selectedRow.value = null;
  hasSearched.value = false;
  first.value = 0;
  spectrumData.value = [];
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getUTCFullYear().toString().slice(2)}-${String(
    d.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(
    d.getUTCHours()
  ).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(
    d.getUTCSeconds()
  ).padStart(2, "0")}`;
};
const fmt = (num: number | null | undefined, prec: number = 3) =>
  num === null || num === undefined
    ? "0.".padEnd(prec + 2, "0")
    : num.toFixed(prec);
</script>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
  @apply font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-transparent uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-700;
}
:deep(.p-datatable-tbody > tr > td) {
  @apply py-1 px-3 text-[12px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  @apply !bg-[#27272a] !text-white;
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
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}
:deep(.p-select-clear-icon),
:deep(.p-datepicker-clear-icon) {
  @apply text-[9px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300;
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

:deep(.p-autocomplete-option),
:deep(.p-autocomplete-item) {
  @apply !text-[11px] !py-1.5 !px-2.5;
}

:deep(.p-datatable-tbody > tr.p-highlight) {
  @apply !bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-200;
}
:deep(
    .p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)
  ) {
  @apply bg-slate-50/50 dark:bg-zinc-800/30;
}

table th,
table td {
  @apply px-4 py-2;
}

.animate-slide-left {
  animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

<style>
.custom-dropdown-panel.small .p-select-option,
.custom-dropdown-panel.small .p-autocomplete-option,
.custom-dropdown-panel.small .p-autocomplete-item {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
.custom-dropdown-panel.small .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
</style>
