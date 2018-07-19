/// <reference path="../babylon/babylon.d.ts" /> 

window.addEventListener("DOMContentLoaded", () => {
    document.oncontextmenu = () => {
        return false;
    }

    GameManager.init(document.getElementById("renderCanvas") as HTMLCanvasElement);

    SceneManager.ins.change(new LaunchScene());

    //let game = new Game();
    //game.createScene();
    //game.doRender();
});