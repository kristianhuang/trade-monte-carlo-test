import * as XLSX from "xlsx";

export default {
    /**
     * 读取 Excal
     * @param {File} file
     * @returns {Promise<unknown>}
     */
    reade(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const data = new Uint8Array(ev?.target.result);
                const workbook = XLSX.read(data, {type: "array"});
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const excelJson = XLSX.utils.sheet_to_json(sheet)
                const valList = [];
                for (let i = 0, len = excelJson.length; i < len; i++) {
                    valList.push(excelJson[i]["profit"]);
                }
                resolve(valList)
            }

            reader.readAsArrayBuffer(file);
        })

    }
}