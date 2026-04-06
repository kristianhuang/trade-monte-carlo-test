<template>
  <div ref="chartDom" class="scatter-chart-dom"></div>
</template>

<script setup>
import {onMounted, onUnmounted, ref, watch, defineEmits} from "vue";
import * as echarts from "echarts/core";
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import {LineChart} from "echarts/charts";
import {UniversalTransition} from "echarts/features";
import {CanvasRenderer} from "echarts/renderers";
import {DomObserver} from "@/utils/dom-observer.js";
import {useActionStore} from "@/store/action.js";

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

const props = defineProps({
  profitGroupLine: {
    type: Array,
    default: [],
  },
});
const emits = defineEmits({onExportPic: "onExportPic"})
const actionStore = useActionStore();
const chartDom = ref(null);
let chart = null;
let chartDomObserver = null;

watch(
    () => props.profitGroupLine,
    (newVal) => {
      console.log("当达到")
      let series = [];
      for (let i = 0; i < newVal.length; i++) {
        series.push({
          type: "line",
          symbol: "none",
          smooth: false,
          lineStyle: {
            color: "#03AED2", // 改变折线颜色
            width: 1,
          },
          data: newVal[i],
        });
      }
      options.series = series;
      chart.clear();
      options & chart.setOption(options, true);
    },
);

watch(() => actionStore.saveChart, (val) => {
  if (val === true) {
    emits("onExportPic", chart.getDataURL({
      type: "png",
      pixelRatio: 1, //放大2倍
      backgroundColor: "#fff",
    }), "资金曲线图.png")
  }
})

const options = {
  title: {
    text: "资金曲线图",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
  },

  yAxis: {
    name: "资金",
    type: "value",
  },

  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [],
  },

  series: [],
};

const initChart = () => {
  chart = echarts.init(chartDom.value);
  chart.setOption(options);
};

const intDomObserver = () => {
  chartDomObserver = new DomObserver(chartDom.value)
  chartDomObserver.init()
  chartDomObserver.onResize(() => {
    chart.resize({
      animation: {
        duration: 1800,
        easing: 'cubicInout'
      }
    });
  })
}
onMounted(() => {
  initChart()
  intDomObserver();
});
onUnmounted(() => {
  chart?.dispose()
  chartDomObserver.destroy();
});

</script>

<style scoped>

.scatter-chart-dom {
  height: 500px;
}
</style>
