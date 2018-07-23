/// <reference path="../babylon/babylon.d.ts" /> 

window.addEventListener("DOMContentLoaded", () => {
    document.oncontextmenu = () => {
        return false;
    }

    GameManager.init(document.getElementById("renderCanvas") as HTMLCanvasElement);

    LogicSceneManager.ins.change(new LaunchScene());
});