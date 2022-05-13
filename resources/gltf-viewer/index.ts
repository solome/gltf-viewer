import * as THREE from 'three'
import Hammer from 'hammerjs'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import uuid from './uuid'
import { Subscribe } from './Subscribe'
import { formatRad } from './formatRad'
import { getFrameTime } from './getFrameTime'
import { coordsToDirection } from './coordsToDirection'
import { coordsMoveByOffset } from './coordsMoveByOffset'
import { addMouseWheel, removeMouseWheel } from './mouseWheel'
import { requestAnimationFrameInterval } from './requestAnimationFrameInterval'


const defaultPos = { longitude: 0, latitude: 0, fov: 0 }

const ERROR_NO_CONTROLLER = 'GLTFViewer 实例丢失'

/**
 * Canvas 画板的宽高。
 */
export interface GLTFViewerSize {
  width?: number
  height?: number
}

const loader = new GLTFLoader()

/**
 * 配置项：可以对光照、背景色等进行自定义配置。
 */
export interface GLTFViewerConfig {
  /**
   * 开启抗锯齿。
   */
  antialias?: boolean
  /**
   * 背景色值。
   */
  backgroundColor?: THREE.Color
  /**
   * 背景 `HDR` 配置。
   */
  backgroundHDR?: string
  pixelRatio?: number
  /**
   * 初始化状态。
   */
  initial?: Partial<GLTFViewerState>
  /**
   * 点光源实例，如果设置 `false` 则关闭点光源。
   */
  pointLight?: THREE.PointLight | false
  /**
   * 平行光实例，如果设置 `false` 则关闭平行光。
   */
  directionalLight?: THREE.DirectionalLight | false
  /**
   * 环境光实例，如果设置 `false` 则关闭环境光。
   */
  ambientLight?: THREE.AmbientLight | false
  /**
   * 是否开启 [深度缓冲](https://zh.wikipedia.org/wiki/%E6%B7%B1%E5%BA%A6%E7%BC%93%E5%86%B2) 来规避某些闪烁问题。
   */
  logarithmicDepthBuffer?: boolean
  /**
   * 最小 `fov`，即能放大到多大。区间 `[1, 120]`。
   */
  minFov?: number
  /**
   * 最大 `fov`，即能缩小到多小。区间 `[1, 120]`。
   */
  maxFov?: number
  /**
   * `ToneMapping` 相关参数配置。
   */
  toneMapping?: {
    toneMapping?: THREE.ToneMapping
    toneMappingExposure?: number
  }
}

/**
 * 三维模型状态抽象
 */
export interface GLTFViewerState {
  /**
   * `fov` 
   */
  fov: number
  /**
   * 
   */
  longitude: number
  /**
   * 
   */
  latitude: number
}

interface ControllerCallbacks {
  stateChange: (state: GLTFViewerState) => void
  progressing: (progressing: number) => void
  willLoad: () => void
  loaded: (gltf: GLTF, scene: THREE.Scene, renderer: THREE.WebGLRenderer) => void
  loadError: (error: ErrorEvent) => void
}

class Controller {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  fov = 0
  longitude = 0
  latitude = 0
  pointLight?: THREE.PointLight
  directionLight?: THREE.DirectionalLight
  ambientLight?: THREE.AmbientLight

  needsRender = false
  private __interiaMovement: boolean
  private __lastPanPoint?: {
    pointerLength: number
    x: number
    y: number
  }
  target?: GLTF
  private __pinchCurrentFov?: number
  dispose?: () => void
  callbacks: ControllerCallbacks
  config: GLTFViewerConfig

  get minFov() {
    return this.config.minFov || 1
  }

  get maxFov() {
    return this.config.maxFov || 120
  }

