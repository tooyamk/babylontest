class LaunchScene extends BaseLogicScene {
    private _doneNumTasks: number;
    private _totalNumTasks: number;

    constructor() {
        super();

        this._doneNumTasks = 0;
        this._totalNumTasks = 0;
    }

    public activate(): void {
        super.activate();

        this._loadShader(false, "res/shaders/ppDrawTo.frag");
        
        this._loadShader(true, "res/shaders/WeightedBlended.vert");
        this._loadShader(false, "res/shaders/WeightedBlended.frag");
    }

    private _loadShader(isVertex: boolean, url: string, name: string = null): void {
        ++this._totalNumTasks;

        if (!name) name = ResManager.ins.disassembleFileNameFromPath(url);

        ResManager.ins.addResCallback(url, info => {
            if (info.isError) {
                console.log(info.error);
            } else {
                if (isVertex) {
                    ResManager.ins.updateShander(name, info.data as string, null, null);
                } else {
                    ResManager.ins.updateShander(null, null, name, info.data as string);
                }

                ++this._doneNumTasks;
            }
        });
    }

    protected _onEndFrame(evtData: BABYLON.Engine, evtState: BABYLON.EventState): void {
        if (this._doneNumTasks == this._totalNumTasks) {
            LogicSceneManager.ins.change(new TestOITRenderScene());
        }
    }
}