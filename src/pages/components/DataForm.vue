<template>
  <n-form ref="formRef" :rules="formRules" :model="formData" inline class="form-data">
    <n-form-item label="初始资金" path="initCapital">
      <n-input-number min="1" v-model:value="formData.initCapital" placeholder="" :show-button="showBtn"/>
    </n-form-item>
    <n-form-item label="样本组数量" path="groupNum">
      <n-input-number min="1" v-model:value="formData.groupNum" placeholder="" :show-button="showBtn"/>
    </n-form-item>
    <n-form-item label="交易成本" path="tradeCost">
      <n-input-number min="0" v-model:value="formData.tradeCost" placeholder="" :show-button="showBtn">
        <template #suffix>
          %
        </template>
      </n-input-number>
    </n-form-item>
    <n-form-item label="破产线" path="ruinThreshold">
      <n-input-number min="0" v-model:value="formData.ruinThreshold" placeholder="" :show-button="showBtn">
        <template #suffix>
          %
        </template>
      </n-input-number>
    </n-form-item>
    <n-form-item>
      <n-button @click="onSubmit" type="success" :loading="loading">创建数据</n-button>
    </n-form-item>
    <n-form-item>
      <n-upload :disabled="loading" :custom-request="uploadRequest" accept=".xlsx" :show-file-list="false">
        <n-button :loading="loading">上传数据</n-button>
      </n-upload>
    </n-form-item>
  </n-form>
</template>

<script setup>
import {NForm, NFormItem, NButton, NInputNumber, NUpload} from "naive-ui";

import {ref, onMounted} from "vue";
import excel from "@/utils/excel.js";

const emit = defineEmits({
  onSubmit: 'onSubmit',
  onUploadData: "onUploadData"
})
const props = defineProps({
  conf: {
    type: Object,
    required: true
  },
  hasActData: {
    type: Boolean,
    required: false,
  }
})


onMounted(() => {
  formData.value = {...defaultFormData, ...props.conf}
})

const formRef = ref(null);
const showBtn = ref(false);
const loading = ref(false);
const formData = ref({});
const formRules = {
  initCapital: {
    required: true,
    message: "请输入初始资",
    trigger: "blur",
    type: 'number'
  },
  ruinThreshold: {
    required: true,
    message: "请输入破产线",
    trigger: "blur",
    type: 'number'
  },
  groupNum: {
    required: true,
    message: "请输入生成的样本组数量",
    trigger: "blur",
    type: 'number'
  },
  tradeCost: {
    required: true,
    message: "请输入交易成本",
    trigger: "blur",
    type: 'number'
  }
};
const defaultFormData = {
  initCapital: 15000, // 初始资金
  ruinThreshold: 50, // 破产线，最终资金 < 初始资金的 {$ruinThreshold}%，则算作破产
  groupNum: 10,
  tradeCost: 0,
}

const onSubmit = () => {
  loading.value = true;
  if (props.hasActData === false) {
    window.$message.error("请上传真实数据", {
      onAfterLeave: () => {
        loading.value = false
      }
    })
    return
  }
  formRef.value?.validate((err) => {
    if (!err) {
      emit("onSubmit", formData.value);
      setTimeout(() => {
        loading.value = false;
      }, 3000)
    }
  });
};

const uploadRequest = ({file, onFinish, onError, onProgress}) => {
  loading.value = true
  excel.reade(file.file).then((res) => {
    emit("onUploadData", res);
    loading.value = false;
  })
  onFinish()
}


</script>

<style scoped>
.form-data {
  //justify-content: center;
}
</style>
