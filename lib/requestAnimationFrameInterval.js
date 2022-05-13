"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestAnimationFrameInterval = requestAnimationFrameInterval;

var _requestAnimationFrame = require("./requestAnimationFrame");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function requestAnimationFrameInterval(fn, context) {
  var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var stoped = false;

  var _loop = function loop(time) {
    if (fn) fn.call.apply(fn, [context, time].concat(_toConsumableArray(args)));
    if (!stoped && _loop) (0, _requestAnimationFrame.requestAnimationFrame)(_loop);
  };

  (0, _requestAnimationFrame.requestAnimationFrame)(_loop);
  return function () {
    _loop = null, stoped = true;
  };
}