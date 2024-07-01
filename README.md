# 项目名称

JSTaker

## 项目背景

JStaker 是一个用于监控和上报前端异常和性能数据的工具。它可以通过捕获全局错误、监控页面渲染性能和上报异常信息等功能，帮助开发者及时发现和解决问题，提升用户体验。

## 功能特点

- 全局监控：捕获全局错误并上报异常信息。
- DOM 渲染性能监控：监控页面渲染性能，并上报相关数据。
- 异常上报：将异常信息上报到指定的接口。
- 配置化：可以通过初始化参数进行配置，如用户信息、项目名称、基本路径和认证令牌等。

## 技术栈

- JavaScript

## 部署和安装

1. 克隆项目代码到本地：
   ```shell
   git clone https://github.com/taotie111/JStaker.git
   ```

2. 在项目根目录下安装依赖：
   ```shell
   yarn
   ```

3. 修改配置参数：
   在 `JStaker` 类的构造函数中，可以根据需要修改以下参数：
   - `userStore`：用户存储模块的实例。
   - `projectName`：项目名称。
   - `basicPath`：基本路径。
   - `token`：认证令牌。

4. 启动全局监控：
   在入口文件中创建 `JStaker` 实例，并调用 `globalMonitor` 方法启动全局监控：
   ```javascript
   const jstaker = new JStaker();
   jstaker.globalMonitor();
   ```

### 插件全局注册（内置）
```
import { setUpJSTaker } from 'jstaker';
const app = createApp(App)
setUpJSTaker(app, {projectName:"洞头城南片区防洪排涝系统",basicPath:"https://jstaker.wzsly.cn/api" },{isHandleApiCode: true})
```
注册参数说明
 |参数	 |类型 |	约束 |	备注 |
| --- | --- | --- | --- |
 |projectName	 |String	 |不可为空 |	项目名称 |
 |basicPath	 |string	可为空	 |项目基础路径默认为"https://jstaker.wzsly.cn/api" |
			
			
			
注册设置说明
 |参数	 |类型 |	约束 |	备注 |
| --- | --- | --- | --- |
|isHandleApiCode|	Boolean	|可为空	|是否监听所有的接口报错默认为false，可能会有一定的性能开销|
			
			
			
			

## 使用示例

以下是一个使用示例：

```javascript
import useUserStore from '@/store/modules/user';

const userStore = new useUserStore();
const jstaker = new JStaker(userStore, "洞头城南片区小流域防洪排涝系统", "http://172.16.1.2:13124/api", "Wzssdy20240312");

// 设置用户ID
jstaker.setUid("user123");

// 初始化 DOM 渲染性能监控
jstaker.initPerformanceMonitoring();

// 全局监控示例
try {
  // ... your code ...
} catch (error) {
  jstaker.errorJStaker({ type: 2, errorFunction: "globalError", errorPageUrl: "globalError", errorFunctionParams: error });
}
```

## 贡献指南

如果您想为项目做出贡献，请遵循以下步骤：

1. Fork 本仓库到自己的 GitHub 账号下。
2. 创建新的分支进行开发：`git checkout -b feature/your-feature-name`
3. 提交您的变更：`git commit -m 'Add some feature'`
4. 推送到远程分支：`git push origin feature/your-feature-name`
5. 提交 Pull Request 给本仓库的 `main` 分支。

我们非常感谢您的贡献！

## 许可证

本项目使用 [MIT License](LICENSE) 许可证。
## 联系方式

如果您有任何问题或建议，请通过以下方式联系我们：

- 邮箱：1023931586@qq.com
- GitHub 仓库：[项目链接](https://github.com/taotie111/JStaker.git)

## upload
#### 1.0.5
将 pv 上报的方式从普通请求改为 img ，防止跨域问题和渲染阻塞问题