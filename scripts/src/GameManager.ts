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

class GameManager {
    public static readonly PI2: number = Math.PI * 2.0;
    public static readonly DEG_2_RAD: number = Math.PI / 180.0;

    private static _ins: GameManager = null;

    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;

    private _beforeDrawPhaseCam: Camera;

    private _date: Date;

    constructor(canvas: HTMLCanvasElement) {
        GameManager._ins = this;

        this._beforeDrawPhaseCam = null;
        this._date = new Date();

        this._canvas = canvas;

        let opt = {
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            depth: true,
            stencil: true
        };
        this._engine = new BABYLON.Engine(this._canvas, true, opt, false);

        this._scene = new BABYLON.Scene(this._engine);
        this._scene.autoClear = false;
        this._scene.autoClearDepthAndStencil = false;
        BABYLON.RenderingManager.AUTOCLEAR = false;
        BABYLON.DebugLayer.InspectorURL = "libs/babylon.inspector.bundle.js";
        this._scene.debugLayer.show();

        window.addEventListener('resize', (evt: UIEvent) => {
            this._engine.resize();
        });
    }

    public static init(canvas: HTMLCanvasElement): void {
        if (GameManager._ins == null) new GameManager(canvas);
        GameManager._ins._run();
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

    private _run(): void {
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
            if (this._beforeDrawPhaseCam == evtData.activeCamera) {
                this._beforeDrawPhaseCam = null;
                this._engine.restoreDefaultFramebuffer();
            }
        });

        this._engine.runRenderLoop(() => {
            if (this._scene.activeCamera != null) this._scene.render();
        });
    }
}