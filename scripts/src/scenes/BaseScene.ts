abstract class BaseScene {
    private _onBeginFrameObserver: BABYLON.Observer<BABYLON.Engine>;
    private _onEndFrameObserver: BABYLON.Observer<BABYLON.Engine>;
    private _onBeforeRenderObserver: BABYLON.Observer<BABYLON.Scene>;
    private _onAfterRenderObserver: BABYLON.Observer<BABYLON.Scene>;

    constructor() {
        this._onBeginFrameObserver = null;
        this._onEndFrameObserver = null;
        this._onBeforeRenderObserver = null;
        this._onAfterRenderObserver = null;
    }

    public start(): void {
        let engine = GameManager.ins.engine;

        this._onBeginFrameObserver = engine.onBeginFrameObservable.add((evtData: BABYLON.Engine, evtState: BABYLON.EventState) => {
            this._onBeginFrame(evtData, evtState);
        });

        this._onEndFrameObserver = engine.onEndFrameObservable.add((evtData: BABYLON.Engine, evtState: BABYLON.EventState) => {
            this._onEndFrame(evtData, evtState);
        });

        let scene = GameManager.ins.scene;
        this._onBeforeRenderObserver = scene.onBeforeRenderObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
            this._onBeforeRender(evtData, evtState);
        });

        this._onAfterRenderObserver = scene.onAfterRenderObservable.add((evtData: BABYLON.Scene, evtState: BABYLON.EventState) => {
            this._onAfterRender(evtData, evtState);
        });
    }

    public dispose(): void {
        let engine = GameManager.ins.engine;
        if (this._onBeginFrameObserver) {
            engine.onBeginFrameObservable.remove(this._onBeginFrameObserver);
            this._onBeginFrameObserver = null;
        }

        if (this._onEndFrameObserver) {
            engine.onEndFrameObservable.remove(this._onEndFrameObserver);
            this._onEndFrameObserver = null;
        }

        let scene = GameManager.ins.scene;
        if (this._onBeforeRenderObserver) {
            scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
            this._onBeforeRenderObserver = null;
        }

        if (this._onAfterRenderObserver) {
            scene.onAfterRenderObservable.remove(this._onAfterRenderObserver);
            this._onAfterRenderObserver = null;
        }
    }

    protected _onBeginFrame(evtData: BABYLON.Engine, evtState: BABYLON.EventState): void {
        //todo
    }

    protected _onBeforeRender(evtData: BABYLON.Scene, evtState: BABYLON.EventState): void {
        //todo
    }

    protected _onAfterRender(evtData: BABYLON.Scene, evtState: BABYLON.EventState): void {
        //todo
    }

    protected _onEndFrame(evtData: BABYLON.Engine, evtState: BABYLON.EventState): void {
        //todo
    }
}