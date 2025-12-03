<!-- frontend/src/components/common/AmChart.vue -->
<template>
  <div ref="chartRef" class="w-full h-full" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

// [라이선스] 여기에 구매하신 amCharts 라이선스 키를 입력하세요.
am5.addLicense("YOUR_LICENSE_KEY_HERE");

const props = defineProps<{
  chartType: string;
  data: any[];
  config: any;
  height?: string;
  isDarkMode?: boolean;
}>();

const chartRef = ref<HTMLElement | null>(null);
let root: am5.Root | null = null;
let chart: am5xy.XYChart | null = null;

const createChart = () => {
  if (!chartRef.value) return;
  if (root) root.dispose();

  root = am5.Root.new(chartRef.value);

  const myThemes: am5.Theme[] = [am5themes_Animated.new(root)];
  if (props.isDarkMode) {
    myThemes.push(am5themes_Dark.new(root));
  }
  root.setThemes(myThemes);

  createLineChart(root, props.data, props.config, props.isDarkMode || false);
};

const calculateSmartRange = (data: any[], field: string) => {
  if (!data || data.length === 0) return null;
  const values = data
    .map((item) => Number(item[field]))
    .filter((v) => !isNaN(v));
  if (values.length === 0) return null;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const strictMin = Math.floor(minVal / 10) * 10;
  const strictMax = Math.ceil(maxVal / 10) * 10;

  return { min: strictMin, max: strictMax };
};

