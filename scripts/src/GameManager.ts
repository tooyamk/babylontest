class GameManager {
    public static readonly PI2: number = Math.PI * 2.0;
    public static readonly DEG_2_RAD: number = Math.PI / 180.0;

    private static _ins : GameManager = null;

    private _canvas : HTMLCanvasElement;
    private _engine : BABYLON.Engine;
    private _scene : BABYLON.Scene;

    constructor(canvas : HTMLCanvasElement) {
        GameManager._ins = this;

        this._canvas = canvas;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene = new BABYLON.Scene(this._engine);
    }

    public static init(canvas: HTMLCanvasElement) : void {
        if (GameManager._ins == null) new GameManager(canvas);
    }

    public static get ins() : GameManager {
        return GameManager._ins;
    }

    public get scene() : BABYLON.Scene {
        return this._scene;
    }

    public get canvas() : HTMLCanvasElement {
        return this._canvas;
    }

    public get engine() : BABYLON.Engine {
        return this._engine;
    }
}