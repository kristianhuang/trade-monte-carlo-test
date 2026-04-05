export class DomObserver {

    constructor(el) {
        this.el = el;
        this.resizeObserver = null;
        this.currentSize = null;
        this.callbacks = [];
    }

    init(){
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const rect = entry.contentRect;
                // 防抖处理，避免频繁触发
                if (this.currentSize &&
                    Math.abs(rect.width - this.currentSize.width) < 2 &&
                    Math.abs(rect.height - this.currentSize.height) < 2) {
                    return; // 尺寸变化太小，忽略
                }
                this.currentSize = { width: rect.width, height: rect.height };
                this.callbacks.forEach(callback => callback({
                    width: rect.width,
                    height: rect.height,
                    target: entry.target
                }));
            }
        });

        this.resizeObserver.observe(this.el);
    }

    /**
     * 注册元素监听处理函数
     * @param callBack
     */
    onResize(callBack){
        this.callbacks.push(callBack)
    }

    /**
     * 注销所有 DOM 监听
     */
    destroy(){
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.element);
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.callbacks = [];
    }
}