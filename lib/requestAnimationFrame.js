"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestAnimationFrame = void 0;
var _window = window;

var requestAnimationFrame = window.requestAnimationFrame || _window.mozRequestAnimationFrame || _window.webkitRequestAnimationFrame || _window.msRequestAnimationFrame || function (fn) {
  return setTimeout(fn, 16);
};

exports.requestAnimationFrame = requestAnimationFrame;