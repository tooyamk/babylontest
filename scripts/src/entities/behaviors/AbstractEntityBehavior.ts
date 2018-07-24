abstract class AbstractEntityBehavior {
    protected _owner: Entity;

    constructor() {
        this._owner = null;
    }

    public get owner(): Entity {
        return this._owner;
    }

    public _setOwner(owner: Entity): void {
        if (this._owner !== owner) {
            let old = this._owner;
            this._owner = owner;

            this._changedOwner(old);
        }
    }

    public dispose(): void {
        if (this._owner) this._owner.behavior = null;
    }

    public tick(time: number, type: TickType): void {
        //todo
    }

    protected _changedOwner(old: Entity): void {
        //todo
    }
}