<template>
  <n-layout>
    <DataForm :conf="conf" :has-act-data="hasActData" @on-submit="createStats" @on-upload-data="createActData"/>
    <DataTable :stats-data="statsData" :max-drawdown-val="mockData.maxDrawdownVal"
               :init-capital="conf.initCapital"/>
    <LineChart :profit-group-line="mockData.profitGroupItemLine"/>
    <ScatterChart :profit-group-item-total="mockData.profitGroupItemTotal"/>
  </n-layout>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import arrUtil from "@/utils/arr.js";
import LineChart from "./components/LineChart.vue";
import DataForm from "./components/DataForm.vue";
import DataTable from "./components/DataTable.vue";
import {NLayout} from "naive-ui";
import ScatterChart from "@/pages/components/ScatterChart.vue";

onMounted(() => {
  confHandle.initConf();
});

const conf = ref({
  initCapital: 15000, // 初始金额
  ruinThreshold: 50, // 破产线，最终资金 < 初始资金的 {$ruinThreshold}%，则算作破产
  groupNum: 10, // 数据样本组数量
  ruinVal: 0, // {$initCapital} *{$ruinThreshold}% = {$ruinVal}
  tradeCost: 0, // TODO 交易成本还没想好怎么计算
});

const confHandle = {
  changeConf(data) {
    conf.value = {...conf.value, ...data}
    this.initConf()
  },
  initConf() {
    conf.value.ruinVal = (
        (conf.value.initCapital * conf.value.ruinThreshold) /
        100
    ).toFixed(2);
  }
}

const actData = ref([]);
const hasActData = computed(() => {
  return actData.value.length > 0;
})

const mockData = ref({
  profitGroupList: [], // 收益结果组
  profitGroupItemTotal: [], // 每组的总收益
  lossCount: 0, // 亏损总次数
  count: 0, // 样本数据总数
  allProfitTotal: 0, // 所有样本总资金，
  winProfitTotal: 0, // 所有样本总计盈利
  lossItemCount: 0, // 亏损账户数
  lossProfitTotal: 0, // 所有样本总计亏损
  continuousLossTotal: 0, // 连败总次数，
  continuousLossCount: 0, // 样本组连败出现的次数
  profitGroupItemLine: [], // 资金收益曲线
  maxDrawdownVal: 0, // 总数据的最大回撤
  maxDrawdownsList: [], // 每组数据的最大回撤
  maxDrawdownTotal: 0, // 最大回撤总计
});
const mockDataHandle = {
  createDataGroup() {
    for (let i = 0; i < conf.value.groupNum; i++) {
      mockData.value.profitGroupList.push([]);
      for (let ii = 0; ii < actData.value.length; ii++) {
        // 基于真实数据，随机抓元素填充进模拟数据
        mockData.value.profitGroupList[i].push(
            arrUtil.getRandomItem(actData.value),
        );
      }
    }
  },

  reset() {
    mockData.value.profitGroupItemTotal = new Array(conf.value.groupNum).fill(0);
    mockData.value.maxDrawdownsList = new Array(conf.value.groupNum).fill(0);
    mockData.value.profitGroupItemLine = new Array(conf.value.groupNum).fill([]);
    mockData.value.profitGroupList = [];
    mockData.value.count = 0;
    mockData.value.lossCount = 0;
    mockData.value.allProfitTotal = 0;
    mockData.value.lossProfitTotal = 0;
    mockData.value.winProfitTotal = 0;
    mockData.value.lossItemCount = 0;
    mockData.value.maxDrawdownVal = 0;
    mockData.value.maxDrawdownTotal = 0;
    mockData.value.continuousLossTotal = 0;
    mockData.value.continuousLossCount = 0;
  },
};

