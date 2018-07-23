class LogicSceneManager {
    public static readonly ins: LogicSceneManager = new LogicSceneManager();

    private _scene: BaseLogicScene;

    constructor() {
        this._scene = null;
    }

    public get scene(): BaseLogicScene {
        return this._scene;
    }

    public change(scene: BaseLogicScene): void {
        if (this._scene !== scene) {
            if (this._scene !== null) this._scene.inactivate();

            this._scene = scene;

            if (this._scene !== null) this._scene.activate();
        }
    }
}