  constructor(config: GLTFViewerConfig, callbacks: ControllerCallbacks) {
    this.config = Object.assign({ maxFov: 120, minFov: 1, logarithmicDepthBuffer: true }, config)
    // 异步事件回调
    this.callbacks = callbacks

    // 默认状态参数
    const initial: Partial<GLTFViewerState> = config.initial || {}
    if (initial.fov !== undefined) {
      this.fov = initial.fov
    }
    if (initial.latitude !== undefined) {
      this.latitude = initial.latitude
    }
    if (initial.longitude !== undefined) {
      this.longitude = initial.longitude
    }

    // 场景
    this.scene = new THREE.Scene()

    // 背景色值
    if (config.backgroundColor) {
      this.scene.background = config.backgroundColor
    }

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: config.antialias,
      alpha: true,
      logarithmicDepthBuffer: config.logarithmicDepthBuffer,
    })
    this.renderer.outputEncoding = THREE.sRGBEncoding

    if (config.toneMapping) {
      const { toneMapping, toneMappingExposure } = config.toneMapping
      if (toneMapping) this.renderer.toneMapping = toneMapping
      if (toneMappingExposure !== undefined) this.renderer.toneMappingExposure = toneMappingExposure
    }

    if (config.backgroundColor) {
      this.renderer.setClearColor(config.backgroundColor, 0)
    }

    // 像素比
    if (config.pixelRatio) {
      this.renderer.setPixelRatio(config.pixelRatio)
    }

    // 相机
    this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1500)

    // 光照
    if (config.pointLight !== false) {
      this.pointLight = config.pointLight || new THREE.PointLight(0xfffffff, 1, 1500)
      this.scene.add(this.pointLight)
    }
    if (config.directionalLight !== false) {
      this.directionLight = config.directionalLight || new THREE.DirectionalLight(0xfffffff, 0.1)
      this.directionLight.position.setY(-1)
      this.scene.add(this.directionLight)
    }

    if (config.ambientLight !== false) {
      this.ambientLight = config.ambientLight || new THREE.AmbientLight(0xfffffff)
      this.scene.add(this.ambientLight)
    }

    // 背景 HDR
    if (config.backgroundHDR) {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
      const rgbLoader = new RGBELoader()
      rgbLoader.setDataType(THREE.UnsignedByteType)
      rgbLoader.load(config.backgroundHDR, (hdrEquirect) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect)
        this.scene.environment = hdrCubeRenderTarget.texture
        if (config.backgroundColor) {
          this.scene.background = hdrCubeRenderTarget.texture
        }
        hdrEquirect.dispose()
        pmremGenerator.dispose()
        this.needsRender = true
      })
      pmremGenerator.compileEquirectangularShader()
    }

    this.__interiaMovement = false
    const hammerManager = new Hammer.Manager(this.element)
    hammerManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }))
    hammerManager.add(new Hammer.Pinch({ threshold: 0, pointers: 2 }).recognizeWith(hammerManager.get('pan')))

    hammerManager.on('panstart pan', this.__onPanGesture.bind(this))
    hammerManager.on('pinchstart pinch pinchend', this.__onPinchGesture.bind(this))

    const __onMouseWheel = this.__onMouseWheel.bind(this)
    addMouseWheel(this.element, __onMouseWheel)

    this.dispose = () => {
      hammerManager.destroy()
      removeMouseWheel(this.element, __onMouseWheel)
      this.clear()
      this.renderer.dispose()
    }
    this.needsRender = true
    this.play()
  }

  pause() {
    // nothing todo
  }

  clear() {
    if (this.target) {
      this.scene.remove(this.target.scene)
      this.update(defaultPos)
      this.target = undefined
    }
  }

  play() {
    this.pause()
    const _render = () => {
      if (this.needsRender !== false) this.render()
      this.needsRender = false
    }
    this.pause = requestAnimationFrameInterval(_render)
    _render()
  }

  setTarget(object: GLTF) {
    if (this.target) {
      this.scene.remove(this.target.scene)
    }
    this.target = object
    this.target.scene.visible = false
    this.scene.add(this.target.scene)

    setTimeout(() => {
      if (object === this.target) {
        this.target.scene.visible = true
        this.update({})
        this.callbacks.loaded(object, this.scene, this.renderer)
      }
    }, 50)
  }

  get element() {
    return this.renderer.domElement
  }

  appendTo(container: HTMLDivElement, size?: GLTFViewerSize) {
    container.appendChild(this.element)
    this.refresh(size)
    const positionType = window.getComputedStyle(container).position
    if (
      positionType !== 'relative' &&
      positionType !== 'absolute' &&
      positionType !== 'fixed' &&
      positionType !== 'sticky'
    ) {
      container.style.position = 'relative'
    }
  }

  refresh(size: GLTFViewerSize = {}) {
    const element = this.element
    const container = element.parentElement

    if (!container) return
    if (container && container.tagName && container.nodeName) {
      const { width = container.offsetWidth, height = container.offsetHeight } = size

      this.renderer.setSize(width, height)

      // 修改摄像机 aspect 比值
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }
    this.needsRender = true
  }

  update(state: Partial<GLTFViewerState>) {
    let fov = this.fov
    let longitude = this.longitude
    let latitude = this.latitude

    if (state.fov !== undefined) {
      fov = state.fov
    }
    if (state.longitude !== undefined) {
      longitude = state.longitude
    }
    if (state.latitude !== undefined) {
      latitude = state.latitude
    }

    if (!this.target || !this.target.scene) return

    const boxHelper = new THREE.BoxHelper(this.target.scene, 0x2bb8aa)
    const { center, radius } = boxHelper.geometry.boundingSphere || {}
    if (!center || !radius) return

    const box = new THREE.Box3()
    box.expandByObject(this.target.scene)
    box.getCenter(center)

    longitude = formatRad(longitude)
    latitude = Math.max(-Math.PI / 2 + 0.01, Math.min(+Math.PI / 2, latitude))

    // 距离
    const distance = (radius / Math.sin(Math.PI / 4)) * 3

    {
      // debug
      // const geometry = new THREE.SphereGeometry(radius, 32, 16)
      // const material = new THREE.MeshBasicMaterial({ color: 0x0000aa, wireframe: true })
      // const sphere = new THREE.Mesh(geometry, material)
      // sphere.position.copy(center.clone())
      // this.scene.add(sphere)
    }

    // 朝向
    const direction = coordsToDirection({ longitude, latitude })
    direction.setLength(distance)
    this.camera.position.copy(center.clone().add(direction))
    this.camera.lookAt(center)

    if (this.pointLight) {
      const lightDirection = coordsToDirection({ longitude, latitude: -Math.PI / 6 })
      lightDirection.setLength(distance * 3)
      this.pointLight.position.copy(center.clone().add(lightDirection))
    }

    const calcFov = (distance: number, width: number, r: number) => {
      const vertical = r < 1 ? width / r : width
      const fov = Math.atan(vertical / distance / 2) * 2 * (180 / Math.PI)
      return fov
    }

    const d = this.camera.position.distanceTo(center)
    if (fov === 0) {
      fov = calcFov(d, radius * 2, this.renderer.domElement.offsetWidth / this.renderer.domElement.offsetHeight)
    }
    fov = Math.max(this.minFov, Math.min(this.maxFov, fov))
    if (fov !== this.fov) {
      this.camera.fov = fov
      this.camera.updateProjectionMatrix()
    }

    const needsRender = this.fov !== fov || this.longitude !== longitude || this.latitude !== latitude
    Object.assign(this, { longitude, latitude, fov })
    this.needsRender = true
    if (needsRender) {
      this.callbacks.stateChange({ longitude, latitude, fov })
    }
  }

  __onPanGesture(event: HammerInput) {
    this.__interiaMovement = false
    const { longitude, latitude } = this
    const { center, isFinal, velocityX, velocityY, pointers } = event

    const offset = (() => {
      if (!(this.__lastPanPoint && this.__lastPanPoint.pointerLength === pointers.length)) {
        return { x: 0, y: 0 }
      }
      return {
        x: center.x - this.__lastPanPoint.x,
        y: center.y - this.__lastPanPoint.y,
      }
    })()

    if (!isFinal) {
      const layout = {
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
      }
      this.update(coordsMoveByOffset({ longitude, latitude }, offset, layout))
      this.__lastPanPoint = {
        pointerLength: pointers.length,
        x: center.x,
        y: center.y,
      }
    } else {
      delete this.__lastPanPoint
      getFrameTime((frameTime) => {
        this.__interiaMovement = true
        let x = velocityX * frameTime
        let y = velocityY * frameTime
        const distance = Math.sqrt(x * x + y * y)
        if (distance > 100) {
          x = (x / distance) * 100
          y = (y / distance) * 100
        }
        // 滑动小于上下15度, 忽略 y 值
        if (Math.abs(y / x) < Math.tan((20 / 180) * Math.PI)) y = 0
        this.__requestInteriaMovement({ x, y })
      })
    }
  }

  __onPinchGesture(event: HammerInput) {
    this.__interiaMovement = false

    const { scale, type } = event

    if (type === 'pinchstart') {
      this.__pinchCurrentFov = this.fov
      return
    }
    if (type === 'pinchend') {
      this.__pinchCurrentFov = undefined
      return
    }

    const fov = this.__pinchCurrentFov ? this.__pinchCurrentFov / scale : 1
    this.update({ fov })
  }

  __requestInteriaMovement(offset: { x: number; y: number }) {
    if (this.__interiaMovement === false) return
    const { x, y } = offset
    const { longitude, latitude } = this
    const friction = 0.9
    const layout = {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    }
    this.update(coordsMoveByOffset({ longitude, latitude }, { x, y }, layout))

    const notFinal = Math.abs(x) > 1 || Math.abs(y) > 1

    if (notFinal) {
      requestAnimationFrame(() =>
        this.__requestInteriaMovement({
          x: x * friction,
          y: y * friction * 0.7,
        }),
      )
    } else {
      this.__interiaMovement = false
    }
  }

  __onMouseWheel(event: any) {
    this.__interiaMovement = false
    const fov = this.fov - event.delta
    this.update({ fov: fov <= 1 ? 1 : fov })
  }

  load(url: string) {
    return new Promise((resolve, reject) => {
      this.callbacks.willLoad()
      loader.load(
        url,
        (gltf) => {
          this.setTarget(gltf)
          resolve(true)
        },
        (xhr) => {
          this.callbacks.progressing((xhr.loaded / xhr.total) * 100)
        },
        (error) => {
          this.callbacks.loadError(error)
          reject(error)
        },
      )
    })
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}

