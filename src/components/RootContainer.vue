<template>
  <Main/>
</template>

<script setup>
import Main from "@/pages/Main.vue";
import {useMessage} from "naive-ui";

const initGlobMessage = () => {
  window.$message = useMessage();
}
initGlobMessage();
</script>
