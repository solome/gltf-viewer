"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = uuid;

// uuid
function S4() {
  return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
}
/**
 * 随机生成一个uuid值
 */


function uuid() {
  // then to call it, plus stitch in '4' in the third group
  return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
}