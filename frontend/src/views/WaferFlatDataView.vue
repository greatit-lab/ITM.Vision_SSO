<!-- frontend/src/views/WaferFlatDataView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div
      class="flex flex-col items-center justify-between gap-3 mb-4 md:flex-row"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex items-center justify-center w-10 h-10 bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i
            class="text-xl text-teal-600 pi pi-chart-pie dark:text-teal-400"
          ></i>
        </div>
        <div>
          <h1
            class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Wafer Flat Data
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-[10px]">
            Detailed metrology data analysis.
          </p>
        </div>
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

          <div class="min-w-[180px] shrink-0">
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

          <div class="min-w-[160px] shrink-0 relative group">
            <AutoComplete
              v-model="filters.eqpId"
              :suggestions="filteredEqpIds"
              @complete="searchEqp"
              placeholder="EQP ID"
              :disabled="!filterStore.selectedSdwt"
              dropdown
              class="w-full custom-dropdown small"
              inputClass="custom-input-text small !pr-7"
              panelClass="custom-dropdown-panel small"
              @item-select="onEqpSelect"
              @change="onEqpChange"
            />
            <i
              v-if="filters.eqpId"
              @click="clearEqpId"
              class="pi pi-times absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer z-10 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
            ></i>
          </div>

          <div class="min-w-[160px] shrink-0 relative group">
            <AutoComplete
              v-model="filters.lotId"
              :suggestions="filteredLotIds"
              @complete="searchLot"
              placeholder="Lot ID"
              :disabled="!filters.eqpId"
              dropdown
              class="w-full custom-dropdown small"
              inputClass="custom-input-text small !pr-7"
              panelClass="custom-dropdown-panel small"
              @item-select="onLotSelect"
              @change="onLotChange"
            />
            <i
              v-if="filters.lotId"
              @click="clearLotId"
              class="pi pi-times absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer z-10 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
            ></i>
          </div>

          <div class="min-w-[100px] shrink-0 relative group">
            <AutoComplete
              v-model="filters.waferId"
              :suggestions="filteredWaferIds"
              @complete="searchWafer"
              placeholder="Wafer ID"
              :disabled="!filters.lotId"
              dropdown
              class="w-full custom-dropdown small"
              inputClass="custom-input-text small !pr-7"
              panelClass="custom-dropdown-panel small"
            />
            <i
              v-if="filters.waferId"
              @click="filters.waferId = ''"
              class="pi pi-times absolute right-8 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer z-10 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
            ></i>
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
      class="flex flex-col flex-1 min-h-0 gap-4 pb-4 overflow-hidden xl:flex-row fade-in"
    >
      <div
        class="flex-[5] flex flex-col gap-3 min-w-[600px] overflow-hidden h-full"
      >
        <div
          class="flex flex-col overflow-hidden bg-white border shadow-sm rounded-xl dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shrink-0 h-[45%]"
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
                    >#{{ data.waferId }}</span
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

              <Column field="servTs" header="EQP TIME" style="min-width: 160px">
                <template #body="{ data }"
                  ><span class="font-mono text-slate-500 dark:text-slate-400">{{
                    formatDate(data.servTs)
                  }}</span></template
                >
              </Column>
            </DataTable>
          </div>
        </div>

        <div
          class="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col"
        >
          <div class="flex border-b border-slate-100 dark:border-zinc-800">
            <button
              @click="activeTab = 'points'"
              class="px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2"
              :class="
                activeTab === 'points'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              "
            >
              <i class="pi pi-list text-xs"></i> Wafer Points
            </button>
            <button
              @click="activeTab = 'stats'"
              class="px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2"
              :class="
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              "
            >
              <i class="pi pi-chart-bar text-xs"></i> Statistics
            </button>
          </div>

          <div class="relative flex-1 overflow-auto">
            <div
              v-if="isStatsLoading || isPointsLoading"
              class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10"
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
              class="h-full overflow-auto"
            >
              <table
                v-if="pointData && pointData.data && pointData.data.length > 0"
                class="w-full text-xs text-center border-collapse"
              >
                <thead
                  class="sticky top-0 z-20 text-xs font-bold uppercase bg-teal-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 shadow-sm"
                >
                  <tr>
                    <th
                      v-for="h in pointData.headers"
                      :key="h"
                      v-show="h !== 'datetime' && h !== 'serv_ts'"
                      class="py-2 px-2 whitespace-nowrap border-b dark:border-zinc-700 min-w-[80px]"
                      :class="
                        h === 'point'
                          ? 'pl-4 text-left bg-teal-50 dark:bg-zinc-800 sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                          : 'text-right'
                      "
                    >
                      {{ h.toUpperCase() }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                  <tr
                    v-for="(row, idx) in pointData.data"
                    :key="idx"
                    class="transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    :class="{
                      'bg-teal-100 dark:bg-teal-900/40':
                        idx === selectedPointIdx,
                    }"
                    @click="onPointClick(idx)"
                  >
                    <td
                      v-for="(cell, ci) in row"
                      :key="ci"
                      v-show="
                        pointData.headers[ci] !== 'datetime' &&
                        pointData.headers[ci] !== 'serv_ts'
                      "
                      class="py-1 px-2 min-w-[80px] cursor-pointer"
                      :class="
                        pointData.headers[ci] === 'point'
                          ? 'pl-4 text-left font-bold sticky left-0 z-10 bg-white dark:bg-zinc-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                          : 'text-right'
                      "
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="flex items-center justify-center h-full text-xs text-slate-400"
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
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Max
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.max, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.max, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.max, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
                      {{ fmt(statistics.srvisz.max, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Min
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.min, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.min, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.min, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
                      {{ fmt(statistics.srvisz.min, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Range
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.range, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.range, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.range, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
                      {{ fmt(statistics.srvisz.range, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Mean
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.mean, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.mean, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.mean, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
                      {{ fmt(statistics.srvisz.mean, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      StdD
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.stdDev, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.stdDev, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.stdDev, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
                      {{ fmt(statistics.srvisz.stdDev, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      %StdD
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.percentStdDev, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.percentStdDev, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.percentStdDev, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
                      {{ fmt(statistics.srvisz.percentStdDev, 4) }}
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td
                      class="py-1 px-2 pl-4 font-bold text-slate-600 dark:text-slate-400"
                    >
                      %NonU
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.t1.percentNonU, 3) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.gof.percentNonU, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right">
                      {{ fmt(statistics.z.percentNonU, 4) }}
                    </td>
                    <td class="py-1 px-2 text-right pr-4">
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

      <div class="flex-[2] flex flex-col gap-4 h-full min-w-[400px]">
        <div
          class="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 relative flex flex-col items-center justify-center p-1 overflow-hidden"
        >
          <div
            class="absolute top-3 left-4 text-sm font-bold text-slate-700 dark:text-slate-200 z-10 flex items-center"
          >
            <i class="pi pi-image mr-2 text-teal-500"></i> Wafer Map
          </div>

          <div
            class="relative h-full w-auto aspect-square max-w-full rounded-full border-4 border-slate-100 dark:border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] overflow-hidden bg-slate-50 dark:bg-black flex items-center justify-center"
          >
            <div
              v-if="isImageLoading"
              class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-20"
            >
              <ProgressSpinner
                style="width: 40px; height: 40px"
                strokeWidth="4"
              />
              <span class="mt-3 text-xs text-slate-400 font-medium"
                >Loading Map...</span
              >
            </div>

            <div
              v-else-if="!pdfExists || !pdfImageUrl"
              class="flex flex-col items-center justify-center opacity-40 text-slate-400 w-full h-full"
            >
              <i class="pi pi-circle text-6xl mb-3 opacity-20"></i>
              <span class="text-xs">No Map Image Available</span>
            </div>

            <div v-else class="w-full h-full relative">
              <img :src="pdfImageUrl" class="w-full h-full object-contain" />
              <div class="absolute inset-0 pointer-events-none opacity-40">
                <div
                  class="absolute top-0 bottom-0 left-1/2 w-px bg-red-500 transform -translate-x-1/2"
                ></div>
                <div
                  class="absolute left-0 right-0 top-1/2 h-px bg-red-500 transform -translate-y-1/2"
                ></div>
              </div>
            </div>
          </div>

          <div
            v-if="selectedRow && pdfExists"
            class="absolute bottom-4 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md font-mono shadow-lg border border-white/10"
          >
            {{ selectedRow.lotId }} #{{ selectedRow.waferId }} (PT:
            {{ selectedPointIdx + 1 }})
          </div>
        </div>

        <div
          class="h-[250px] bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden shrink-0"
        >
          <div
            class="flex items-center gap-2 p-2 text-sm font-bold border-b border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-zinc-900"
          >
            <i class="pi pi-wave-pulse text-teal-500"></i> Wave Spectrum
          </div>

          <div class="flex-1 overflow-auto p-0 relative">
            <div
              v-if="!selectedRow || selectedPointIdx === -1"
              class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60"
            >
              <i class="pi pi-chart-line text-3xl mb-2"></i>
              <span class="text-xs">Select a point to view spectrum</span>
            </div>

            <table v-else class="w-full text-xs text-center border-collapse">
              <thead
                class="sticky top-0 bg-slate-100 dark:bg-zinc-800 text-slate-500 font-bold shadow-sm"
              >
                <tr>
                  <th class="p-2 border-b dark:border-zinc-700">Wavelength</th>
                  <th class="p-2 border-b dark:border-zinc-700">Intensity</th>
                  <th class="p-2 border-b dark:border-zinc-700">Reflectance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
                <tr
                  v-for="i in 10"
                  :key="i"
                  class="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td
                    class="p-1.5 text-slate-600 dark:text-slate-400 font-mono"
                  >
                    {{ 400 + i * 40 }}
                  </td>
                  <td
                    class="p-1.5 text-slate-600 dark:text-slate-400 font-mono"
                  >
                    {{ Math.random().toFixed(4) }}
                  </td>
                  <td
                    class="p-1.5 text-slate-600 dark:text-slate-400 font-mono"
                  >
                    {{ (Math.random() * 100).toFixed(2) }}%
                  </td>
                </tr>
              </tbody>
            </table>
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
import { ref, reactive, onMounted } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import {
  waferApi,
  type WaferFlatDataDto,
  type StatisticsDto,
  type PointDataResponseDto,
} from "@/api/wafer";
import { equipmentApi } from "@/api/equipment";

// PrimeVue Components
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

const filterStore = useFilterStore();
const showAdvanced = ref(false);
const isLoading = ref(false);
const hasSearched = ref(false);

// Filter State
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

// Options
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);
const lotIds = ref<string[]>([]);
const filteredLotIds = ref<string[]>([]);
const waferIds = ref<string[]>([]);
const filteredWaferIds = ref<string[]>([]);
const cassetteRcps = ref<string[]>([]);
const stageRcps = ref<string[]>([]);
const stageGroups = ref<string[]>([]);
const films = ref<string[]>([]);

// Data
const flatData = ref<WaferFlatDataDto[]>([]);
const totalRecords = ref(0);
const selectedRow = ref<WaferFlatDataDto | null>(null);
const first = ref(0);
const rowsPerPage = ref(10);

// Detail
const isStatsLoading = ref(false);
const isPointsLoading = ref(false);
const isImageLoading = ref(false);
const statistics = ref<StatisticsDto | null>(null);
const pointData = ref<PointDataResponseDto>({ headers: [], data: [] });
const selectedPointIdx = ref(-1);
const pdfExists = ref(false);
const pdfImageUrl = ref<string | null>(null);

// Tab State
const activeTab = ref<"points" | "stats">("points");

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
  if (filterStore.selectedSite) {
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
    if (filterStore.selectedSdwt) loadEqpIds();
  }
});

// Cascade Logic: Site -> SDWT -> EqpId -> LotId -> WaferId

const onSiteChange = async () => {
  // Clear Child Filters
  filterStore.selectedSdwt = "";
  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";

  if (filterStore.selectedSite) {
    sdwts.value = await dashboardApi.getSdwts(filterStore.selectedSite);
  } else {
    sdwts.value = [];
  }
};

const onSdwtChange = () => {
  // Clear Child Filters
  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";

  if (filterStore.selectedSdwt) {
    loadEqpIds();
  } else {
    eqpIds.value = [];
  }
};

const loadEqpIds = async () => {
  if (filterStore.selectedSdwt)
    eqpIds.value = await equipmentApi.getEqpIds(
      undefined,
      filterStore.selectedSdwt
    );
};

const onEqpSelect = async (event: any) => {
  const selectedEqp = event.value;
  filters.eqpId = selectedEqp;
  // Clear Child Filters
  filters.lotId = "";
  filters.waferId = "";

  if (!selectedEqp) return;

  const params = {
    eqpId: filters.eqpId,
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
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
  filteredLotIds.value = lots;
  waferIds.value = wafers;
  filteredWaferIds.value = wafers;
  cassetteRcps.value = cRcps;
  stageRcps.value = sRcps;
  stageGroups.value = sGrps;
  films.value = filmsList;
};

// Handle manual change or clear of EQP ID
const onEqpChange = () => {
  if (!filters.eqpId) {
    clearEqpId();
  }
};

const clearEqpId = () => {
  filters.eqpId = "";
  filters.lotId = "";
  filters.waferId = "";
};

const onLotSelect = (event: any) => {
  filters.lotId = event.value;
  filters.waferId = ""; // Clear Wafer ID when Lot changes
};

const onLotChange = () => {
  if (!filters.lotId) {
    clearLotId();
  }
};

const clearLotId = () => {
  filters.lotId = "";
  filters.waferId = "";
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
  filteredLotIds.value = lots;
  waferIds.value = wafers;
  filteredWaferIds.value = wafers;
  cassetteRcps.value = cRcps;
  stageRcps.value = sRcps;
  stageGroups.value = sGrps;
  films.value = filmsList;
};

const searchEqp = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};
const searchLot = (e: any) => {
  const query = e.query.toLowerCase();
  filteredLotIds.value = query
    ? lotIds.value.filter((id) => id.toLowerCase().includes(query))
    : lotIds.value;
};
const searchWafer = (e: any) => {
  const query = e.query.toLowerCase();
  filteredWaferIds.value = query
    ? waferIds.value.filter((id) => id.toLowerCase().includes(query))
    : waferIds.value;
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
  if (first.value > 0) {
    first.value -= rowsPerPage.value;
    loadDataGrid();
  }
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value) {
    first.value += rowsPerPage.value;
    loadDataGrid();
  }
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
  statistics.value = null;
  pointData.value = { headers: [], data: [] };

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
      waferApi.checkPdf(row.eqpId, row.servTs),
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

const onPointClick = (idx: number) => {
  selectedPointIdx.value = idx;
  if (pdfExists.value && selectedRow.value) {
    isImageLoading.value = true;
    pdfImageUrl.value = waferApi.getPdfImageUrl(
      selectedRow.value.eqpId,
      selectedRow.value.servTs,
      idx
    );
    setTimeout(() => {
      isImageLoading.value = false;
    }, 300);
  }
};

const resetFilters = () => {
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
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const yy = d.getFullYear().toString().slice(2);
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
};

const fmt = (num: number | null | undefined, prec: number = 3) => {
  if (num === null || num === undefined) return "0.".padEnd(prec + 2, "0");
  return num.toFixed(prec);
};
</script>

<style scoped>
/* Table Styles */
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

/* Select Label Font */
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}

/* AutoComplete Input Font & Padding */
:deep(.custom-input-text.small) {
  @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0;
}

/* DatePicker Input Font */
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}

/* Clear Icon in Select/DatePicker */
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

/* Dropdown Icon */
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6;
}
:deep(.p-select-dropdown svg) {
  @apply w-3 h-3;
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
</style>

<style>
.custom-dropdown-panel.small .p-select-option {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
/* AutoComplete 드롭다운 옵션 글자 크기 */
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
