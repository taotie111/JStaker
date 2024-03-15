
import useUserStore from '@/store/modules/user'
/**
 * 在不同项目中可能需要进行重新配置的数据
 */
export class JStaker {
    constructor(userStore, projectName, basicPath, token) {
        // 需要初始化或者默认设置的值
        this.userStore = userStore || new useUserStore();
        this.BASIC_API = basicPath || "http://172.16.1.2:13124/api"; // 需要替换成实际的值
        this.TOKEN = token || "Wzssdy20240312"; // 需要替换成实际的值
        this.projectName = projectName || "洞头城南片区小流域防洪排涝系统";
        this.uid = this.userStore.name || "未登录";
    }

    // 用户二次登录后需要对信息进行验证
    setUid(uid) {
        this.uid = uid;
    }

    //初始化全局监控
    globalMonitor() {
        if (import.meta.env.VITE_APP_ENV === 'development') {
            return false;
        }
        var errorData = {};
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

    // 异常上报
    errorJStaker(params) {
        this.JStakerRequest(params);
    }

    /**
     * 由于异常上报都是 POST 请求
     * @param {*} params // 上传的参数  
     */
    JStakerRequest(params) {
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

const jstaker = new JStaker();
jstaker.globalMonitor();
