<template>
  <div class="data-table-container">
    <n-table>
      <thead>
      <tr>
        <th>平均收益(%)</th>
        <th>中位数收益(%)</th>
        <th>亏损账户数(%)</th>
        <th>单次胜率</th>
        <th>策略盈亏比</th>
        <th>最大收益(%)</th>
        <th>最小收益(%)</th>
        <th>最大回撤</th>
        <th>最大连败次数</th>
        <th>破产数(%)</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>{{ avgProfit.val }}({{ avgProfit.pct }}%)</td>
        <td>{{ mitProfit.val }}({{ mitProfit.pct }}%)</td>
        <td>{{ statsData.lossItemCount }}({{ statsData.lossItemCountPCT }}%)</td>
        <td>{{ 100 - statsData.avgSignalLossPTC }}%</td>
        <td>{{ statsData.RR }}</td>
        <td>{{ maxProfit.val }}({{ maxProfit.pct }}%)</td>
        <td>{{ minProfit.val }}({{ minProfit.pct }}%)</td>
        <td>{{ maximumDrawdownVal }}</td>
        <td>{{ statsData.maxLossTotal }}</td>
        <td>{{ statsData.ruinTotal }}({{ statsData.ruinPCT }}%)</td>
      </tr>
      </tbody>
    </n-table>
  </div>

</template>

<script setup>
import {NTable} from "naive-ui";
import {computed} from "vue";

const props = defineProps({
  statsData: {
    type: Object,
    default: {},
    required: true
  },
  maximumDrawdownVal: {
    type: Number,
    default: 0,
  },

  initCapital: {
    type: Number,
    required: true,
  }
});

const avgProfit = computed(() => {
  let val = props.statsData?.avgProfitVal > 0 ? (props.statsData?.avgProfitVal - props.initCapital).toFixed(2) : 0;
  let pct = props.statsData?.avgProfitPCT > 0 ? (props.statsData?.avgProfitPCT - 100).toFixed(2) : 0;
  return {
    val,
    pct
  }
})
const mitProfit = computed(() => {
  let val = props.statsData?.midProfitVal > 0 ? (props.statsData?.midProfitVal - props.initCapital).toFixed(2) : 0;
  let pct = props.statsData?.midProfitPCT > 0 ? (props.statsData?.midProfitPCT - 100).toFixed(2) : 0;
  return {
    val,
    pct
  }
})
const maxProfit = computed(() => {
      let val = props.statsData?.maxProfitVal > 0 ? (props.statsData?.maxProfitVal - props.initCapital).toFixed(2) : 0;
      let pct = props.statsData?.maxProfitPCT > 0 ? (props.statsData?.maxProfitPCT - 100).toFixed(2) : 0;
      return {
        val,
        pct
      }
    })
const minProfit = computed(() => {
      let val = props.statsData?.minProfitVal > 0 ? (props.statsData?.minProfitVal - props.initCapital).toFixed(2) : 0;
      let pct = props.statsData?.minProfitPCT > 0 ? (props.statsData?.minProfitPCT - 100).toFixed(2) : 0;
      return {
        val,
        pct
      }
    })


</script>

<style scoped>
.data-table-container {
  padding: 24px 0;
  justify-content: flex-start;
}
</style>
