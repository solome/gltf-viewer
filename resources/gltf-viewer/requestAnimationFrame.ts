const _window = window as any

export const requestAnimationFrame = window.requestAnimationFrame ||
  _window.mozRequestAnimationFrame ||
  _window.webkitRequestAnimationFrame ||
  _window.msRequestAnimationFrame ||
  (fn => setTimeout(fn, 16))
