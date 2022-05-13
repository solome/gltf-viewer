import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Subscribe } from './Subscribe';
/**
 * Canvas 画板的宽高。
 */
export interface GLTFViewerSize {
    width?: number;
    height?: number;
}
/**
 * 配置项：可以对光照、背景色等进行自定义配置。
 */
export interface GLTFViewerConfig {
    /**
     * 开启抗锯齿。
     */
    antialias?: boolean;
    /**
     * 背景色值。
     */
    backgroundColor?: THREE.Color;
    /**
     * 背景 `HDR` 配置。
     */
    backgroundHDR?: string;
    pixelRatio?: number;
    /**
     * 初始化状态。
     */
    initial?: Partial<GLTFViewerState>;
    /**
     * 点光源实例，如果设置 `false` 则关闭点光源。
     */
    pointLight?: THREE.PointLight | false;
    /**
     * 平行光实例，如果设置 `false` 则关闭平行光。
     */
    directionalLight?: THREE.DirectionalLight | false;
    /**
     * 环境光实例，如果设置 `false` 则关闭环境光。
     */
    ambientLight?: THREE.AmbientLight | false;
    /**
     * 是否开启 [深度缓冲](https://zh.wikipedia.org/wiki/%E6%B7%B1%E5%BA%A6%E7%BC%93%E5%86%B2) 来规避某些闪烁问题。
     */
    logarithmicDepthBuffer?: boolean;
    /**
     * 最小 `fov`，即能放大到多大。区间 `[1, 120]`。
     */
    minFov?: number;
    /**
     * 最大 `fov`，即能缩小到多小。区间 `[1, 120]`。
     */
    maxFov?: number;
    /**
     * `ToneMapping` 相关参数配置。
     */
    toneMapping?: {
        toneMapping?: THREE.ToneMapping;
        toneMappingExposure?: number;
    };
}
/**
 * 三维模型状态抽象
 */
export interface GLTFViewerState {
    /**
     * `fov`
     */
    fov: number;
    /**
     *
     */
    longitude: number;
    /**
     *
     */
    latitude: number;
}
/**
 * 异步事件。
 */
export declare type GLTFViewerEventMap = {
    /**
     * 状态发生变更。
     * @param state 最新状态
     */
    'stateChange'(state: GLTFViewerState): void;
    /**
     * 加载进度。
     * @param progressing 区间 `[0, 100]` 非连续值，视网络、计算效率来决定。
     */
    'progressing'(progressing: number): void;
    /**
     * 即将开始加载。
     */
    'willLoad'(): void;
    /**
     * 载入完成。
     * @param gltf `glTF` 模型实例。
     * @param scene `THREE.Scene` 实例。
     * @param renderer `THREE.WebGLRenderer` 实例。
     */
    'loaded'(gltf: GLTF, scene: THREE.Scene, renderer: THREE.WebGLRenderer): void;
    /**
     * 加载异常。
     * @param error 异常信息。
     */
    'loadError'(error: ErrorEvent): void;
};
export declare class GLTFViewer extends Subscribe<GLTFViewerEventMap> {
    uuid: string;
    constructor(config: GLTFViewerConfig);
    get state(): {
        fov?: number;
        latitude?: number;
        longitude?: number;
    };
    set state({ fov, latitude, longitude }: {
        fov?: number;
        latitude?: number;
        longitude?: number;
    });
    set minFov(fov: number);
    get minFov(): number;
    set maxFov(fov: number);
    get maxFov(): number;
    /**
     *
     * @param url glTF 模型CDN地址
     * @param options adaptive 是否开启自适应fov
     */
    load(url: string): void;
    /**
     * 挂载
     * @param container
     * @param size
     */
    appendTo(container: HTMLDivElement, size?: GLTFViewerSize): void;
    /**
     * 刷新：如果传递宽高则以该宽高重新绘制；否则，以父容器的宽高重新绘制。
     * @param size
     */
    refresh(size?: GLTFViewerSize): void;
    /**
     * 销毁
     */
    dispose(): void;
    /**
     * 响应式fov
     */
    fitFov(): void;
}
