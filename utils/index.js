module.exports = {
  log: function (msg,...args) {
    console.log(`[${new Date().toLocaleString()}] [INFO] - ${msg}`, ...args,`\x1B[0m`);
  },
  error: function (msg,...args) {
    console.error(`\x1B[31m[${new Date().toLocaleString()}] [ERROR] - ${msg}`, ...args,`\x1B[0m`);
  },
  success: function (msg,...args) {
    console.log(`\x1B[32m[${new Date().toLocaleString()}] [SUCCESS] - ${msg}`, ...args,`\x1B[0m`);
  },
  warn: function (msg,...args) {
    console.log(`\x1B[33m[${new Date().toLocaleString()}] [WARN] - ${msg}`, ...args,`\x1B[0m`);
  }
}