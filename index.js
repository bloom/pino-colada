var prettyBytes = require("prettier-bytes");
var jsonParse = require("fast-json-parse");
var prettyMs = require("pretty-ms");
var padLeft = require("pad-left");
var split = require("split2");
var chalk = require("chalk");
var nl = "\n";

var emojiLog = {
  warn: "⚠️",
  info: "✨",
  error: "🚨",
  debug: "🐛",
  fatal: "💀",
  trace: "🔍"
};

function isWideEmoji(character) {
  return character !== "⚠️";
}

module.exports = PinoColada;

function PinoColada() {
  return split(parse);

  function parse(line) {
    var obj = jsonParse(line);
    if (!obj.value || obj.err) return line + nl;
    obj = obj.value;

    if (!obj.level) return line + nl;
    if (typeof obj.level === "number") convertLogNumber(obj);

    return output(obj) + nl;
  }

  function convertLogNumber(obj) {
    if (!obj.message) obj.message = obj.msg;
    if (obj.level === 10) obj.level = "trace";
    if (obj.level === 20) obj.level = "debug";
    if (obj.level === 30) obj.level = "info";
    if (obj.level === 40) obj.level = "warn";
    if (obj.level === 50) obj.level = "error";
    if (obj.level === 60) obj.level = "fatal";
  }

  function output(obj) {
    var output = [];

    if (!obj.level) obj.level = "userlvl";
    if (!obj.name) obj.name = "";
    if (!obj.ns) obj.ns = "";

    output.push(formatDate());
    output.push(formatLevel(obj.level));
    output.push(formatNs(obj.ns));
    output.push(formatName(obj.name));
    output.push(formatMessage(obj));

    var req = obj.req;
    var res = obj.res;
    var statusCode = res ? res.statusCode : obj.statusCode;
    var responseTime = obj.responseTime || obj.elapsed;
    var method = req ? req.method : obj.method;
    var contentLength = res ? res.headers["content-length"] : null;
    var reqHeaders = req ? req.headers : null;
    var resHeaders = req ? res.headers : null;
    var url = req ? req.url : obj.url;

    if (method != null) {
      output.push(formatMethod(method));
      output.push(formatStatusCode(statusCode));
    }
    if (url != null) output.push(formatUrl(url));
    if (contentLength != null) output.push(formatBundleSize(contentLength));
    if (responseTime != null) output.push(formatLoadTime(responseTime));

    if (process.env.SHOW_HTTP_HEADERS) {
      if (reqHeaders != null)
        output.push(formatHeaders("select request headers", reqHeaders));
      if (resHeaders != null)
        output.push(formatHeaders("select response headers", resHeaders));
    }

    return output.filter(noEmpty).join(" ");
  }

  function formatHeaders(title, headers) {
    delete headers.cookie;
    delete headers.contentLength;
    delete headers["user-agent"];
    keyVals = Object.keys(headers).map(key => `${key}=${headers[key]}`);
    return chalk.gray(
      `\n  ${chalk.yellow(title)}:\n    ${keyVals.join("\n    ")}`
    );
  }

  function formatDate() {
    var date = new Date();
    var hours = padLeft(date.getHours().toString(), 2, "0");
    var minutes = padLeft(date.getMinutes().toString(), 2, "0");
    var seconds = padLeft(date.getSeconds().toString(), 2, "0");
    var prettyDate = hours + ":" + minutes + ":" + seconds;
    return chalk.gray(prettyDate);
  }

  function formatLevel(level) {
    const emoji = emojiLog[level];
    const padding = isWideEmoji(emoji) ? "" : " ";
    return emoji + padding;
  }

  function formatNs(name) {
    return chalk.cyan(name);
  }

  function formatName(name) {
    return chalk.blue(name);
  }

  function formatMessage(obj) {
    var msg = formatMessageName(obj.message || obj.msg);
    if (obj.level === "error") return chalk.red(msg);
    if (obj.level === "trace") return chalk.white(msg);
    if (obj.level === "warn") return chalk.magenta(msg);
    if (obj.level === "debug") return chalk.yellow(msg);
    if (obj.level === "info" || obj.level === "userlvl")
      return chalk.green(msg);
    if (obj.level === "fatal") {
      var pretty = chalk.white.bgRed(msg);
      return obj.stack ? pretty + nl + obj.stack : pretty;
    }
  }

  function formatUrl(url) {
    return chalk.white(url);
  }

  function formatMethod(method) {
    return chalk.white(method);
  }

  function formatStatusCode(statusCode) {
    statusCode = statusCode || "xxx";
    return chalk.white(statusCode);
  }

  function formatLoadTime(elapsedTime) {
    var elapsed = parseInt(elapsedTime, 10);
    var time = prettyMs(elapsed);
    return chalk.yellow(time);
  }

  function formatBundleSize(bundle) {
    var bytes = parseInt(bundle, 10);
    var size = prettyBytes(bytes).replace(/ /, "");
    return chalk.cyan(size);
  }

  function formatMessageName(message) {
    if (message === "request completed") return "<---";
    return message;
  }

  function noEmpty(val) {
    return !!val;
  }
}
