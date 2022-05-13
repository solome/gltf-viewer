"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFrameTime = getFrameTime;

var _requestAnimationFrame = require("./requestAnimationFrame");

var cache = {
  duration: 0
};

function getFrameTime(callback) {
  if (cache.duration) callback(cache.duration);
  var start = Date.now();
  (0, _requestAnimationFrame.requestAnimationFrame)(function () {
    callback(cache.duration = Date.now() - start);
  });
}

getFrameTime(function () {});