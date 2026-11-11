# 00-vendored three.js 识别笔记

- 源文件：`src/vendor/three.min.js`（712,983 字节，esbuild 打包时从 bundle 切出的压缩版，**勿格式化/勿改动**）

## 1. 推断版本：three.js r180（REVISION = "180"）

### 直接证据

| 证据 | 内容 |
|---|---|
| REVISION 常量 | 导出映射里 `REVISION:()=>M2`，紧随其后 `var M2="180"` → **REVISION = "180"** |
| 内部废弃提示（自洽于 r180） | `"THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"`；`"THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184..."` —— 面向 r184/r185 的废弃警告，说明源码版本 ≤ r183，与 r180 吻合 |
| WebGL1 移除提示 | `"WebGL 1 is not supported since r163."`（r163 起弃用 WebGL1，r180 仍保留该提示文案） |

### 特性指纹（佐证 ≥ r169，且无超出 r180 的新东西）

| 特性 | 引入版本 | 本文件 |
|---|---|---|
| `AgXToneMapping` / `NeutralToneMapping` | r162 | 有 |
| `Float16BufferAttribute` | r163 | 有 |
| `BatchedMesh` | r165 | 有 |
| `AttachedBindMode` / `DetachedBindMode` | r169 | 有 |
| `Controls`（基类）、`FrustumArray`、`Matrix2`、`ExternalTexture`、`FramebufferTexture`、`VideoFrameTexture`、`Timer`、`TimestampQuery` | r16x~r17x 陆续加入 | 均有 |
| `WebGPURenderer` / `WebGPUBackend` / `NodeMaterial` / TSL | three/webgpu 入口 | **无**（本文件是主入口 `three` 的 core 构建，不含 webgpu 入口） |
| `KTX2Loader` / `GLTFLoader` / `OrbitControls` / `DRACOLoader` | addons（examples/jsm） | **无**（未打包含 addons） |

结论：**r180**（REVISION 直读，特性指纹一致，无矛盾项）。

## 2. License

- three.js 为 **MIT License**。
- 本压缩文件**开头无 license 注释头**（esbuild/压缩过程剥掉了 `@license` 注释），`grep copyright / license / three.js authors` 均无命中——版权行样式（如 `Copyright 2010-2026 three.js authors`）**在本文件中不可考**，需以上游 three.js 仓库源文件为准。

## 3. 在构建中的角色

| 项 | 说明 |
|---|---|
| 形态 | esbuild **IIFE bundle 切片**：文件开头 `var lt={};br(lt,{...})` 用 bundle 头部的 `br`（`Object.defineProperty` getter 映射，见 `src/00-runtime-head.js`）把导出装进命名空间对象 `lt` |
| 导出命名空间 | `lt`——游戏各模块直接用 `lt.XXX` 访问（如 `03-textures.js` 14 处、`04-level.js`、`09-game-ui.js` 各 1 处 `lt.` 引用；全项目无 `THREE.` 前缀引用） |
| 共享方式 | 与 `00-runtime-head.js`（提供 `br` 定义）+ 各 `src/game/*.js` 模块拼接成同一 IIFE 作用域，**被所有游戏模块共享** |
| 覆盖范围 | 仅 three.js core（`WebGLRenderer`、几何/材质/灯光/动画/音频等），**不含** addons（GLTF/KTX2/OrbitControls）与 webgpu 入口 |
| 约束 | 构建源码，禁止格式化/修改 |

## 4. 开头导出映射规模

- **共 422 个导出**（形如 `Name:()=>mangled`）。
- 前 100 个：

```
ACESFilmicToneMapping, AddEquation, AddOperation, AdditiveAnimationBlendMode,
AdditiveBlending, AgXToneMapping, AlphaFormat, AlwaysCompare, AlwaysDepth,
AlwaysStencilFunc, AmbientLight, AnimationAction, AnimationClip, AnimationLoader,
AnimationMixer, AnimationObjectGroup, AnimationUtils, ArcCurve, ArrayCamera,
ArrowHelper, AttachedBindMode, Audio, AudioAnalyser, AudioContext, AudioListener,
AudioLoader, AxesHelper, BackSide, BasicDepthPacking, BasicShadowMap, BatchedMesh,
Bone, BooleanKeyframeTrack, Box2, Box3, Box3Helper, BoxGeometry, BoxHelper,
BufferAttribute, BufferGeometry, BufferGeometryLoader, ByteType, Cache, Camera,
CameraHelper, CanvasTexture, CapsuleGeometry, CatmullRomCurve3, CineonToneMapping,
CircleGeometry, ClampToEdgeWrapping, Clock, Color, ColorKeyframeTrack,
ColorManagement, CompressedArrayTexture, CompressedCubeTexture,
CompressedTexture, CompressedTextureLoader, ConeGeometry, ConstantAlphaFactor,
ConstantColorFactor, Controls, CubeCamera, CubeReflectionMapping,
CubeRefractionMapping, CubeTexture, CubeTextureLoader, CubeUVReflectionMapping,
CubicBezierCurve, CubicBezierCurve3, CubicInterpolant, CullFaceBack, CullFaceFront,
CullFaceFrontBack, CullFaceNone, Curve, CurvePath, CustomBlending,
CustomToneMapping, CylinderGeometry, Cylindrical, Data3DTexture, DataArrayTexture,
DataTexture, DataTextureLoader, DataUtils, DecrementStencilOp,
DecrementWrapStencilOp, DefaultLoadingManager, DepthFormat, DepthStencilFormat,
DepthTexture, DetachedBindMode, DirectionalLight, DirectionalLightHelper,
DiscreteInterpolant, DodecahedronGeometry, DoubleSide, DstAlphaFactor
```

其余 322 个含：全套材质/几何/灯光、`WebGLRenderer`/`RenderTarget`、ASTC/ETC2/S3TC/BPTC/PVRTC/RGTC 压缩格式常量、`ShaderChunk`/`ShaderLib`、`WebXRController`、`REVISION`、`createCanvasElement` 等（完整清单可由 `br(lt,{...})` 提取）。
