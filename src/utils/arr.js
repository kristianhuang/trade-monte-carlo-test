export default {
    /**
     * 将数组随机截取并随机排序, 无重复元素
     * @param {Array} arr
     * @param {Number} minLen 生成的数组最小长度
     * @returns
     */
    randomShuffle(arr, minLen) {
        const shuffled = arr.slice();
        let i = arr.length;
        const min = i - this.getRandomInt(minLen, arr.length);
        while (i-- > min) {
            const index = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[index]] = [shuffled[index], shuffled[i]];
        }
        return shuffled.slice(min);
    },

    /**
     * 获取数组的随机单个元素
     * @param {Array} arr
     * @returns
     */
    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * 获取范围内随机整数
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     * @returns
     */
    getRandomInt(min, max) {
        if (min === max) return max;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 获取数组中间值
     * @param {Array} arr 需要获取中间值的数组
     * @returns
     */
    getMidVal(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const len = sorted.length;
        const mid = Math.floor(len / 2);
        return len % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    /**
     * 获取数组中最大值
     * @param {Array} arr
     * @returns {*|number}
     */
    getArrMaxEl(arr = []) {
        if (arr.length === 0) return 0;
        return arr.reduce((acc, curr) => Math.max(acc, curr));
    },

    /**
     * 获取数组中最小值
     * @param {Array} arr
     * @returns {*|number}
     */
    getArrMinEl(arr = []) {
        if (arr.length === 0) return 0;
        return arr.reduce((acc, curr) => Math.min(acc, curr));
    }
};
