"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SubscribeMixinType = exports.Subscribe = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// type UniqueSymbol = ReturnType<(a: string) => { readonly 0: unique symbol }[0]>;
//
// function createSymbol(description: string): UniqueSymbol {
//   // TODO 解决提示
//   // @ts-ignore
//   return typeof Symbol === "undefined" ? `$Symbol<${description}>$` : Symbol(description);
// }
//
// const EVENT_SYMBOL = createSymbol("$$LIVE_EVENT$$")
var EVENT_SYMBOL = Symbol("$$LIVE_EVENT$$");

function __generateEventIfNotExisted(instance) {
  if (!instance[EVENT_SYMBOL]) {
    instance[EVENT_SYMBOL] = {};
  }

  return instance[EVENT_SYMBOL];
}

function __removeEventIfNotExisted(instance) {
  if (!instance[EVENT_SYMBOL]) {
    delete instance[EVENT_SYMBOL];
  }
}
/**
 * 监听者模式
 * @template T 预设的监听回调类型
 * @example
 * ```
 * new Subscribe<{
 * "foo": [arg1: number, arg2: string],
 * "bar": [arg: boolean],
 * }>()
 * ```
 */


var Subscribe = /*#__PURE__*/function () {
  function Subscribe() {
    _classCallCheck(this, Subscribe);
  }

  _createClass(Subscribe, [{
    key: "hasListener",
    value:
    /**
     * 判断是否注册了事件
     * @param name  事件类型
     */
    function hasListener(name) {
      var events = __generateEventIfNotExisted(this);

      return events && events[name] && events[name].length > 0;
    }
    /**
     * 注册事件
     * @param  name    事件类型
     * @param  callback 事件回调函数
     * @param  once     是否只执行一次
     * @returns 解除事件
     * @template K 预设的监听事件名称
     * @template C 回调函数函数上下文
     */

  }, {
    key: "on",
    value: function on(name, callback, once) {
      var _this = this;

      var events = __generateEventIfNotExisted(this);

      if (!events[name]) events[name] = [];
      events[name].push([callback, once || false]);
      return function () {
        return _this.off(name, callback);
      };
    }
    /**
     * 注册事件(是否只执行一次)
     * @param  name     事件类型
     * @param  callback 事件回调函数
     * @returns 解除事件
     * @template K 预设的监听事件名称
     * @template C 回调函数函数上下文
     */

  }, {
    key: "once",
    value: function once(name, callback) {
      return this.on(name, callback, true);
    }
    /**
     * 解除事件
     *
     * 如果 name 不传的话解除对应所有事件
     * 如果 name, callback 不传的话解除所有name的所有事件
     * @param  name     事件类型
     * @param  callback 事件回调函数
     * @template K 预设的监听事件名称
     */

  }, {
    key: "off",
    value: function off(name, callback) {
      if (name === undefined) {
        __removeEventIfNotExisted(this);

        return;
      }

      var events = __generateEventIfNotExisted(this);

      if (!events[name]) events[name] = [];

      if (callback === undefined) {
        events[name].length = 0;
        return;
      }

      var index = 0;

      for (; index < events[name].length; index++) {
        if (events[name][index][0] === callback) break;
      }

      if (index < events[name].length) {
        events[name].splice(index, 1);
      }
    }
    /**
     * 触发事件
     * @param  name  事件类型
     * @param  data  触发事件的数据
     * @returns canceled 是否被触发取消
     * @template K 预设的监听事件名称
     */

  }, {
    key: "emit",
    value: function emit(name) {
      var canceled = false;

      var events = __generateEventIfNotExisted(this);

      var event = events[name] || [];

      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }

      var _iterator = _createForOfIteratorHelper(event.slice()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var one = _step.value;

          var _one = _slicedToArray(one, 2),
              _callback = _one[0],
              _one$ = _one[1],
              _once = _one$ === void 0 ? false : _one$;

          var result = _callback.apply(void 0, data);

          if (_once) this.off(name, _callback);
          if (result === false) canceled = true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return canceled;
    }
  }]);

  return Subscribe;
}();

exports.Subscribe = Subscribe;
var SubscribeMixinType;
exports.SubscribeMixinType = SubscribeMixinType;

(function (_SubscribeMixinType) {})(SubscribeMixinType || (exports.SubscribeMixinType = SubscribeMixinType = {}));