const statsData = ref({
  ruinTotal: 0,
  ruinPCT: 0,
  maxProfitVal: 0,
  maxProfitPCT: 0,
  minProfitVal: 0,
  minProfitPCT: 0,
  RR: 0,
  avgProfitVal: 0,
  avgProfitPCT: 0,
  midProfitVal: 0,
  midProfitPCT: 0,
  maxContinuousLossVal: 0, // 最大连亏次数
  avgContinuousLossVal: 0, // 平均连败，
  avgSignalLossPTC: 0, // 策略单次平均失败率
  lossItemCount: 0, // 亏损账户数
  lossItemCountPCT: 0, // 亏损账户占比
  avgMaxDrawdownVal: 0, // 平均最大回撤
  avgMaxDrawdownValPCT: 0, //平均最大回撤百分比
  midMaxDrawdownVal: 0, // 中位数最大回撤
  midMaxDrawdownPCT: 0, // 中位数最大回撤百分比
});
const statsDataHandle = {
  _computedRuin() {
    statsData.value.ruinTotal += 1;
    statsData.value.ruinPCT = (
        (statsData.value.ruinTotal / conf.value.groupNum) *
        100
    ).toFixed(2);
  },

  /**
   * 计算盈亏比
   */
  _computedRR() {
    const winCount = mockData.value.count - mockData.value.lossCount;
    // 亏损总金额先转正数
    const absLossProfitTotal = Math.abs(mockData.value.lossProfitTotal)
    const lossAvgProfit = (
        (absLossProfitTotal / mockData.value.lossCount) *
        100
    ).toFixed(2);
    const winAvgProfit = ((mockData.value.winProfitTotal / winCount) * 100).toFixed(2);

    statsData.value.RR = (winAvgProfit / lossAvgProfit).toFixed(2);
  },
  /**
   * 计算平均的最终账户金额
   * @returns
   */
  _computedAvgProfit() {
    statsData.value.avgProfitVal = (
        // 执行策略后所有账户总资金/参与总人数 = 平均账户金额
        mockData.value.allProfitTotal / mockData.value.profitGroupList.length
    ).toFixed(2);
    statsData.value.avgProfitPCT = (
        (statsData.value.avgProfitVal / conf.value.initCapital) *
        100
    ).toFixed(2);
  },

  /**
   * 计算中位数账户金额
   */
  _computedMidProfit() {
    const midVal = arrUtil.getMidVal(mockData.value.profitGroupItemTotal);
    statsData.value.midProfitVal = midVal;
    statsData.value.midProfitPCT = (
        (midVal / conf.value.initCapital) *
        100
    ).toFixed(2);
  },

  _computedAvgContinuousLossVal() {
    statsData.value.avgContinuousLossVal = (mockData.value.continuousLossTotal / mockData.value.continuousLossCount).toFixed(2)
  },

  /**
   * 计算单次失败率
   */
  _computedAvgSignalLossPCT() {
    statsData.value.avgSignalLossPTC = (
        (mockData.value.lossCount / mockData.value.count * 100).toFixed(2));
  },

  /**
   * 计算账户的最终亏损占比
   */
  _computedLossItemCountPCT() {
    statsData.value.lossItemCount = mockData.value.lossItemCount;
    statsData.value.lossItemCountPCT = (
        (statsData.value.lossItemCount / conf.value.groupNum) *
        100
    ).toFixed(2);
  },

  _computedAvgMaxDrawdownVal() {
    statsData.value.avgMaxDrawdownVal = (mockData.value.maxDrawdownTotal / mockData.value.maxDrawdownsList.length).toFixed(2);
    statsData.value.avgMaxDrawdownValPCT = ((Math.abs(statsData.value.avgMaxDrawdownVal) / conf.value.initCapital) * 100).toFixed(2);
  },

  _computedMidMaxDrawdownVal() {
    statsData.value.midMaxDrawdownVal = arrUtil.getMidVal(mockData.value.maxDrawdownsList);
    statsData.value.midMaxDrawdownPCT = ((Math.abs(statsData.value.midMaxDrawdownVal) / conf.value.initCapital) * 100).toFixed(2);
  },

  setMaxContinuousLossVal(lossTotal) {
    if (lossTotal > statsData.value.maxContinuousLossVal) {
      statsData.value.maxContinuousLossVal = lossTotal;
    }
  },

  /**
   * 最大收益
   * @param {Number} profit
   */
  setMaxProfit(profit) {
    if (statsData.value.maxProfitVal < profit) {
      statsData.value.maxProfitVal = profit;
      statsData.value.maxProfitPCT = (
          (statsData.value.maxProfitVal / conf.value.initCapital) *
          100
      ).toFixed(2);
    }
  },

  /**
   * 最小收益
   * @param {Number} profit
   */
  setMinProfit(profit) {
    if (
        statsData.value.minProfitVal > profit ||
        statsData.value.minProfitVal === 0
    ) {
      statsData.value.minProfitVal = profit;
      statsData.value.minProfitPCT = (
          (statsData.value.minProfitVal / conf.value.initCapital) *
          100
      ).toFixed(2);
    }
  },

  /**
   * 重置数据
   */
  reset() {
    Object.keys(statsData.value).forEach((key) => (statsData.value[key] = 0));
  },

  setData() {
    this._computedAvgProfit();
    this._computedMidProfit();
    this._computedAvgSignalLossPCT();
    this._computedRR();
    this._computedLossItemCountPCT()
    this._computedAvgMaxDrawdownVal();
    this._computedMidMaxDrawdownVal();
    this._computedAvgContinuousLossVal();
  }
};


