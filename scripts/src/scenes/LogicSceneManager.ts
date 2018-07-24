class LogicSceneManager {
    public static readonly ins: LogicSceneManager = new LogicSceneManager();

    private _scene: AbstractLogicScene;

    constructor() {
        this._scene = null;
    }

    public get scene(): AbstractLogicScene {
        return this._scene;
    }

    public tick(time: number, type: TickType): void {
        if (this._scene) this._scene.tick(time, type);
    }

    public change(scene: AbstractLogicScene): void {
        if (this._scene !== scene) {
            if (this._scene !== null) this._scene.inactivate();

            this._scene = scene;

            if (this._scene !== null) this._scene.activate();
        }
    }
}