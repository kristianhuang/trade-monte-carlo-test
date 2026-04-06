<template>
  <div ref="chartDom" class="scatter-chart-dom"></div>

</template>

<script setup>
import {defineEmits, onMounted, onUnmounted, ref, watch} from "vue";
import * as echarts from "echarts/core";
import { GridComponent } from 'echarts/components';
import { ScatterChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent, ScatterChart, CanvasRenderer, UniversalTransition]);
import {DomObserver} from "@/utils/dom-observer.js";
import {useActionStore} from "@/store/action.js";

const props = defineProps({
  profitGroupItemTotal: {
    type: Array,
    default: [],
  },
});

const chartDom = ref(null);
let chart = null;
let chartDomObserver = null;
const options = {
  title: {
    text: "资金散点图",
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
const emits = defineEmits({onExportPic: "onExportPic"})
const actionStore = useActionStore();
watch(
    () => props.profitGroupItemTotal,
    (newVal) => {
      options.series = [{
        type: "scatter",
        symbolSize: 15,
        smooth: false,
        data: newVal,
      }];

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
    }), "资金散点图.png")
  }
})


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