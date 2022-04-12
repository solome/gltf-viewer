import { requestAnimationFrame } from './requestAnimationFrame'

const cache = {
  duration: 0
}

export function getFrameTime(callback: (duration: number) => void) {
  if (cache.duration) callback(cache.duration)
  const start = Date.now()
  requestAnimationFrame(() => {
    callback(cache.duration = Date.now() - start)
  })
}

getFrameTime(() => { })