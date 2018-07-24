class ExtSet<T> {
    public container: Set<T>;

    private _adding: Set<T>;
    private _removing: Set<T>;
    private _traversing: boolean;
    private _willClear: boolean;

    constructor() {
        this._adding = new Set<T>();
        this._removing = new Set<T>();
        this.container = new Set<T>();
        this._traversing = false;
        this._willClear = false;
    }

    public add(value: T): void {
        if (this._traversing) {
            if (this._removing.has(value)) {
                this._removing.delete(value);
                this._adding.add(value);
            } else {
                if (!this._adding.has(value)) this._adding.add(value);
            }
        } else {
            if (!this.container.has(value)) this.container.add(value);
        }
    }

    public delete(value: T): void {
        if (this._traversing) {
            if (this._adding.has(value)) {
                this._adding.delete(value);
                this._removing.add(value);
            } else {
                if (!this._removing.has(value)) this._removing.add(value);
            }
        } else {
            if (this.container.has(value)) this.container.delete(value);
        }
    }

    public set traversing(value: boolean) {
        if (this._traversing !== value) {
            this._traversing = value;

            if (this._willClear) {
                this._clear();
            } else {
                for (const value of this._removing) {
                    if (this.container.has(value)) this.container.delete(value);
                }
                this._removing.clear();

                for (const value of this._adding) {
                    if (!this.container.has(value)) this.container.add(value);
                }
                this._adding.clear();
            }
        }
    }

    public clear(): void {
        if (this._traversing) {
            this._willClear = true;
        } else {
            this._clear();
        }
    }

    private _clear(): void {
        this._willClear = false;
        this._adding.clear();
        this._removing.clear();
        this.container.clear();
    }
}