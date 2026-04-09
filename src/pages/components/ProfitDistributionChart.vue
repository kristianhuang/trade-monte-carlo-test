<template>
  <div ref="chartDom" class="bar-chart-dom"></div>

</template>
<script setup>


import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import * as echarts from 'echarts/core';
import {GridComponent} from 'echarts/components';
import {BarChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import {DomObserver} from "@/utils/dom-observer.js";
import {useActionStore} from "@/store/action.js";

echarts.use([GridComponent, BarChart, CanvasRenderer]);

const props = defineProps({
  maxSignalProfitVal: {
    type: Number,
    default: 0,
  },

  maxSignalLossVal: {
    type: Number,
    default: 0,
  },

  profitGroupList: {
    type: Array,
    default: [],
  },
  // 用于监控是否重新生成数据
  allProfitTotal:{
    type: Number,
    default: 0,
  }

})

let profitXAxisList = []; // 数据的 X 轴，将亏损和盈利按平均单位间隔开
let profitXAxisListToString = []; // X 轴转字符
let profitXAxisCount = [];
let winIndex; // profitXAxisList 中第几个下表开始，是收益，用于区分柱状图颜色
const distributionMetaData = {
  winInterVal: 0,
  lossInterVal: 0,
  lossGroupCount: 5,
  winGroupCount: 5,

  reset() {
    this.winInterVal = 0;
    this.lossInterVal = 0;
    this.lossGroupCount = 5;
    this.winGroupCount = 5;
  },

  computedInterVal() {
    this.lossInterVal = Math.round(props.maxSignalLossVal / this.lossGroupCount);
    this.winInterVal = Math.round(props.maxSignalProfitVal / this.winGroupCount);
  },
}

// chart
const options = {
  title: {
    text: "盈亏分布图",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: {
      interval: 0,
      rotate: -50,
    }
  },
  yAxis: {
    type: 'value',
  },
  series: [],
}
const chartDom = ref(null);
let chart = null;
let chartDomObserver = null;
const profitGroupUnfold = computed(() => {
  let val = [];
  for (let i = 0; i < props.profitGroupList.length; i++) {
    val.push(...props.profitGroupList[i])
  }

  return val;
})

const actionStore = useActionStore();

const emits = defineEmits({onExportPic: "onExportPic"})

watch(() => props.allProfitTotal,
    () => {
      _resetData();
      distributionMetaData.computedInterVal();
      _createXAxisList();
      _xToString();
      _createXAxisCount();
      let elIndex = 0;
      for (let i = 0; i < profitGroupUnfold.value.length; i++) {
        elIndex = _findIndex(profitGroupUnfold.value[i])
        profitXAxisCount[elIndex] += 1;
      }
      setBarColor();
      options.xAxis.data = profitXAxisListToString;
      options.series = [
        {
          data: profitXAxisCount,
          type: 'bar',
          itemStyle: {
            color: "#18a058"
          }
        }];
      chart.clear();
      options & chart.setOption(options, true);
    });

watch(() => actionStore.saveChart, (val) => {
  if (val === true) {
    emits("onExportPic", chart.getDataURL({
      type: "png",
      pixelRatio: 1, //放大2倍
      backgroundColor: "#fff",
    }), "盈亏分布图.png")
  }
})


const _createXAxisList = () => {
  for (let i = distributionMetaData.lossGroupCount; i >= 1; i--) {
    profitXAxisList.push(distributionMetaData.lossInterVal * i);
  }
  winIndex = profitXAxisList.length;
  for (let i = 1; i <= distributionMetaData.winGroupCount; i++) {
    profitXAxisList.push(distributionMetaData.winInterVal * i);
  }
}

const _createXAxisCount = () => {
  profitXAxisCount = new Array(profitXAxisList.length).fill(0);
}

const setBarColor = () => {
  let val;
  for (let i = 0; i < profitXAxisCount.length; i++) {
    if (i < winIndex) {
      val = profitXAxisCount[i];
      profitXAxisCount[i] = {
        value: val,
        itemStyle: {
          color: '#d03050'
        }
      };
    }
  }
}

/**
 * 根据值获取所在 X 轴的坐标
 * @param el
 * @returns {number} 所在 X 轴的对应下标
 * @private
 */
const _findIndex = (el) => {
  let remainder;
  if (el < 0) {
    if (el === props.maxSignalLossVal) {
      remainder = 0;
    } else {
      remainder = distributionMetaData.lossGroupCount - Math.ceil(Math.abs(el) / Math.abs(distributionMetaData.lossInterVal));
    }
  } else {
    if (el === props.maxSignalProfitVal) {
      remainder = profitXAxisListToString.length - 1;
    } else {
      remainder = Math.ceil(el / distributionMetaData.winInterVal) + (distributionMetaData.winGroupCount - 1);
    }
  }

  return remainder;
}

const _xToString = () => {
  for (let i = 0; i < profitXAxisList.length; i++) {
    // 负数拼接时，元素 + 下一个元素
    if (profitXAxisList[i] < 0) {
      if (profitXAxisList[i] === distributionMetaData.lossInterVal) {
        profitXAxisListToString[i] = profitXAxisList[i] + " ~ " + 0;
      } else {
        profitXAxisListToString[i] = profitXAxisList[i] + " ~ " + profitXAxisList[i + 1];
      }
    } else {
      if (profitXAxisList[i] === distributionMetaData.winInterVal) {
        profitXAxisListToString[i] = 0 + " ~ " + profitXAxisList[i];
      } else {
        profitXAxisListToString[i] = profitXAxisList[i - 1] + " ~ " + profitXAxisList[i];
      }
    }
  }
}

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

const _resetData = () => {
  profitXAxisList = [];
  profitXAxisListToString = [];
  profitXAxisCount = [];
  winIndex = 0;
  distributionMetaData.reset();
}

onMounted(() => {
  initChart()
  intDomObserver();
})
onUnmounted(() => {
  chart?.dispose()
  chartDomObserver.destroy();
});
</script>

<style scoped>
.bar-chart-dom {
  height: 500px;
}
</style>