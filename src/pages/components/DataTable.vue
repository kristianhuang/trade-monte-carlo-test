<template>
  <div class="data-table-container">
    <n-descriptions label-placement="top" bordered :column="4">
      <n-descriptions-item label="资金表现">
        <div>平均资金: {{ statsData.avgProfitVal }}({{ statsData.avgProfitPCT }}%)</div>
        <div>中位资金: {{ statsData.midProfitVal }}({{ statsData.midProfitPCT }}%)</div>
        <div>最大资金: {{ statsData.maxProfitVal }}({{ statsData.maxProfitPCT }}%)</div>
        <div>最小资金: {{ statsData.minProfitVal }}({{ statsData.minProfitPCT }}%)</div>
      </n-descriptions-item>
      <n-descriptions-item label="风险表现">
        <div>亏损账户数: {{ statsData.lossItemCount }}({{ statsData.lossItemCountPCT }}%)</div>
        <div>破产数: {{ statsData.ruinTotal }}({{ statsData.ruinPCT }}%)</div>
        <div>平均连败: {{ statsData.avgContinuousLossVal }}</div>
        <div>最大连败: {{ statsData.maxContinuousLossVal }}</div>
      </n-descriptions-item>
      <n-descriptions-item label="回撤深度">
        <div>平均最大回撤: {{ Math.abs(statsData.avgMaxDrawdownVal) }}({{ statsData.avgMaxDrawdownValPCT }}%)</div>
        <div>中位最大回撤: {{ Math.abs(statsData.midMaxDrawdownVal) }}({{ statsData.midMaxDrawdownPCT }}%)</div>
        <div>最大回撤: {{ Math.abs(maxDrawdownVal) }}({{ maxDrawdownValPTC }}%)</div>
      </n-descriptions-item>
      <n-descriptions-item label="策略表现">
        <div>胜率: {{ 100 - statsData.avgSignalLossPTC }}%</div>
        <div>盈亏比: {{ statsData.RR }}</div>
      </n-descriptions-item>
    </n-descriptions>
  </div>

</template>

<script setup>
import {NDescriptions, NDescriptionsItem} from "naive-ui";
import {computed} from "vue";

const props = defineProps({
  statsData: {
    type: Object,
    default: {},
    required: true
  },
  maxDrawdownVal: {
    type: Number,
    default: 0,
  },

  initCapital: {
    type: Number,
    required: true,
  }
});

const maxDrawdownValPTC = computed(() => {
  return ((Math.abs(props.maxDrawdownVal) / props.initCapital) * 100).toFixed(2);
});


</script>

<style scoped>
.data-table-container {
  padding: 24px 0;
  justify-content: flex-start;
}
</style>
