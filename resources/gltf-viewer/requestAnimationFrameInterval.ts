import { requestAnimationFrame } from './requestAnimationFrame'

export function requestAnimationFrameInterval(fn: any, context?: any, args: any[] = []) {

  let stoped = false
  let loop: any = (time: any) => {
    if (fn) fn.call(context, time, ...args)
    if (!stoped && loop) requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  return () => { loop = null, stoped = true }
}

