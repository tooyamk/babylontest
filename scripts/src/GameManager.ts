/*
onBeforeAnimationsObservable
if (engine.isDeterministicLockStep()) {
    while {
        onBeforeStepObservable
        onAfterAnimationsObservable
        if (physicsEngine) {
            onBeforePhysicsObservable
            onAfterStepObservable
        }
    }
} else {
    onAfterAnimationsObservable
    if (physicsEngine) {
        onBeforePhysicsObservable
        onAfterStepObservable
    }
}

onBeforeRenderObservable
    onBeforeRenderTargetsRenderObservable
    onAfterRenderTargetsRenderObservable

    while (cameras) {
        onBeforeCameraRenderObservable
            onBeforeRenderTargetsRenderObservable
            onAfterRenderTargetsRenderObservable

            onBeforeDrawPhaseObservable
            //do renderingManager.render
            onAfterDrawPhaseObservable
        onAfterCameraRenderObservable
    }
onAfterRenderObservable
*/

enum TickType {
    BEGIN,
    BEFORE_RENDER,
    END
}


class GameManager {
    public static readonly PI2: number = Math.PI * 2.0;
    public static readonly DEG_2_RAD: number = Math.PI / 180.0;

    private static _ins: GameManager = null;

    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;

    private _beforeDrawPhaseCam: Camera;

    private _date: Date;

    private _camRenderFunc: (camera: BABYLON.Camera, fireOnRenderFinish: boolean) => void;

    constructor(canvas: HTMLCanvasElement) {
        GameManager._ins = this;

        this._beforeDrawPhaseCam = null;
        this._date = new Date();

        this._canvas = canvas;

        let opt = {
            disableWebGL2Support: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            depth: true,
            stencil: true
        };
        this._engine = new BABYLON.Engine(this._canvas, true, opt, false);

        console.log("webgl version : " + this._engine.webGLVersion);

        this._scene = new BABYLON.Scene(this._engine);
        this._scene.autoClear = false;
        this._scene.autoClearDepthAndStencil = false;
        BABYLON.RenderingManager.AUTOCLEAR = false;

        this._camRenderFunc = null;

        this._scene["_processSubCameras"] = (camera: BABYLON.Camera) => {
            this.cameraRender(camera);
        };

        window.addEventListener('resize', (evt: UIEvent) => {
            this._engine.resize();
        });

        InputManager.init(canvas);

        BABYLON.DebugLayer.InspectorURL = "libs/babylon.inspector.bundle.js";
        this._scene.debugLayer.show();
    }

    public static init(canvas: HTMLCanvasElement): void {
        if (!GameManager._ins) {
            new GameManager(canvas);
            GameManager._ins._run();
        }
    }

    public static get ins(): GameManager {
        return GameManager._ins;
    }

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public get engine(): BABYLON.Engine {
        return this._engine;
    }

    public getTimestamp(): number {
        return this._date.getTime();
    }

    private _callCameraOnRenderFinish(camera: BABYLON.Camera, fireOnRenderFinish: boolean = true): void {
        if (fireOnRenderFinish && (camera as any)[Camera.EXT_CAMERA]) {
            let cam = camera as Camera;
            if (cam.onRenderFinish) cam.onRenderFinish(cam);
        }
    }

    public cameraRender(camera: BABYLON.Camera, fireOnRenderFinish: boolean = true): void {
        if (!this._camRenderFunc) {
            let gm = GameManager.ins;

            this._camRenderFunc = function (camera: BABYLON.Camera, fireOnRenderFinish: boolean) {
                if (camera.cameraRigMode === Camera.RIG_MODE_NONE) {
                    this._renderForCamera(camera);
                    gm._callCameraOnRenderFinish(camera, fireOnRenderFinish);

                    return;
                }

                for (var index = 0; index < camera._rigCameras.length; index++) {
                    this._renderForCamera(camera._rigCameras[index], camera);
                }

                this.activeCamera = camera;
                this.setTransformMatrix(this.activeCamera.getViewMatrix(), this.activeCamera.getProjectionMatrix());

                gm._callCameraOnRenderFinish(camera, fireOnRenderFinish);
            };
        }

        this._camRenderFunc.call(this._scene, camera, fireOnRenderFinish);
    }

    private _run(): void {
        let time = 0.0;

        this._scene.onBeforeRenderObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
            LogicSceneManager.ins.tick(time, TickType.BEFORE_RENDER);
        });

        this._scene.onBeforeDrawPhaseObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
            let cam = evtData.activeCamera;
            if ((cam as any)[Camera.EXT_CAMERA]) {
                let extCam = cam as Camera;
                this._beforeDrawPhaseCam = extCam;
                let rt = extCam.renderTarget;
                if (rt) {
                    this._engine.bindFramebuffer(rt.getInternalTexture(), 0, undefined, undefined, true);
                }

                this._engine.clear(extCam.clearColor, extCam.clearBackBuffer, extCam.clearDepth, extCam.clearStencil);
            } else {
                this._engine.clear(this._scene.clearColor, true, true, true);
            }
        });

        this._scene.onAfterDrawPhaseObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
            if (this._beforeDrawPhaseCam === evtData.activeCamera) {
                this._beforeDrawPhaseCam = null;
                this._engine.restoreDefaultFramebuffer();
            }
        });

        //this._scene.onAfterRenderObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
        //});

        this._engine.runRenderLoop(() => {
            let time = this._scene.useConstantAnimationDeltaTime ? 16 : Math.max(BABYLON.Scene.MinDeltaTime, Math.min(this._engine.getDeltaTime(), BABYLON.Scene.MaxDeltaTime));

            LogicSceneManager.ins.tick(time, TickType.BEGIN);

            if (this._scene.activeCamera != null) {
                let sarr = GameManager.ins.scene.getActiveMeshes();
                let arr = sarr.data;
                
                this._scene.render();
            }

            LogicSceneManager.ins.tick(time, TickType.END);

            ResManager.ins.tick();
            InputManager.ins.endFrame();
        });
    }
}