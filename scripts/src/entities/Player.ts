class Player {
    private _dis : BABYLON.TransformNode;
    
    constructor() {

    }
    
    public getDisplay() :BABYLON.TransformNode {
        return this._dis;
    }

    public setDisplay(dis : BABYLON.TransformNode) : void {
        this._dis = dis;
    }
}