const axios = require("axios").default;
const config = require("../config.json").httpserver;

const http = axios.create({
  baseURL: `${config.protocol}://${config.host}:${config.port}`,
  timeout: 10000, // 请求超时时间(10秒)
});

/**
 * 使用POST和BOT API通信
 * @param {string} api API节点 参考https://docs.go-cqhttp.org/api里的节点
 * @param {JSON} data 传入API的数据
 * @returns
 */
function post(api, data) {
  return http.post(api, data);
}

/**
 * 使用GET和BOT API通信
 * @param {string} api API节点 参考https://docs.go-cqhttp.org/api里的节点
 * @param {JSON} data 传入API的数据
 */
function get(api, data) {
  return http.get(api, {
    params: data,
  });
}
module.exports = {
  post,
  get,
};
