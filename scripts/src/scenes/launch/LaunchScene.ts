class LaunchScene extends BaseScene {
    private _doneNumTasks: number;
    private _totalNumTasks: number;

    constructor() {
        super();

        this._doneNumTasks = 0;
        this._totalNumTasks = 0;
    }

    public awake(): void {
        super.awake();

        this._totalNumTasks = 1;

        ResManager.ins.addResCallback("res/shaders/ppDrawTo.frag", info => {
            if (!info.isError) {
                ResManager.ins.updateShander(null, null, "ppDrawTo", info.data as string);

                this._doneNumTasks++;
            }
        });
    }

    protected _onEndFrame(evtData: BABYLON.Engine, evtState: BABYLON.EventState): void {
        if (this._doneNumTasks == this._totalNumTasks) {
            SceneManager.ins.change(new TestScene1());
        }
    }
}