const caches: Record<string, Controller> = {}

/**
 * 异步事件。
 */
export type GLTFViewerEventMap = {
  /**
   * 状态发生变更。
   * @param state 最新状态
   */
  'stateChange'(state: GLTFViewerState): void
  /**
   * 加载进度。
   * @param progressing 区间 `[0, 100]` 非连续值，视网络、计算效率来决定。
   */
  'progressing'(progressing: number): void
  /**
   * 即将开始加载。
   */
  'willLoad'(): void
  /**
   * 载入完成。
   * @param gltf `glTF` 模型实例。
   * @param scene `THREE.Scene` 实例。
   * @param renderer `THREE.WebGLRenderer` 实例。
   */
  'loaded'(gltf: GLTF, scene: THREE.Scene, renderer: THREE.WebGLRenderer): void
  /**
   * 加载异常。
   * @param error 异常信息。
   */
  'loadError'(error: ErrorEvent): void
}

export class GLTFViewer extends Subscribe<GLTFViewerEventMap> {
  uuid = uuid()

  constructor(config: GLTFViewerConfig) {
    super()

    const controller = new Controller(config, {
      stateChange: (state: GLTFViewerState) => this.emit('stateChange', state),
      progressing: (progressing: number) => this.emit('progressing', progressing),
      willLoad: () => this.emit('willLoad'),
      loaded: (gltf: GLTF, scene: THREE.Scene, renderer: THREE.WebGLRenderer) =>
        this.emit('loaded', gltf, scene, renderer),
      loadError: (error: ErrorEvent) => this.emit('loadError', error),
    })

    Object.assign(window, { $controller: controller })
    caches[this.uuid] = controller
  }

