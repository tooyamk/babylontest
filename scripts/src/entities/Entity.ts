class Entity {
    private _root: BABYLON.TransformNode;

    constructor() {
        this._root = new BABYLON.TransformNode("", GameManager.ins.scene);
    }

    public get root(): BABYLON.TransformNode {
        return this._root;
    }

    public dipose(doNotRecurse: boolean = false, disposeMaterialAndTextures = false): void {
        if (this._root) {
            this._root.dispose(doNotRecurse, disposeMaterialAndTextures);
            this._root = null;
        }
    }
}