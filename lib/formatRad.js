"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatRad = formatRad;
var PI_2 = Math.PI * 2;

function formatRad(rad) {
  return (rad % PI_2 + PI_2) % PI_2;
}