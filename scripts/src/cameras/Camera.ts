class Camera extends BABYLON.TargetCamera {
    public renderTarget : BABYLON.RenderTargetTexture;

    constructor(name: string) {
        super(name, BABYLON.Vector3.Zero(), GameManager.ins.scene);

        this.renderTarget = null;
    }
}