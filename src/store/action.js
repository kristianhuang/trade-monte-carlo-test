import {defineStore} from 'pinia'
import {ref} from "vue";

export const useActionStore = defineStore('action', () => {
    const saveChart = ref(false);

    const setSaveChart = (save = false) => {
        saveChart.value = save;
    }

    return {saveChart, setSaveChart}
})