const createStats = (formData) => {
  confHandle.changeConf(formData)
  _resetData();

  for (let i = 0; i < mockData.value.profitGroupList.length; i++) {
    let {profitTotal, profitLine, prevMaxLossTotal} = _computedData(i);
    mockData.value.profitGroupItemLine[i] = profitLine;
    mockData.value.allProfitTotal += profitTotal;
    // 初始资金 > 账户资金,亏损账户数 +1
    conf.value.initCapital > profitTotal ? mockData.value.lossItemCount += 1 : "";
    // 存储每组的总收益，下标对应数据组下标
    mockData.value.profitGroupItemTotal[i] = profitTotal;
    _isRuined(profitTotal) === true ? statsDataHandle._computedRuin() : "";
    statsDataHandle.setMaxProfit(profitTotal);
    statsDataHandle.setMinProfit(profitTotal);
    // 统计样本数据总数
    mockData.value.count += mockData.value.profitGroupList[i].length;
    mockData.value.maxDrawdownVal > prevMaxLossTotal ? mockData.value.maxDrawdownVal = prevMaxLossTotal : "";
  }

  statsDataHandle.setData();
};

/**
 * 判定用户是否破产
 * @param {Number} profit 资金结果
 * @returns
 */
const _isRuined = (profit) => (profit <= conf.value.ruinVal);

/**
 * 根据收益列表计算每组的最终资金，并计算历史最大/小亏损次数
 * @returns 每组数据的最终资金,资金曲线, 样本组总计盈利、亏损
 * @param groupIndex
 */
const _computedData = (groupIndex) => {
  let profitTotal = conf.value.initCapital;
  let lossCounter = 0; // 连亏计数器
  let prevMaxLossTotal = 0;
  let currMaxLossTotal = 0;
  let profitLine = [];
  for (let i = 0; i < mockData.value.profitGroupList[groupIndex].length; i++) {
    profitTotal += mockData.value.profitGroupList[groupIndex][i];
    profitLine.push(profitTotal);
    // 统计每个数据组的连续亏损、亏损次数，负数则亏损计数 +1，正数将亏损计数器传入连亏统计后清零
    if (0 > mockData.value.profitGroupList[groupIndex][i]) {
      currMaxLossTotal += mockData.value.profitGroupList[groupIndex][i]; // 单次收益亏损，则加入当前亏损资金
      lossCounter += 1;
      mockData.value.lossCount += 1;
      mockData.value.lossProfitTotal += mockData.value.profitGroupList[groupIndex][i];
      statsDataHandle.setMaxContinuousLossVal(lossCounter);
      // 计算最大回撤
      if (currMaxLossTotal < prevMaxLossTotal) {
        mockData.value.maxDrawdownsList[groupIndex] = currMaxLossTotal;
        // 有新的最大回撤，则最大回撤总计，先减去上一测最大回撤，再累加本次最大回撤
        mockData.value.maxDrawdownTotal -= prevMaxLossTotal;
        mockData.value.maxDrawdownTotal += currMaxLossTotal;
        prevMaxLossTotal = currMaxLossTotal;
      }
    } else {
      // 清零连败前，先存入连败数组
      if (lossCounter > 1) {
        mockData.value.continuousLossTotal += lossCounter;
        mockData.value.continuousLossCount += 1;
      }
      // 策略盈利时，如果当前最大回撤幅度大于上一测统计的幅度，则写入新的最大回撤幅度，当前赋予上一次，当前重置
      currMaxLossTotal = 0;
      lossCounter = 0;
      mockData.value.winProfitTotal += mockData.value.profitGroupList[groupIndex][i];
    }
  }
  // 循环结束后再判断一次，是否存在连败，防止数组末尾是连败，而忽略掉
  if (lossCounter > 1) {
    mockData.value.continuousLossTotal += lossCounter;
    mockData.value.continuousLossCount += 1;
  }
  return {profitTotal, profitLine, prevMaxLossTotal};
};


const createActData = (data) => {
  actData.value = data
}
/**
 * 重置数据
 */
const _resetData = () => {
  statsDataHandle.reset();
  mockDataHandle.reset();
  mockDataHandle.createDataGroup();
};


</script>

<style scoped>
.n-layout {
  display: flex;
  justify-content: center;
  padding: 24px;
}
</style>
