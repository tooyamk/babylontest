class SceneManager {
    public static readonly ins: SceneManager = new SceneManager();

    private _scene: BaseScene;

    constructor() {
        this._scene = null;
    }

    public get scene(): BaseScene {
        return this._scene;
    }

    public change(scene: BaseScene): void {
        if (this._scene != scene) {
            if (this._scene != null) this._scene.dispose();

            this._scene = scene;

            if (this._scene != null) this._scene.start();
        }
    }
}