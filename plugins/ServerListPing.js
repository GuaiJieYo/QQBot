/**
 * Minecraft Server List Ping
 * @author: GuaiJie
 */
const http = require("../http");
const net = require("net");
const varint = require("varint");
const utils = require("../utils");

let config = {
  host: "mm.rainplay.cn",
  port: 14351,
  group: 982784456,
  key: "#mc", // 触发关键词
};

// 导出插件
module.exports = {
  name: "ServerListPing", // 插件名称(必须)
  description: "这是一个Minecraft服务器列表Ping插件", // 插件描述(可选)
  version: "1.0.0", // 插件版本(必须)
  condition: "all", // 如果condition为all 则代表所有消息都会触发
  execute: (data) => {
    if (data.message == config.key && data.group_id == config.group) {
      Ping({ host: config.host, port: config.port }, (code, res) => {
        if (code == "success") {
          http.post("/send_group_msg", {
            group_id: config.group,
            message: `[CQ:image,file=${res.favicon.replace(
              "data:image/png;base64,",
              "base64://"
            )}]服务器列表Ping结果: \n版本:${res.version.name} \n在线玩家${res.players.online}/${res.players.max} \n当前延迟: ${res.latency}ms`,
          });
        } else {
          http.post("/send_group_msg", {
            group_id: config.group,
            message: `[ServerListPing] 请求失败:\n错误码${code}\n错误信息:${res}`,
          });
        }
      });
    }
  },
};

/**
 * MinecraftServerListPing
 * @see https://geekdaxue.co/read/Minecraft-doc-zh/Server_List_Ping.md
 * @param {Object} param0 { host, port, timeout, protocol }配置选项
 * @param {Function} callback 回调
 * @return {Object} { code, res } res为object注意要将其转换为json字符串
 */
function Ping({ host, port = 25565, timeout = 3000, protocol = 4 }, callback) {
  // 创建连接
  const client = new net.Socket();

  client.connect(port, host); // 连接服务器

  const startTime = Date.now(); // 开始时间
  let latency = 0; // 通信延迟(ms)

  client.setTimeout(timeout); // 设置超时时间

  // 请求超时处理
  client.on("timeout", () => {
    client.destroy();
    utils.error("[ServerListPing] 请求超时!");
    callback("timeout", "请求超时");
  });

  // 错误处理
  client.on("error", (err) => {
    client.destroy();
    utils.error("[ServerListPing] 请求错误!", err);
    callback("error", err); // 回调错误信息
  });

  client.on("connect", () => {
    // 结束时间
    const endTime = Date.now();

    // 包ID
    const packetBuffer = Buffer.from([0x00]);

    // 协议版本(1.7.5 -> 4)
    const protocolBuffer = Buffer.from(varint.encode(protocol));

    // 服务器地址
    const hostLengthBuffer = Buffer.from(varint.encode(host.length));
    const hostBuffer = Buffer.from(host);

    // 端口
    const portBuffer = Buffer.alloc(2);
    portBuffer.writeUInt16BE(port);

    // Next state
    const stateBuffer = Buffer.from([0x01]);

    // 合成握手包
    const dataBuffer = Buffer.concat([
      packetBuffer,
      protocolBuffer,
      hostLengthBuffer,
      hostBuffer,
      portBuffer,
      stateBuffer,
    ]);
    const dataLengthBuffer = Buffer.from(varint.encode(dataBuffer.length));

    const handshakeBuffer = Buffer.concat([dataLengthBuffer, dataBuffer]);
    client.write(handshakeBuffer); // 发送握手包

    // 请求包(俩空字段)
    const requestBuffer = Buffer.from([0x01, 0x00]);
    client.write(requestBuffer); // 发送请求包

    latency = endTime - startTime; // 计算延迟

    utils.log("[ServerListPing] 请求成功! 耗时: ", latency, "ms");
  });

  let responseDataBuffer = Buffer.alloc(0); // 接收数据缓冲区

  client.on("data", (responseBuffer) => {
    responseDataBuffer = Buffer.concat([responseDataBuffer, responseBuffer]); // 将接收到的数据存入缓冲区

    let responseDataBufferLength; // 接收数据缓冲区长度

    // 尝试解析数据长度
    try {
      responseDataBufferLength = varint.decode(responseDataBuffer);
    } catch (err) {
      utils.error("[ServerListPing] 解析数据长度失败!", err);
      return;
    }

    // 如果接收数据缓冲区长度小于数据长度则继续接收
    if (
      responseDataBuffer.length <
      responseDataBufferLength - varint.decode.bytes
    )
      return;

    let offset = varint.decode.bytes;

    // 解码包ID长度
    varint.decode(responseDataBuffer, offset);
    offset += varint.decode.bytes;

    // 解码JSON长度
    varint.decode(responseDataBuffer, offset);
    offset += varint.decode.bytes;

    try {
      const response = JSON.parse(responseDataBuffer.toString("utf-8", offset));
      response.latency = latency; // 添加延迟字段
      callback("success", response);
    } catch (error) {
      callback("error", error);
      utils.error("[ServerListPing] 解析JSON失败!", error);
    }

    client.end();
  });
}
