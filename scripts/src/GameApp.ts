/// <reference path="../babylon/babylon.d.ts" /> 

window.addEventListener("DOMContentLoaded", () => {
    document.oncontextmenu = () => {
        return false;
    }

    //GameManager.init(document.getElementById("renderCanvas") as HTMLCanvasElement);

    //SceneManager.ins.change(new LaunchScene());
    
    BABYLON.RenderingManager.AUTOCLEAR = false;
    let canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    let engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    for (let i = 0; i < BABYLON.RenderingManager.MAX_RENDERINGGROUPS; ++i) {
        scene.setRenderingAutoClearDepthStencil(i, false, false, false);
    }

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

    engine.restoreDefaultFramebuffer();
    let gl = engine["_gl"] as WebGLRenderingContext;
    gl.clearColor(1, 0, 0, 1);
    gl.clearDepth(0.0);
    gl.clearDepth(0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    engine.runRenderLoop(() => {
        engine.restoreDefaultFramebuffer();
        let gl = engine["_gl"] as WebGLRenderingContext;
        gl.clear(gl.COLOR_BUFFER_BIT);
        //engine.clear(null, false, false, false);
        scene.render();
    });
});