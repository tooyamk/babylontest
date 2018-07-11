class CameraManager {
    private _mainCam: BABYLON.TargetCamera;
    private _root: BABYLON.TransformNode;
    private _rotationX: BABYLON.TransformNode;
    private _rotationY: BABYLON.TransformNode;

    private _postProcessCam: BABYLON.Camera;

    private _rotXRange : BABYLON.Vector2;

    constructor() {
        this._rotXRange = new BABYLON.Vector2(NaN, NaN);

        let scene = Game.getIns().getScene();
        this._root = new BABYLON.TransformNode("", scene);

        this._rotationY = new BABYLON.TransformNode("", scene);
        this._rotationY.parent = this._root;

        this._rotationX = new BABYLON.TransformNode("", scene);
        this._rotationX.parent = this._rotationY;

        this._mainCam = new BABYLON.TargetCamera("", BABYLON.Vector3.Zero(), scene);
        this._mainCam.parent = this._rotationX;

        this.identity();

        this._postProcessCam = new BABYLON.Camera("", BABYLON.Vector3.Zero(), scene);
        this._postProcessCam.layerMask = 0;
    }

    public get postProcessCamera(): BABYLON.Camera {
        return this._postProcessCam;
    }

    public get root() : BABYLON.TransformNode {
        return this._root;
    }

    public get rotationX(): number {
        return this._rotationX.rotation.x;
    }

    public set rotationX(value : number) {
        value %= Game.PI2;
        if (this._rotXRange.x == this._rotXRange.x && value < this._rotXRange.x) value = this._rotXRange.x;
        if (this._rotXRange.y == this._rotXRange.y && value > this._rotXRange.y) value = this._rotXRange.y;
        this._rotationX.rotation.x = value;
    }

    public get rotationY(): number {
        return this._rotationY.rotation.y;
    }

    public set rotationY(value: number) {
        this._rotationY.rotation.y = value % Game.PI2;
    }

    public get mainCamera() : BABYLON.TargetCamera {
        return this._mainCam;
    }

    public setRotationXRange(min : number, max : number) : void {
        this._rotXRange.set(min, max);
    }

    public setTarget(target : BABYLON.Node) : void {
        this._root.parent = target;
    }

    public identity() :void {
        this._root.position = BABYLON.Vector3.Zero();
        this._root.rotation = BABYLON.Vector3.Zero();

        this._rotationX.position = BABYLON.Vector3.Zero();
        this._rotationX.rotation = BABYLON.Vector3.Zero();

        this._rotationY.position = BABYLON.Vector3.Zero();
        this._rotationY.rotation = BABYLON.Vector3.Zero();
        
        this._mainCam.position = new BABYLON.Vector3(0.0, 2.5, -12.0);
        this._mainCam.rotation = BABYLON.Vector3.Zero();

        this.rotationX = 10 * Game.DEG_2_RAD;
    }
}