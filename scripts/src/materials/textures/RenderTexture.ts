class RenderTexture extends BABYLON.RenderTargetTexture {
    public clearBackBuffer: boolean = true;
    public clearDepth: boolean = true;
    public clearStencil: boolean = true;

    constructor(name: string, size: number | {
        width: number;
        height: number;
    } | {
        ratio: number;
    }, generateMipMaps?: boolean, doNotChangeAspectRatio?: boolean, type?: number, isCube?: boolean, samplingMode?: number, generateDepthBuffer?: boolean, generateStencilBuffer?: boolean, isMulti?: boolean) {
        super(name, size, GameManager.ins.scene, generateMipMaps, doNotChangeAspectRatio, type, isCube, samplingMode, generateDepthBuffer, generateStencilBuffer, isMulti);

        this.onClearObservable.add((evtData: BABYLON.Engine, evtState: BABYLON.EventState) => {
            evtData.clear(this.clearColor || GameManager.ins.scene.clearColor, this.clearBackBuffer, this.clearDepth, this.clearStencil);
        });
    }
}