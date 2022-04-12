// 兼容 滚轮事件

const _document = document as any
const _window = window as any

const eventName = _document.mozFullScreen ? 'DOMMouseScroll' : 'mousewheel'
const isW3cEvent = !!window.addEventListener
const isIEEvent = !!_window.attachEvent

function fnWrapper(element: Element, fn: any) {
  return (fn.__mouseWheelWrapper = (event: any) => {
    event = event || window.event

    if (isW3cEvent) {
      event.preventDefault()
    }
    if (isIEEvent) {
      event.returnValue = false
    }

    if (eventName == 'DOMMouseScroll' || eventName == 'mousewheel') {
      event.delta = event.wheelDelta ? event.wheelDelta / 120 : -(event.detail || 0) / 3
    }
    fn.call(element, event)
  })
}

export function addMouseWheel(element: Element, fn: any) {
  const __mouseWheelWrapper = fnWrapper(element, fn)
  if (isW3cEvent) {
    element.addEventListener(eventName, __mouseWheelWrapper, false)
  } else if (isIEEvent) {
    const _element = element as any
    _element.attachEvent('on' + eventName, __mouseWheelWrapper)
  }
}

export function removeMouseWheel(element: Element, fn: any) {
  if (isW3cEvent) {
    element.removeEventListener(eventName, fn.__mouseWheelWrapper, false)
  } else if (isIEEvent) {
    const _element = element as any
    _element.detachEvent('on' + eventName, fn.__mouseWheelWrapper)
  }
  delete fn.__mouseWheelWrapper
}
