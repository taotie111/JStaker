import { request } from './request'
/**
 * 组件注册
 */
export function setUpJSTaker(app, params, settings) {
    const jsTaker = new JStaker(params, settings);
    jsTaker.globalMonitor();
    //全局变量挂载
    app.config.errorHandler = (err, vm, info) => {
        // 在这里处理错误，例如日志记录或向用户显示错误信息
        console.error('Global Error Handler:', err, vm, info);
        setTimeout(() => {
            throw err
        })
    };
    app.config.globalProperties.JSTaker = jsTaker;
    // 注册自定义组件
    customElements.define('pv-div', PVDIV);
    return jsTaker;
}
/**
 * 在不同项目中可能需要进行重新配置的数据
 */
export class JStaker {
    constructor(params = {}, settings = {}) {
        if (!params) {
            params = {}
        }
        // 需要初始化或者默认设置的值
        // 内网地址： http://172.16.1.2:13124/api
        // 外网地址：jstaker.wzsly.cn
        const { projectName = "未填写", basicPath = "https://jstaker.wzsly.cn/api", token, user } = params;
        this.BASIC_API = basicPath; // 需要替换成实际的值
        this.TOKEN = token || "Wzssdy20240312"; // 需要替换成实际的值
        this.projectName = projectName || "洞头城南片区小流域防洪排涝系统";
        this.uid = user || "未登录";
        this.settings = settings;
        this.clickStatus = false;
        this.ip = null
        this.handleSettings();
        if (this.isTrackClick) {
            document.addEventListener('click', this.trackClickEvent.bind(this));
        }
    }

    // 用户二次登录后需要对信息进行验证
    setUid(uid) {
        this.uid = uid;
    }

    // 处理一些基础配置问题
    /**
     * isHandleApiCode：是否需要处理API返回的code
     */
    handleSettings() {
        if (!this.settings) {
            this.settings = {};
        }
        let { isHandleApiCode = false, isTrackClick = false } = this.settings;
        this.isHandleApiCode = isHandleApiCode;
        this.isTrackClick = isTrackClick;
    }

    //初始化全局监控
    globalMonitor() {
        // if (import.meta.env.VITE_APP_ENV === 'development') {
        //     return false;
        // }
        var that = this;
        var errorData = {};

        // 保存原始的XMLHttpRequest对象
        var originalXhr = window.XMLHttpRequest;

        // 重写XMLHttpRequest对象的原型方法
        function CustomXMLHttpRequest() {
            var xhr = new originalXhr();
            var requestParams = {}; // 保存请求参数

            // 保存请求参数
            xhr.open = function (method, url, async) {
                requestParams.method = method;
                requestParams.url = url;
                requestParams.async = async;
                originalXhr.prototype.open.apply(xhr, arguments);
            };

            // 重写send方法，保存POST请求的输入参数
            var originalSend = xhr.send;
            xhr.send = function (data) {
                requestParams.data = data;
                originalSend.call(xhr, data);
            };

            // 添加自定义的回调函数
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (!that.isHandleApiCode) {
                            let res = JSON.parse(xhr.response);
                            if (res.code !== 200) {
                                that.errorJStaker({ type: 2, errorFunction: requestParams.url, errorPageUrl: "apiError：服务器已返回", errorFunctionParams: requestParams, errorMsg: xhr.response });
                            }
                        }
                    } else {
                        that.errorJStaker({ type: 2, errorFunction: requestParams.url, errorPageUrl: "apiError: 请求服务器错误", errorFunctionParams: requestParams, errorMsg: xhr.response });
                        console.error('请求失败', requestParams, xhr);
                    }
                }
            };

            return xhr;
        }

        // 覆盖全局的XMLHttpRequest对象
        window.XMLHttpRequest = CustomXMLHttpRequest;

        window.onerror = (message, source, lineno, colno, error) => {
            var errorInfo = {
                message: message,
                source: source,
                lineno: lineno,
                colno: colno,
                error: error
            };
            errorData = errorInfo;
            this.errorJStaker({ type: 2, errorFunction: "globalError", errorPageUrl: "globalError", errorFunctionParams: errorData });
            return false;
        };

    }


    // 初始化DOM渲染性能监控
    initPerformanceMonitoring() {
        const performanceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // 只处理我们关心的性能条目
                if (entry.entryType === 'paint' || entry.entryType === 'largest-contentful-paint') {
                    this.performanceMonitoring(entry.startTime, entry.name, entry.startTime + entry.duration);
                }
            }
        });
        // 订阅paint和largest-contentful-paint性能条目
        performanceObserver.observe({ type: 'paint', buffered: true });
        performanceObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    }

    // 性能监控
    performanceMonitoring(startTime, eventName, endTime = new Date()) {

        if (startTime == null || eventName == null) {
            console.error("startTime or eventName is not available");
            return;
        }
        // 计算所用时间
        let duration = endTime.getTime() - startTime.getTime();
        this.JStakerRequest({
            type: 1,
            startTime: this.JStakerFormatDate(startTime),
            endTime: this.JStakerFormatDate(endTime),
            duration: duration,
            eventName: eventName
        });
    }


    // TODO 资源加载监测
    scriptMonitoring() {
        // 创建一个 PerformanceObserver 来监测资源加载
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('Resource loaded:', entry.name, 'Type:', entry.entryType);
                // 你可以根据需要处理每个资源加载的详细信息
                // 例如，entry.startTime, entry.duration, entry.initiatorType 等
            }
        });

        // 配置 PerformanceObserver 来监测 'resource' 类型的事件
        observer.observe({ entryTypes: ['resource'] });
    }
    // TODO 点击埋点统计
    trackClickEvent(clickName, message) {
        // 点击是否正在上报
        if (clickStatus) {
            return "数据处理中";
        }
        // 上传点击统计事件
        this.upClick(clickName, message)

    }

    // 异常上报
    errorJStaker(params) {
        this.JStakerRequest(params);
    }


    /**
     * 埋点上报
     */
    upClick(clickName, message) {
        const params = {
            token: "",
            url: "",
            params: {
                clickName: clickName,
                uid: this.uid,
                message: message,
                token: this.token,
            }
        }
        // 新建图片地址用于上报
        const img = new Image();
        img.src = `${this.BASIC_API} + "/weblog/uv/getUVdataList"?event=${eventName}&params=${encodeURIComponent(JSON.stringify(params))}`;
    }
    /**
     * 由于异常上报都是 POST 请求
     * @param {*} params // 上传的参数  
     */
    JStakerRequest(params) {

        if (params.type == 2 && params.errorFunction && params.errorFunction.includes("weblog/push")) {
            return false;
        }
        const apiPath = this.getAPIPath(params.type);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', this.BASIC_API + apiPath, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', this.TOKEN);
        xhr.send(JSON.stringify({
            ...params,
            projectName: this.projectName,
            uid: this.uid,
            token: this.TOKEN
        }));
    }

    /**
     * 返回不同监控类型对应的 request 的路径
     * @param {*} type 
     * @returns String
     */
    getAPIPath(type) {
        switch (type) {
            case 1: return "/weblog/performMonitorPush";
            case 2: return "/weblog/push";
            default: return '/weblog/push';
        }
    }

    /**
     * 
     * @param {*} cellValue  // date 时间
     * @returns 
     */
    JStakerFormatDate(cellValue) {
        if (cellValue == null || cellValue == "") return "";
        var date = new Date(cellValue);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        var seconds = date.getSeconds().toString().padStart(2, '0');
        var milliseconds = date.getMilliseconds();
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
}
