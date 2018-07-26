class Camera extends BABYLON.TargetCamera {
    public static readonly EXT_CAMERA: string = "_extCam";

    public clearColor: BABYLON.Color4 = new BABYLON.Color4(0, 0, 0, 1);
    public clearBackBuffer: boolean = true;
    public clearDepth: boolean = true;
    public clearStencil: boolean = true;

    public renderTarget: BABYLON.RenderTargetTexture;

    public onRenderFinish: (camera: Camera) => void = null;

    constructor(name: string) {
        super(name, BABYLON.Vector3.Zero(), GameManager.ins.scene);

        (this as any)[Camera.EXT_CAMERA] = true;
        
        this.renderTarget = null;
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        this.renderTarget = null;
        this.onRenderFinish = null;

        super.dispose(doNotRecurse, disposeMaterialAndTextures);
    }
}