class KeyboardMouseBehavior extends AbstractEntityBehavior {
    public tick(time: number, type: TickType): void {
        if (type == TickType.BEGIN) {
            if (InputManager.ins.isKeyPress("a")) this._owner.displayContainer.translate(new BABYLON.Vector3(-1, 0, 0), 0.1, BABYLON.Space.LOCAL);
            if (InputManager.ins.isKeyPress("d")) this._owner.displayContainer.translate(new BABYLON.Vector3(1, 0, 0), 0.1, BABYLON.Space.LOCAL);
            if (InputManager.ins.isKeyPress("w")) this._owner.displayContainer.translate(new BABYLON.Vector3(0, 0, 1), 0.1, BABYLON.Space.LOCAL);
            if (InputManager.ins.isKeyPress("s")) this._owner.displayContainer.translate(new BABYLON.Vector3(0, 0, -1), 0.1, BABYLON.Space.LOCAL);

            let mrk = InputManager.ins.getMouseKeyInfo(2);
            if (mrk != null && mrk.isDragging) {
                this._owner.displayContainer.rotation.y += mrk.dragDelta.x * 1 * GameManager.DEG_2_RAD;
            }
        }
    }
}