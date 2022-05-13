"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLTFViewer = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _hammerjs = _interopRequireDefault(require("hammerjs"));

var _RGBELoader = require("three/examples/jsm/loaders/RGBELoader");

var _GLTFLoader = require("three/examples/jsm/loaders/GLTFLoader");

var _uuid = _interopRequireDefault(require("./uuid"));

var _Subscribe2 = require("./Subscribe");

var _formatRad = require("./formatRad");

var _getFrameTime = require("./getFrameTime");

var _coordsToDirection = require("./coordsToDirection");

var _coordsMoveByOffset = require("./coordsMoveByOffset");

var _mouseWheel = require("./mouseWheel");

var _requestAnimationFrameInterval = require("./requestAnimationFrameInterval");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultPos = {
  longitude: 0,
  latitude: 0,
  fov: 0
};
var ERROR_NO_CONTROLLER = 'GLTFViewer 实例丢失';
/**
 * Canvas 画板的宽高。
 */

var loader = new _GLTFLoader.GLTFLoader();
/**
 * 配置项：可以对光照、背景色等进行自定义配置。
 */

var Controller = /*#__PURE__*/function () {
  function Controller(config, callbacks) {
    var _this = this;

    _classCallCheck(this, Controller);

    _defineProperty(this, "fov", 0);

    _defineProperty(this, "longitude", 0);

    _defineProperty(this, "latitude", 0);

    _defineProperty(this, "needsRender", false);

    this.config = Object.assign({
      maxFov: 120,
      minFov: 1,
      logarithmicDepthBuffer: true
    }, config); // 异步事件回调

    this.callbacks = callbacks; // 默认状态参数

    var initial = config.initial || {};

    if (initial.fov !== undefined) {
      this.fov = initial.fov;
    }

    if (initial.latitude !== undefined) {
      this.latitude = initial.latitude;
    }

    if (initial.longitude !== undefined) {
      this.longitude = initial.longitude;
    } // 场景


    this.scene = new THREE.Scene(); // 背景色值

    if (config.backgroundColor) {
      this.scene.background = config.backgroundColor;
    } // 渲染器


    this.renderer = new THREE.WebGLRenderer({
      antialias: config.antialias,
      alpha: true,
      logarithmicDepthBuffer: config.logarithmicDepthBuffer
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    if (config.toneMapping) {
      var _config$toneMapping = config.toneMapping,
          toneMapping = _config$toneMapping.toneMapping,
          toneMappingExposure = _config$toneMapping.toneMappingExposure;
      if (toneMapping) this.renderer.toneMapping = toneMapping;
      if (toneMappingExposure !== undefined) this.renderer.toneMappingExposure = toneMappingExposure;
    }

    if (config.backgroundColor) {
      this.renderer.setClearColor(config.backgroundColor, 0);
    } // 像素比


    if (config.pixelRatio) {
      this.renderer.setPixelRatio(config.pixelRatio);
    } // 相机


    this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1500); // 光照

    if (config.pointLight !== false) {
      this.pointLight = config.pointLight || new THREE.PointLight(0xfffffff, 1, 1500);
      this.scene.add(this.pointLight);
    }

    if (config.directionalLight !== false) {
      this.directionLight = config.directionalLight || new THREE.DirectionalLight(0xfffffff, 0.1);
      this.directionLight.position.setY(-1);
      this.scene.add(this.directionLight);
    }

    if (config.ambientLight !== false) {
      this.ambientLight = config.ambientLight || new THREE.AmbientLight(0xfffffff);
      this.scene.add(this.ambientLight);
    } // 背景 HDR


    if (config.backgroundHDR) {
      var pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      var rgbLoader = new _RGBELoader.RGBELoader();
      rgbLoader.setDataType(THREE.UnsignedByteType);
      rgbLoader.load(config.backgroundHDR, function (hdrEquirect) {
        var hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect);
        _this.scene.environment = hdrCubeRenderTarget.texture;

        if (config.backgroundColor) {
          _this.scene.background = hdrCubeRenderTarget.texture;
        }

        hdrEquirect.dispose();
        pmremGenerator.dispose();
        _this.needsRender = true;
      });
      pmremGenerator.compileEquirectangularShader();
    }

    this.__interiaMovement = false;
    var hammerManager = new _hammerjs["default"].Manager(this.element);
    hammerManager.add(new _hammerjs["default"].Pan({
      threshold: 0,
      pointers: 0
    }));
    hammerManager.add(new _hammerjs["default"].Pinch({
      threshold: 0,
      pointers: 2
    }).recognizeWith(hammerManager.get('pan')));
    hammerManager.on('panstart pan', this.__onPanGesture.bind(this));
    hammerManager.on('pinchstart pinch pinchend', this.__onPinchGesture.bind(this));

    var __onMouseWheel = this.__onMouseWheel.bind(this);

    (0, _mouseWheel.addMouseWheel)(this.element, __onMouseWheel);

    this.dispose = function () {
      hammerManager.destroy();
      (0, _mouseWheel.removeMouseWheel)(_this.element, __onMouseWheel);

      _this.clear();

      _this.renderer.dispose();
    };

    this.needsRender = true;
    this.play();
  }

  _createClass(Controller, [{
    key: "minFov",
    get: function get() {
      return this.config.minFov || 1;
    }
  }, {
    key: "maxFov",
    get: function get() {
      return this.config.maxFov || 120;
    }
  }, {
    key: "pause",
    value: function pause() {// nothing todo
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.target) {
        this.scene.remove(this.target.scene);
        this.update(defaultPos);
        this.target = undefined;
      }
    }
  }, {
    key: "play",
    value: function play() {
      var _this2 = this;

      this.pause();

      var _render = function _render() {
        if (_this2.needsRender !== false) _this2.render();
        _this2.needsRender = false;
      };

      this.pause = (0, _requestAnimationFrameInterval.requestAnimationFrameInterval)(_render);

      _render();
    }
  }, {
    key: "setTarget",
    value: function setTarget(object) {
      var _this3 = this;

      if (this.target) {
        this.scene.remove(this.target.scene);
      }

      this.target = object;
      this.target.scene.visible = false;
      this.scene.add(this.target.scene);
      setTimeout(function () {
        if (object === _this3.target) {
          _this3.target.scene.visible = true;

          _this3.update({});

          _this3.callbacks.loaded(object, _this3.scene, _this3.renderer);
        }
      }, 50);
    }
  }, {
    key: "element",
    get: function get() {
      return this.renderer.domElement;
    }
  }, {
    key: "appendTo",
    value: function appendTo(container, size) {
      container.appendChild(this.element);
      this.refresh(size);
      var positionType = window.getComputedStyle(container).position;

      if (positionType !== 'relative' && positionType !== 'absolute' && positionType !== 'fixed' && positionType !== 'sticky') {
        container.style.position = 'relative';
      }
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var element = this.element;
      var container = element.parentElement;
      if (!container) return;

      if (container && container.tagName && container.nodeName) {
        var _size$width = size.width,
            width = _size$width === void 0 ? container.offsetWidth : _size$width,
            _size$height = size.height,
            height = _size$height === void 0 ? container.offsetHeight : _size$height;
        this.renderer.setSize(width, height); // 修改摄像机 aspect 比值

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }

      this.needsRender = true;
    }
  }, {
    key: "update",
    value: function update(state) {
      var fov = this.fov;
      var longitude = this.longitude;
      var latitude = this.latitude;

      if (state.fov !== undefined) {
        fov = state.fov;
      }

      if (state.longitude !== undefined) {
        longitude = state.longitude;
      }

      if (state.latitude !== undefined) {
        latitude = state.latitude;
      }

      if (!this.target || !this.target.scene) return;
      var boxHelper = new THREE.BoxHelper(this.target.scene, 0x2bb8aa);

      var _ref = boxHelper.geometry.boundingSphere || {},
          center = _ref.center,
          radius = _ref.radius;

      if (!center || !radius) return;
      var box = new THREE.Box3();
      box.expandByObject(this.target.scene);
      box.getCenter(center);
      longitude = (0, _formatRad.formatRad)(longitude);
      latitude = Math.max(-Math.PI / 2 + 0.01, Math.min(+Math.PI / 2, latitude)); // 距离

      var distance = radius / Math.sin(Math.PI / 4) * 3;
      {// debug
        // const geometry = new THREE.SphereGeometry(radius, 32, 16)
        // const material = new THREE.MeshBasicMaterial({ color: 0x0000aa, wireframe: true })
        // const sphere = new THREE.Mesh(geometry, material)
        // sphere.position.copy(center.clone())
        // this.scene.add(sphere)
      } // 朝向

      var direction = (0, _coordsToDirection.coordsToDirection)({
        longitude: longitude,
        latitude: latitude
      });
      direction.setLength(distance);
      this.camera.position.copy(center.clone().add(direction));
      this.camera.lookAt(center);

      if (this.pointLight) {
        var lightDirection = (0, _coordsToDirection.coordsToDirection)({
          longitude: longitude,
          latitude: -Math.PI / 6
        });
        lightDirection.setLength(distance * 3);
        this.pointLight.position.copy(center.clone().add(lightDirection));
      }

      var calcFov = function calcFov(distance, width, r) {
        var vertical = r < 1 ? width / r : width;
        var fov = Math.atan(vertical / distance / 2) * 2 * (180 / Math.PI);
        return fov;
      };

      var d = this.camera.position.distanceTo(center);

      if (fov === 0) {
        fov = calcFov(d, radius * 2, this.renderer.domElement.offsetWidth / this.renderer.domElement.offsetHeight);
      }

      fov = Math.max(this.minFov, Math.min(this.maxFov, fov));

      if (fov !== this.fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }

      var needsRender = this.fov !== fov || this.longitude !== longitude || this.latitude !== latitude;
      Object.assign(this, {
        longitude: longitude,
        latitude: latitude,
        fov: fov
      });
      this.needsRender = true;

      if (needsRender) {
        this.callbacks.stateChange({
          longitude: longitude,
          latitude: latitude,
          fov: fov
        });
      }
    }
  }, {
    key: "__onPanGesture",
    value: function __onPanGesture(event) {
      var _this4 = this;

      this.__interiaMovement = false;
      var longitude = this.longitude,
          latitude = this.latitude;
      var center = event.center,
          isFinal = event.isFinal,
          velocityX = event.velocityX,
          velocityY = event.velocityY,
          pointers = event.pointers;

      var offset = function () {
        if (!(_this4.__lastPanPoint && _this4.__lastPanPoint.pointerLength === pointers.length)) {
          return {
            x: 0,
            y: 0
          };
        }

        return {
          x: center.x - _this4.__lastPanPoint.x,
          y: center.y - _this4.__lastPanPoint.y
        };
      }();

      if (!isFinal) {
        var layout = {
          width: this.element.offsetWidth,
          height: this.element.offsetHeight
        };
        this.update((0, _coordsMoveByOffset.coordsMoveByOffset)({
          longitude: longitude,
          latitude: latitude
        }, offset, layout));
        this.__lastPanPoint = {
          pointerLength: pointers.length,
          x: center.x,
          y: center.y
        };
      } else {
        delete this.__lastPanPoint;
        (0, _getFrameTime.getFrameTime)(function (frameTime) {
          _this4.__interiaMovement = true;
          var x = velocityX * frameTime;
          var y = velocityY * frameTime;
          var distance = Math.sqrt(x * x + y * y);

          if (distance > 100) {
            x = x / distance * 100;
            y = y / distance * 100;
          } // 滑动小于上下15度, 忽略 y 值


          if (Math.abs(y / x) < Math.tan(20 / 180 * Math.PI)) y = 0;

          _this4.__requestInteriaMovement({
            x: x,
            y: y
          });
        });
      }
    }
  }, {
    key: "__onPinchGesture",
    value: function __onPinchGesture(event) {
      this.__interiaMovement = false;
      var scale = event.scale,
          type = event.type;

      if (type === 'pinchstart') {
        this.__pinchCurrentFov = this.fov;
        return;
      }

      if (type === 'pinchend') {
        this.__pinchCurrentFov = undefined;
        return;
      }

      var fov = this.__pinchCurrentFov ? this.__pinchCurrentFov / scale : 1;
      this.update({
        fov: fov
      });
    }
  }, {
    key: "__requestInteriaMovement",
    value: function __requestInteriaMovement(offset) {
      var _this5 = this;

      if (this.__interiaMovement === false) return;
      var x = offset.x,
          y = offset.y;
      var longitude = this.longitude,
          latitude = this.latitude;
      var friction = 0.9;
      var layout = {
        width: this.element.offsetWidth,
        height: this.element.offsetHeight
      };
      this.update((0, _coordsMoveByOffset.coordsMoveByOffset)({
        longitude: longitude,
        latitude: latitude
      }, {
        x: x,
        y: y
      }, layout));
      var notFinal = Math.abs(x) > 1 || Math.abs(y) > 1;

      if (notFinal) {
        requestAnimationFrame(function () {
          return _this5.__requestInteriaMovement({
            x: x * friction,
            y: y * friction * 0.7
          });
        });
      } else {
        this.__interiaMovement = false;
      }
    }
  }, {
    key: "__onMouseWheel",
    value: function __onMouseWheel(event) {
      this.__interiaMovement = false;
      var fov = this.fov - event.delta;
      this.update({
        fov: fov <= 1 ? 1 : fov
      });
    }
  }, {
    key: "load",
    value: function load(url) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.callbacks.willLoad();

        loader.load(url, function (gltf) {
          _this6.setTarget(gltf);

          resolve(true);
        }, function (xhr) {
          _this6.callbacks.progressing(xhr.loaded / xhr.total * 100);
        }, function (error) {
          _this6.callbacks.loadError(error);

          reject(error);
        });
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.renderer.render(this.scene, this.camera);
    }
  }]);

  return Controller;
}();