const createLineChart = (
  root: am5.Root,
  data: any[],
  config: any,
  isDark: boolean
) => {
  const chartInstance = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      layout: root.verticalLayout,
      paddingLeft: 0,
      paddingRight: 10,
      paddingBottom: config.xAxisTitle ? 25 : 0,
    })
  );

  chart = chartInstance;

  const cursor = chartInstance.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "zoomXY" })
  );
  cursor.lineY.set("visible", false);

  const textColor = isDark ? am5.color(0x94a3b8) : am5.color(0x475569);
  const gridColor = isDark ? am5.color(0xffffff) : am5.color(0x000000);

  // X축 설정
  const xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 100,
    minorGridEnabled: true,
  });

  xRenderer.labels.template.setAll({
    fill: textColor,
    fontSize: 11,
    paddingTop: 5,
    fontWeight: "500",
  });
  xRenderer.grid.template.setAll({ stroke: gridColor, strokeOpacity: 0.05 });

  let xAxis: am5xy.Axis<am5xy.AxisRenderer>;

  if (config.xAxisType === "value") {
    const valueAxis = chartInstance.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
        strictMinMax: true,
        extraMin: 0,
        extraMax: 0,
      })
    );
    xAxis = valueAxis;

    if (data.length > 0) {
      const range = calculateSmartRange(data, config.xField);
      if (range) {
        valueAxis.setAll({ min: range.min, max: range.max });
      }
    }
  } else {
    xAxis = chartInstance.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: config.xTimeUnit || "minute", count: 1 },
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    if (config.xAxisDateFormat) {
      const dateFormats = (xAxis as am5xy.DateAxis<am5xy.AxisRenderer>).get(
        "dateFormats"
      );
      if (dateFormats) {
        dateFormats["minute"] = config.xAxisDateFormat;
        dateFormats["hour"] = config.xAxisDateFormat;
        dateFormats["day"] = config.xAxisDateFormat;
      }
    }
  }

  if (config.xAxisTitle) {
    xAxis.children.push(
      am5.Label.new(root, {
        text: config.xAxisTitle,
        x: am5.p50,
        centerX: am5.p50,
        y: am5.p100,
        centerY: am5.p100,
        dy: 15,
        fill: textColor,
        fontWeight: "bold",
        fontSize: 12,
      })
    );
  }

  // Y축 설정
  if (config.yAxes && Array.isArray(config.yAxes)) {
    config.yAxes.forEach((yCfg: any) => {
      const yRenderer = am5xy.AxisRendererY.new(root, {
        opposite: yCfg.opposite || false,
        minGridDistance: 20,
      });
      yRenderer.labels.template.setAll({ fill: textColor, fontSize: 11 });
      yRenderer.grid.template.setAll({
        stroke: gridColor,
        strokeOpacity: 0.05,
      });

      const hasCustomRange = yCfg.min !== undefined || yCfg.max !== undefined;

      const axis = chartInstance.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: yRenderer,
          strictMinMax: hasCustomRange,
          maxDeviation: hasCustomRange ? 0 : 1,
          extraMin: hasCustomRange ? 0 : 0.05,
          extraMax: hasCustomRange ? 0 : 0.05,
        })
      );

      if (yCfg.min !== undefined) axis.set("min", yCfg.min);
      if (yCfg.max !== undefined) axis.set("max", yCfg.max);

      if (yCfg.title) {
        axis.children.unshift(
          am5.Label.new(root, {
            rotation: -90,
            text: yCfg.title,
            y: am5.p50,
            centerX: am5.p50,
            fill: textColor,
            fontWeight: "bold",
            fontSize: 12,
          })
        );
      }
    });
  } else {
    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({ fill: textColor, fontSize: 11 });
    yRenderer.grid.template.setAll({ stroke: gridColor, strokeOpacity: 0.05 });
    chartInstance.yAxes.push(
      am5xy.ValueAxis.new(root, { renderer: yRenderer })
    );
  }

  // 4. 시리즈 생성
  if (config.series) {
    config.series.forEach((s: any) => {
      const seriesColor = am5.color(s.color);

      // [핵심 수정] 툴팁 디자인 고급화
      const tooltip = am5.Tooltip.new(root, {
        getFillFromSprite: false,
        autoTextColor: false, // 직접 색상 지정
        labelText: s.tooltipText || "{valueY}",
      });

      // 툴팁 배경: 반투명 검정(모던한 느낌) + 시리즈 색상 테두리
      tooltip.get("background")?.setAll({
        fill: am5.color(0x1e293b), // Slate-800 (아주 짙은 남색/검정)
        fillOpacity: 0.65,         // 적당한 투명도
        stroke: seriesColor,       // 테두리는 시리즈 색상으로 구분
        strokeWidth: 1,            // 얇고 세련된 테두리
        cornerRadius: 6,           // 부드러운 라운딩
        shadowColor: am5.color(0x000000), // 그림자 효과 추가
        shadowBlur: 10,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowOpacity: 0.2,
      } as any);

      // 툴팁 텍스트: 흰색 고정 (어두운 배경 위)
      tooltip.label.setAll({
        fill: am5.color(0xffffff),
        fontSize: 12,
        fontWeight: "500", // Regular보다는 굵게, Bold보다는 얇게
      });

      const series = chartInstance.series.push(
        am5xy.LineSeries.new(root, {
          name: s.name,
          xAxis: xAxis,
          yAxis: chartInstance.yAxes.getIndex(s.yAxisIndex || 0)!,
          valueYField: s.valueField,
          valueXField: config.xField,
          stroke: seriesColor,
          fill: seriesColor,
          tooltip: tooltip,
          legendValueText: "{valueY}",
        })
      );

      series.strokes.template.setAll({
        strokeWidth: s.strokeWidth || 2,
        strokeDasharray: s.strokeDasharray || undefined,
      });

      if (config.xAxisType !== "value") {
        series.data.processor = am5.DataProcessor.new(root, {
          dateFields: [config.xField],
          dateFormat: "yyyy-MM-ddTHH:mm:ss",
        });
      }

      series.data.setAll(data);
      series.appear(1000);
    });
  }

  // 5. 범례 설정
  const legend = chartInstance.bulletsContainer.children.push(
    am5.Legend.new(root, {
      x: am5.p100,
      centerX: am5.p100,
      y: 0,
      centerY: 0,
      marginTop: 10,
      marginRight: 10,
      layout: root.horizontalLayout,
    })
  );

  legend.get("background")?.setAll({
    fill: isDark ? am5.color(0x000000) : am5.color(0xffffff),
    fillOpacity: 0.7,
    stroke: isDark ? am5.color(0xffffff) : am5.color(0x000000),
    strokeOpacity: 0.1,
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
    cornerRadiusBL: 5,
    cornerRadiusBR: 5,
  } as any);

  legend.labels.template.setAll({
    fill: textColor,
    fontSize: 11,
    fontWeight: "bold",
  });
  legend.valueLabels.template.setAll({ fill: textColor, fontSize: 11 });
  legend.markers.template.setAll({ width: 15, height: 15 });

  legend.data.setAll(chartInstance.series.values);
  chartInstance.appear(1000, 100);
};

onMounted(() => createChart());
onUnmounted(() => {
  if (root) root.dispose();
});

watch(
  () => props.data,
  (newData) => {
    if (chart && root) {
      if (props.config.xAxisType === "value" && newData.length > 0) {
        const xAxis = chart.xAxes.getIndex(
          0
        ) as am5xy.ValueAxis<am5xy.AxisRenderer>;
        if (xAxis) {
          const range = calculateSmartRange(newData, props.config.xField);
          if (range) xAxis.setAll({ min: range.min, max: range.max });
        }
      }
      chart.series.each((series) => series.data.setAll(newData));
    } else {
      createChart();
    }
  },
  { deep: true }
);

watch(
  [() => props.config, () => props.chartType, () => props.isDarkMode],
  () => {
    nextTick(() => createChart());
  },
  { deep: true }
);
</script>

