
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
/**
 * 在不同项目中可能需要进行重新配置的数据
 */
const BASIC_API = "http://172.16.1.2:13124/api";
const TOKEN = "Wzssdy20240312";
function getGlobalData() {
    return {
        projectName:  "洞头城南片区小流域防洪排涝系统",
        uid: userStore.name || "admin"
    }
}   


/**
 * 可调用的方法
 */ 
// 建立全局异常监听
export function globalMonitor(){
    // 开发环境不进行远程报错发送
    if(import.meta.env.VITE_APP_ENV === 'development'){
        return false;
    }
    var errorData = {};
    // 监听全局的错误事件

    console.log("全局挂载异常监听成功");
    window.onerror = function (message, source, lineno, colno, error) {
        console.log("error");
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
        JStaker({ type: 2,errorFunction:"globalError", errorPageUrl: "globalError", errorFunctionParams: errorData });
        // 阻止浏览器默认行为
        return false;
    };
}

// 性能监控
export function performanceMonitoring (startTime, eventName, endTime, projectName){
    if(import.meta.env.VITE_APP_ENV === 'development'){
        return false;
    }
    if (startTime == null || eventName == null){
        console.error("startTime or eventName is not availble");
    }
    if (endTime == null){
        endTime = new Date();
    }   
    let duration = endTime.getTime() - startTime.getTime();
    let xhr = new XMLHttpRequest();
    xhr.open('POST', BASIC_API + '/weblog/performMonitorPush', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', TOKEN);
    xhr.send(JSON.stringify({
        type: type,
        startTime:startTime,
        endTime:endTime,
        duration:duration,
        projectName: projectName,
        uid: uid,
        toekn: TOKEN
    }));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('数据已发送');
        }
    };
}

export function JStaker(params) {
    if(import.meta.env.VITE_APP_ENV === 'development'){
        return false;
    }
    const [type = 0, errorFunction = "test", errorPageUrl = "test", errorFunctionParams = {}, projectName = "test", uid = "admin"] = Object.values(params);
    const basicInformation = getGlobalData();
    let xhr = new XMLHttpRequest();
    xhr.open('POST', BASIC_API + '/weblog/push', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', TOKEN);
    xhr.send(JSON.stringify({
        type: type,
        errorFunction: errorFunction,
        errorPageUrl: errorPageUrl,
        errorFunctionParams: errorFunctionParams,
        projectName: basicInformation.projectName,
        uid: basicInformation.uid,
        token: TOKEN
    }));
    // 单元测试
    // xhr.send(JSON.stringify({
    //     "type": 1,
    //     "errorFunction":"getPage",
    //     "errorPageUrl": "/homepage",
    //     "errorFunctionParams": {
    //       "data": {"aa":"bb"}
    //     },
    //     "projectName":"haitang",
    //     "uid": "admin",
    //     "token":"Wzssdy20240312"
    // }))
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('数据已发送');
        }
    };
    // 你的代码
}
