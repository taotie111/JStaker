
import useUserStore from '@/store/modules/user'
/**
 * 在不同项目中可能需要进行重新配置的数据
 */
const BASIC_API = "http://172.16.1.2:13124/api";
const TOKEN = "Wzssdy20240312";
function getGlobalData() {
    const userStore = useUserStore()
    return {
        projectName: "洞头城南片区小流域防洪排涝系统",
        uid: userStore.name || "admin"
    }
}


/**
 * 可调用的方法
 */
// 建立全局异常监听
export function globalMonitor() {
    // 开发环境不进行远程报错发送
    if (import.meta.env.VITE_APP_ENV === 'development') {
        return false;
    }
    var errorData = {};
    // 监听全局的错误事件

    console.log("全局挂载异常监听成功");
    window.onerror = function (message, source, lineno, colno, error) {
        // 构造异常信息对象
        var errorInfo = {
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            error: error
        };
        // 将异常信息存储到 errorData 对象中
        errorData = errorInfo;
        // 上报异常信息到服务器
        errorJStaker({ type: 2, errorFunction: "globalError", errorPageUrl: "globalError", errorFunctionParams: errorData });
        // 阻止浏览器默认行为
        return false;
    };
}

// 性能监控
export function performanceMonitoring(startTime, eventName, endTime, projectName) {

    if (startTime == null || eventName == null) {
        console.error("startTime or eventName is not availble");
    }
    if (endTime == null) {
        endTime = new Date();
    }
    let duration = endTime.getTime() - startTime.getTime();
    JStakerRequest({
        type: 1,
        startTime: JStakerFormatDate(startTime),
        endTime: JStakerFormatDate(endTime),
        duration: duration,
    })
}


export function errorJStaker(params) {
    JStakerRequest(...params);
}


function getAPI() {
    switch (type) {
        case 1: return "/weblog/performMonitorPush";
        case 2: return "/weblog/push";
    }
}

function JStakerRequest(params) {
    // if(import.meta.env.VITE_APP_ENV === 'development'){
    //     return false;
    // }
    const basicInformation = getGlobalData();
    let xhr = new XMLHttpRequest();
    xhr.open('POST', BASIC_API + (getAPI(params.type) || '/weblog/push'), true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', TOKEN);
    xhr.send(JSON.stringify({
        ...params,
        projectName: basicInformation.projectName,
        uid: basicInformation.uid,
        token: TOKEN
    }));
}
/**
 * 表格时间格式化
 */
function JStakerFormatDate(cellValue) {
    if (cellValue == null || cellValue == "") return "";
    var date = new Date(cellValue)
    var year = date.getFullYear()
    var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    var milliseconds = date.getMilliseconds();
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + "." + milliseconds
}
