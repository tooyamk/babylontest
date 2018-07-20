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

    private _rtCams: { [key: string]: boolean };
    private _beforeDrawPhaseCam: BABYLON.Camera;

    private _date: Date;

    constructor(canvas: HTMLCanvasElement) {
        GameManager._ins = this;

        this._rtCams = {};
        this._beforeDrawPhaseCam = null;
        this._date = new Date();

        this._canvas = canvas;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.autoClear = false;
        this._scene.autoClearDepthAndStencil = false;
        BABYLON.DebugLayer.InspectorURL = "./babylon/babylon.inspector.bundle.js";
        //this._scene.debugLayer.show();
        this._engine.clear(new BABYLON.Color4(0, 1, 0, 1), true, true, true);
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

    public registerRenderTargetCamera(cam: Camera): void {
        this._rtCams[cam.toString()] = true;
    }

    public unregisterRenderTargetCamera(cam: Camera): void {
        delete this._rtCams[cam.toString()];
    }

    public getTimestamp(): number {
        return this._date.getTime();
    }

    private _run(): void {
        this._scene.onBeforeDrawPhaseObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
            this._engine.clear(null, true, false, false);
            let cam = evtData.activeCamera;
            if (this._rtCams[cam.toString()]) {
                this._beforeDrawPhaseCam = cam;
                let rt = (cam as Camera).renderTarget;
                this._engine.bindFramebuffer(rt.getInternalTexture(), 0, undefined, undefined, true);
                this._engine.clear(null, true, true, true);
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