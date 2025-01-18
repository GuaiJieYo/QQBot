const ws = require("ws");
const utils = require("./utils");
const config = require("./config.json");
const PluginManager = require("./plugins/_Manager");

// 初始化 WebSocket 服务器
const wsc = new ws(`ws://${config.wsserver.host}:${config.wsserver.port}`);

// 初始化插件管理器
const pluginManager = new PluginManager();

wsc.on("open", function () {
  utils.success("机器人连接成功!");

  // 加载插件
  pluginManager.loadPlugins();

});

wsc.on("message", function (data) {

  let StringData = data.toString();
  let JsonData = JSON.parse(StringData);

  // 自动排除心跳包
  if (!StringData.includes("heartbeat")) {
    // 如果是消息上报
    if (JsonData.post_type == ("message" || "message_sent ")) {
      utils.log(`收到消息: [${JsonData.message_type}][${JsonData.user_id}]${JsonData.sender.nickname} - ${JsonData.message}`)
    }
    // 将信息发送给插件 让插件处理
    pluginManager.executePlugins(StringData);
  }
});

wsc.on("close", function () {
  utils.error("连接关闭，正在关闭服务");
});

wsc.on("error", function (err) {
  utils.error("连接错误:", err);
});