  get state() {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)

    const proxy = new Proxy<GLTFViewerState>(
      {
        fov: controller.fov,
        latitude: controller.latitude,
        longitude: controller.longitude,
      },
      {
        set: function (obj, prop: keyof GLTFViewerState, value) {
          if (prop === 'fov') {
            if (isNaN(Number(value))) {
              throw new TypeError('The fov is not an number')
            }
            if (value > controller.maxFov || value < controller.minFov) {
              throw new RangeError(`The fov seems invalid~ fov: [${controller.minFov}, ${controller.maxFov}]`)
            }
          }

          controller.update({ [prop]: value })

          return true
        },
        get: function (obj, prop: keyof GLTFViewerState) {
          return controller[prop]
        },
      },
    )

    return proxy
  }

  set state({ fov, latitude, longitude }: { fov?: number; latitude?: number; longitude?: number }) {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)

    controller.update({
      fov: fov === undefined ? controller.fov : fov,
      latitude: latitude === undefined ? controller.latitude : latitude,
      longitude: longitude === undefined ? controller.longitude : longitude,
    })
  }

  set minFov(fov: number) {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    controller.config.minFov = fov
    controller.update({})
  }

  get minFov() {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    return controller.minFov
  }

  set maxFov(fov: number) {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    controller.config.maxFov = fov
    controller.update({})
  }

  get maxFov() {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    return controller.maxFov
  }

  /**
   *
   * @param url glTF 模型CDN地址
   * @param options adaptive 是否开启自适应fov
   */
  load(url: string) {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)

    controller.load(url)
  }

  /**
   * 挂载
   * @param container
   * @param size
   */
  appendTo(container: HTMLDivElement, size?: GLTFViewerSize) {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)

    controller.appendTo(container, size)
  }

  /**
   * 刷新：如果传递宽高则以该宽高重新绘制；否则，以父容器的宽高重新绘制。
   * @param size
   */
  refresh(size?: GLTFViewerSize) {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    controller.refresh(size)
  }

  /**
   * 销毁
   */
  dispose() {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    if (controller.dispose) controller.dispose()
    delete caches[this.uuid]
  }

  /**
   * 响应式fov
   */
  fitFov() {
    const controller = caches[this.uuid]
    if (!controller) throw new Error(ERROR_NO_CONTROLLER)
    controller.update({ fov: 0 })
  }
}
