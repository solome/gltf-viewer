"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMouseWheel = addMouseWheel;
exports.removeMouseWheel = removeMouseWheel;
// 兼容 滚轮事件
var _document = document;
var _window = window;
var eventName = _document.mozFullScreen ? 'DOMMouseScroll' : 'mousewheel';
var isW3cEvent = !!window.addEventListener;
var isIEEvent = !!_window.attachEvent;

function fnWrapper(element, fn) {
  return fn.__mouseWheelWrapper = function (event) {
    event = event || window.event;

    if (isW3cEvent) {
      event.preventDefault();
    }

    if (isIEEvent) {
      event.returnValue = false;
    }

    if (eventName == 'DOMMouseScroll' || eventName == 'mousewheel') {
      event.delta = event.wheelDelta ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
    }

    fn.call(element, event);
  };
}

function addMouseWheel(element, fn) {
  var __mouseWheelWrapper = fnWrapper(element, fn);

  if (isW3cEvent) {
    element.addEventListener(eventName, __mouseWheelWrapper, false);
  } else if (isIEEvent) {
    var _element = element;

    _element.attachEvent('on' + eventName, __mouseWheelWrapper);
  }
}

function removeMouseWheel(element, fn) {
  if (isW3cEvent) {
    element.removeEventListener(eventName, fn.__mouseWheelWrapper, false);
  } else if (isIEEvent) {
    var _element = element;

    _element.detachEvent('on' + eventName, fn.__mouseWheelWrapper);
  }

  delete fn.__mouseWheelWrapper;
}