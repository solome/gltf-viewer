
[![npm version](https://img.shields.io/npm/v/@juyipeng/gltf-viewer.svg?style=flat-square&logo=npm&label=npm%20install%20@juyipeng/gltf-viewer)](https://www.npmjs.com/package/@juyipeng/gltf-viewer)

> 预览 [`glTF`](https://en.wikipedia.org/wiki/GlTF) 模型文件（支持 `.gltf` 和 `.glb` 格式），并附带模型的状态抽象及管理。

效果示例：[Astronaut](https://solome.js.org/gltf-viewer/examples/)。

## Usage

### 安装

由于 `@juyipeng/gltf-viewer` 依赖 [THREE](https://github.com/mrdoob/three.js/) ，需同时安装：

```bash
$ npm install @juyipeng/gltf-viewer three --save
# or
$ yarn add @juyipeng/gltf-viewer three
```

### 基础用法

```ts
import { GLTFViewer } from '@juyipeng/gltf-viewer'

// 创建实例
const glTFViewer = new GLTFViewer({
  pixelRatio: 1,
  antialias: true,
})

// 挂载至 DOM 节点
glTFViewer.appendTo(ref.current)

// 加载模型文件
await glTFViewer.load(glbCDNUrl)

// 输出当前模型状态数据
console.log(glTFViewer.state)
// { longitude: 0, latitude: -0.3, fov: 35 }

// 设置当前模型状态：直接给状态对象赋值（立即生效）
glTFViewer.state = { longitude: 0, latitude: -0.3, fov: 35 }

// 设置当前模型状态：直接给状态对象单个属性赋值（立即生效）
glTFViewer.state.fov = 50
```

## 状态抽象

`gltf-viewer` 是基于 [Three.js](https://threejs.org/) 实现的，其三维建模体系与 [Three.js](https://threejs.org/) 完全一致，均有场景、渲染器、相机等概念。

其中 `glTF` 模型的缩放、移动、旋转等交互并没有实时地修改模型在三维空间中的位置信息——我们是通过调整相机的位置信息来实现的。

`gltf-viewer` 中的摄像机使用 **透视相机**（[PerspectiveCamera](https://threejs.org/docs/index.html?q=PerspectiveCamera#api/zh/cameras/PerspectiveCamera)）来进行投影。这一投影模式被用来模拟人眼所看到的景象，它是三维场景的渲染中使用得最普遍的投影模式。


<figure style="display: flex;flex-direction: column;justify-content: center;align-items: center;">
  <div style="display: flex;background: white;justify-content: center;align-items: center;">
    <div style="flex: 3">
      <img style="width: 100%" src="https://vrlab-public.ljcdn.com/common/file/web/2ee6d4e3-081b-4933-9117-1e14bdf77617.png" /></div>
    <div style="flex: 2"><img style="width: 100%" src="https://vrlab-public.ljcdn.com/common/file/web/2f331826-4b15-4da5-9603-50c1287b38f7.svg
" /></div>
  </div>
  <figcaption>图一：透视相机和右手笛卡尔坐标系</figcaption>
</figure>

### `longitude` & `latitude`

**透视相机** 的概念复杂、参数多，如上图一（左）所示——如果直接通过修改这些参数并不方面理解。

`gltf-viewer`  使用类似 **经纬度** 的方式描述相机位置，即相机的水平角 `longitude` 和 相机的偏航角 `latitude`，且单位为 **弧度**。

比如，我们将整个模型场景为一个右手笛卡尔坐标系, `XZ` 平米平行于地面， `Y` 轴垂直于地面，如图一（右）。
初始相机方向为原点看向 **Z 轴负方向**，可以通过调整经纬度值来影响相机信息：

- 增加 `longitude`：相机向左旋转。
- 减少 `longitude`：相机向右旋转。
- 增加 `latitude`：相机向下旋转。
- 减少 `latitude`：相机向上旋转。

### `fov`

相机垂直方向的 **可视角度**，即如图一（左）中 `fovy` 值。直观的效果是增加 `fov` 值显示的模型越小，减少 `fov` 值显示的模型越大。


## 事件监听

```ts
glTFViewer.on('stateChange', (state: GLTFViewerState) => {
 // 事件：模型状态变化
})
glTFViewer.on('willLoad', () => {
 // 即将加载
})
glTFViewer.on('progressing', (progressing: number) => {
 // 加载进度
})
glTFViewer.on('loaded', (gltf: GLTF) => {
 // 加载完成
})
glTFViewer.on('loadError', (error) => {
 // 加载异常
})
```


## 动画

`@juyipeng/gltf-viewer` 默认不提供动画实现，但是你可以配合 [tween.js](https://github.com/tweenjs/tween.js/) 等第三方 **动画库** 通过修改 `state` 来得到你想要的动画效果，比如：

```ts
import TWEEN from '@tweenjs/tween.js'

function animate(time: number) {
  requestAnimationFrame(animate)
  TWEEN.update(time)
}

requestAnimationFrame(animate)

const tween = new TWEEN.Tween({ fov: 35, longitude: 0, latitude: -0.3 })
  .to({fov: 60, latitude: -1.1496852156837822, longitude: 2.4468501085409855 }, 2000 )
  .easing(TWEEN.Easing.Quadratic.Out)
  .onUpdate((newState) => glTFViewer.state = newState)
  .start()
```

## 光照配置

```ts
pointLight?: THREE.PointLight | false // 点光源
directionalLight?: THREE.DirectionalLight | false // 平行光
ambientLight?: THREE.AmbientLight | false // 环境光
// 色调映射：模拟、逼近高动态范围（HDR）效果
toneMapping?: {
  toneMapping?: THREE.ToneMapping
  toneMappingExposure?: number
}
```

## 更多自定义

你可以监听模型加载完 loaded 事件，回调函数会提供 scene、renderer 实例，可以进行更多自定义设置：

```ts
glTFViewer.once('loaded', (gltf, scene, renderer) => {
  // 获取 renderer 实例，进行相关配置
  renderer.localClippingEnabled = true
  // 刷新：重新渲染
  glTFViewer.refresh()
})
```

## API

> [solome.js.org/gltf-viewer](https://solome.js.org/gltf-viewer)。