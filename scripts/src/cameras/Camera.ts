class Camera extends BABYLON.TargetCamera {
    private static _insAccumulator: number = 0;

    public clearColor: BABYLON.Color4 = new BABYLON.Color4(0, 0, 0, 1);
    public clearBackBuffer: boolean = true;
    public clearDepth: boolean = true;
    public clearStencil: boolean = true;

    protected _renderTarget: BABYLON.RenderTargetTexture;

    private _insID: string;

    constructor(name: string) {
        super(name, BABYLON.Vector3.Zero(), GameManager.ins.scene)
        
        this._insID = "_@#$" + (++Camera._insAccumulator).toString();
        this._renderTarget = null;
    }

    public toString(): string {
        return super.toString() + this._insID;
    }

    public get renderTarget() : BABYLON.RenderTargetTexture {
        return this._renderTarget;
    }

    public set renderTarget(rt: BABYLON.RenderTargetTexture) {
        if (this._renderTarget != rt) {
            if (this._renderTarget != null) GameManager.ins.unregisterRenderTargetCamera(this);
            this._renderTarget = rt;
            if (this._renderTarget != null) GameManager.ins.registerRenderTargetCamera(this);
        }
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        this.renderTarget = null;

        super.dispose(doNotRecurse, disposeMaterialAndTextures);
    }
}