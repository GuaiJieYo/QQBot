const fs = require("fs");
const path = require("path");
const utils = require("../utils");

class PluginManager {
  constructor() {
    this.plugins = [];
    this.PluginsDir = __dirname;
  }

  // 加载插件
  loadPlugins() {
    // 读取插件目录
    const files = fs.readdirSync(this.PluginsDir);
    files.forEach((file) => {
      // 遍历插件文件
      const filePath = path.join(this.PluginsDir, file);
      if (
        fs.statSync(filePath).isFile() &&
        file.endsWith(".js") &&
        file != "_Manager.js"
      ) {
        // 如果是插件文件，则加载插件
        const plugin = require(filePath);
        if (
          plugin.name &&
          plugin.condition &&
          plugin.execute &&
          plugin.version
        ) {
          // 如果插件导出了 name,condition,excute，version则添加到插件列表
          this.plugins.push(plugin);
          // 判断插件是否含init函数,如果有则执行
          if (plugin.init) plugin.init();
        } else {
          // 如果插件没有导出 name,condition,excute，则抛出错误
          utils.error(`插件 ${file} 加载失败，缺少必要属性`);
        }
      }
    });
    utils.log(`插件加载完毕！共加载 ${this.plugins.length} 个插件`);
  }

  // 执行插件
  executePlugins(data) {
    data = JSON.parse(data); // 将数据转换为 JSON 对象
    // 遍历插件
    this.plugins.forEach((plugin) => {
      // 判断插件是否满足条件
      if (this._checkCondition(plugin.condition, data)) {
        plugin.execute(data);
      }
    });
  }

  // 检查条件
  _checkCondition(condition, data) {
    // 如果条件为空，则返回 false
    if (!condition) return false;
    // 如果条件为all，则返回 true
    if (condition == "all") return true;
    // 如果条件为对象，则遍历对象，判断每个条件是否满足
    return Object.keys(condition).every((key) => data[key] === condition[key]);
  }
}

module.exports = PluginManager;