var caches = {};
/**
 * 异步事件。
 */

var GLTFViewer = /*#__PURE__*/function (_Subscribe) {
  _inherits(GLTFViewer, _Subscribe);

  var _super = _createSuper(GLTFViewer);

  function GLTFViewer(config) {
    var _this7;

    _classCallCheck(this, GLTFViewer);

    _this7 = _super.call(this);

    _defineProperty(_assertThisInitialized(_this7), "uuid", (0, _uuid["default"])());

    var controller = new Controller(config, {
      stateChange: function stateChange(state) {
        return _this7.emit('stateChange', state);
      },
      progressing: function (_progressing) {
        function progressing(_x) {
          return _progressing.apply(this, arguments);
        }

        progressing.toString = function () {
          return _progressing.toString();
        };

        return progressing;
      }(function (progressing) {
        return _this7.emit('progressing', progressing);
      }),
      willLoad: function willLoad() {
        return _this7.emit('willLoad');
      },
      loaded: function loaded(gltf, scene, renderer) {
        return _this7.emit('loaded', gltf, scene, renderer);
      },
      loadError: function loadError(error) {
        return _this7.emit('loadError', error);
      }
    });
    Object.assign(window, {
      $controller: controller
    });
    caches[_this7.uuid] = controller;
    return _this7;
  }

  _createClass(GLTFViewer, [{
    key: "state",
    get: function get() {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      var proxy = new Proxy({
        fov: controller.fov,
        latitude: controller.latitude,
        longitude: controller.longitude
      }, {
        set: function set(obj, prop, value) {
          if (prop === 'fov') {
            if (isNaN(Number(value))) {
              throw new TypeError('The fov is not an number');
            }

            if (value > controller.maxFov || value < controller.minFov) {
              throw new RangeError("The fov seems invalid~ fov: [".concat(controller.minFov, ", ").concat(controller.maxFov, "]"));
            }
          }

          controller.update(_defineProperty({}, prop, value));
          return true;
        },
        get: function get(obj, prop) {
          return controller[prop];
        }
      });
      return proxy;
    },
    set: function set(_ref2) {
      var fov = _ref2.fov,
          latitude = _ref2.latitude,
          longitude = _ref2.longitude;
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.update({
        fov: fov === undefined ? controller.fov : fov,
        latitude: latitude === undefined ? controller.latitude : latitude,
        longitude: longitude === undefined ? controller.longitude : longitude
      });
    }
  }, {
    key: "minFov",
    get: function get() {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      return controller.minFov;
    },
    set: function set(fov) {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.config.minFov = fov;
      controller.update({});
    }
  }, {
    key: "maxFov",
    get: function get() {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      return controller.maxFov;
    }
    /**
     *
     * @param url glTF 模型CDN地址
     * @param options adaptive 是否开启自适应fov
     */
    ,
    set: function set(fov) {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.config.maxFov = fov;
      controller.update({});
    }
  }, {
    key: "load",
    value: function load(url) {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.load(url);
    }
    /**
     * 挂载
     * @param container
     * @param size
     */

  }, {
    key: "appendTo",
    value: function appendTo(container, size) {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.appendTo(container, size);
    }
    /**
     * 刷新：如果传递宽高则以该宽高重新绘制；否则，以父容器的宽高重新绘制。
     * @param size
     */

  }, {
    key: "refresh",
    value: function refresh(size) {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.refresh(size);
    }
    /**
     * 销毁
     */

  }, {
    key: "dispose",
    value: function dispose() {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      if (controller.dispose) controller.dispose();
      delete caches[this.uuid];
    }
    /**
     * 响应式fov
     */

  }, {
    key: "fitFov",
    value: function fitFov() {
      var controller = caches[this.uuid];
      if (!controller) throw new Error(ERROR_NO_CONTROLLER);
      controller.update({
        fov: 0
      });
    }
  }]);

  return GLTFViewer;
}(_Subscribe2.Subscribe);

exports.GLTFViewer = GLTFViewer;