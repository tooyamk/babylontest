class MouseKeyInfo {
    private _isPress: boolean;
    private _pressStartPos: BABYLON.Vector2;
    private _dragLastPos: BABYLON.Vector2;
    private _dragDelta: BABYLON.Vector2;
    private _isDragging: boolean;

    constructor() {
        this._isPress = false;
        this._pressStartPos = new BABYLON.Vector2(0, 0);
        this._dragLastPos = new BABYLON.Vector2(0, 0);
        this._dragDelta = new BABYLON.Vector2(0, 0);
        this._isDragging = false;
    }

    public get dragDelta(): BABYLON.Vector2 {
        return this._dragDelta;
    }

    public get isPress(): boolean {
        return this._isPress;
    }

    public get isDragging(): boolean {
        return this._isDragging;
    }

    public setPress(evt: PointerEvent): void {
        if (evt == null) {
            this._isPress = false;
            this._isDragging = false;
        } else if (!this._isPress) {
            this._isPress = true;
            this._pressStartPos.set(evt.x, evt.y);
            this._dragDelta.set(0, 0);
            this._isDragging = false;
            this._dragLastPos.set(evt.x, evt.y);
        }
    }

    public setMove(evt: MouseEvent): void {
        if (this._isPress) {
            this._dragDelta.set(this._dragLastPos.x - evt.x, this._dragLastPos.y - evt.y);
            this._dragLastPos.set(evt.x, evt.y);
            this._isDragging = true;
        }
    }
}

class Input {
    private _keyInputMap: { [key: string]: boolean };
    private _mouseInputMap: { [key: number]: MouseKeyInfo };
    private _mouseWheel: number;
    private _mousePos: BABYLON.Vector2;

    constructor(canvas: HTMLCanvasElement) {
        this._keyInputMap = {};
        this._mouseInputMap = {};
        this._mouseWheel = 0;
        this._mousePos = new BABYLON.Vector2(0, 0);

        canvas.addEventListener("keypress", (evt: KeyboardEvent) => {
            if (!evt.repeat) {
                this._keyInputMap[evt.key.toLowerCase()] = true;
            }
        }, false);
        canvas.addEventListener("keyup", (evt: KeyboardEvent) => {
            this._keyInputMap[evt.key.toLowerCase()] = false;
        }, false);

        canvas.addEventListener("pointerdown", (evt: PointerEvent) => {
            this._getOrCreateMouseKeyInfo(evt.button).setPress(evt);
        }, false);
        canvas.addEventListener("pointerup", (evt: PointerEvent) => {
            this._getOrCreateMouseKeyInfo(evt.button).setPress(null);
        }, false);
        canvas.addEventListener("wheel", (evt: WheelEvent) => {
            this._mouseWheel = evt.wheelDelta;
        }, false);
        canvas.addEventListener("pointermove", (evt: PointerEvent) => {
            this._mousePos.set(evt.x, evt.y);

            for (const info in this._mouseInputMap) {
                this._mouseInputMap[info].setMove(evt);
            }
        })
    }

    private _getOrCreateMouseKeyInfo(key: number): MouseKeyInfo {
        let info: MouseKeyInfo = this._mouseInputMap[key];
        if (info == null) {
            info = new MouseKeyInfo();
            this._mouseInputMap[key] = info;
        }

        return info;
    }

    public isKeyPress(key: string): boolean {
        return this._keyInputMap[key];
    }

    public getMouseKeyInfo(key: number): MouseKeyInfo {
        return this._mouseInputMap[key];
    }

    public isMousePress(key: number): boolean {
        let info = this._mouseInputMap[key];
        return info == null ? false : info.isPress;
    }

    public getMouseWheel(): number {
        return this._mouseWheel;
    }

    public getMousePosition(): BABYLON.Vector2 {
        return this._mousePos;
    }

    public tickEnd(): void {
        this._mouseWheel = 0;
    }
}