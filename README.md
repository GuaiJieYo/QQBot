# NodeQQBot
用NodeJS+GO-CQHttp实现的QQ机器人
**本项目依据Apache License 2.0开源**

## 项目依赖
- GO-CQHTTP 》 [文档](https://docs.go-cqhttp.org/)

## 运行项目
**注意**: GO-CQHTTP需要开启WEBSOCKET和HTTP服务
```bash
npm run start
```
### 开发者模式
**注意**: 此模式使用了 **nodemon** 请自行手动安装  
```bash
npm run dev
```

## 配置文件
配置在config.json里  
```json
{
  "admin": [], // 此处为管理员QQ号
  "wsserver": { // websocket服务器地址
    "host": "localhost", 
    "port": 5710
  },
  "httpserver": { // http服务器地址
    "protocol": "http", // 服务器协议
    "host": "localhost",
    "port": 5700
  }
}

```

## 开发建议
本项目自带插件管理器 直接编写插件即可使用  
插件开发示例  
```javascript
// 引入请求库
const http = require("../http");
const utils = require("../utils");

// 导出插件
module.exports = {
  name: "EXAMPLE", // 插件名称(必须)
  description: "这只是一个示例插件", // 插件描述(可选)
  version: "1.0.0", // 插件版本(必须)
  condition: { // 插件触发条件(必须) (https://docs.go-cqhttp.org/event/)
    "post_type": "message",
    "message_type": "private"
  },
  // condition: "all", // 如果condition为all 则代表所有消息都会触发
  // 初始化函数(可选)
  init: () => {
    utils.success("Exmaple 插件已加载");
  },
  execute: (data) => {
    // 插件的具体逻辑(必须)
    http.get("send_private_msg", {
      user_id: data.user_id,
      // 获取系统时间插入信息中
      message: `[${new Date().toLocaleString()}] 复读机 ${data.message}`,
    });
  },
};

```
