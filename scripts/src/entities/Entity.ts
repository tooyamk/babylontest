class Entity {
    private _displayContainer: BABYLON.TransformNode;
    private _parent: Entity;
    private _children: Entity[];
    private _behavior: AbstractEntityBehavior;

    constructor() {
        this._displayContainer = new BABYLON.TransformNode("", GameManager.ins.scene);
        this._parent = null;
        this._children = [];
    }

    public get displayContainer(): BABYLON.TransformNode {
        return this._displayContainer;
    }

    public get parent(): Entity {
        return this._parent;
    }

    public setParent(value: Entity): boolean {
        if (value === this || value === this._parent) {
            return false;
        } else {
            if (this._parent !== value) this._parent.remvoeEntity(this);
            this._parent = value;

            if (this._parent) {
                this._displayContainer.parent = this._parent.displayContainer;
            } else {
                this._displayContainer.parent = null;
            }

            return true;
        }
    }

    public get behavior(): AbstractEntityBehavior {
        return this._behavior;
    }

    public set behavior(behavior: AbstractEntityBehavior) {
        if (this._behavior !== behavior) {
            if (this._behavior) this._behavior._setOwner(null);
            this._behavior = behavior;
            if (this._behavior) this._behavior._setOwner(this);
        }
    }

    public addEntity(entity: Entity): boolean {
        if (entity) {
            return entity.setParent(this);
        } else {
            return false;
        }
    }

    public remvoeEntity(entity: Entity): boolean {
        if (entity.parent == this) {
            let idx = this._children.indexOf(entity);
            if (idx >= 0) this._children.splice(idx, 1);
            entity.setParent(null);

            return true;
        } else {
            return false;
        }
    }

    public tick(time: number, type: TickType): void {
        if (this._behavior) this._behavior.tick(time, type);
    }

    public dipose(): void {
        if (this._displayContainer) {
            for (let child of this._children) this.remvoeEntity(child);

            this._displayContainer.dispose(true, false);
            this._displayContainer = null;

            for (let child of this._children) child.dipose();
            this._children.length = 0;

            if (this._behavior) this._behavior.dispose();
        }
    }
}