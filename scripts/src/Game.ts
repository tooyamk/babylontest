/// <reference path="../babylon/babylon.d.ts" /> 

class Game {
    public static readonly PI2: number = Math.PI * 2.0;
    public static readonly DEG_2_RAD: number = Math.PI / 180.0;
    public static readonly EMISSIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(0.1, 0.1, 0.1);

    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: CameraManager;
    private _light: BABYLON.ShadowLight;
    private _assetsManager: BABYLON.AssetsManager;
    private _ground:BABYLON.Mesh;
    private _input:Input;
    private _player: Player;
    private _skyBox: BABYLON.Mesh;
    private _shadowGenerator: BABYLON.ShadowGenerator;
    private _rt: BABYLON.RenderTargetTexture;
    private _mainRt: BABYLON.RenderTargetTexture;
    private _pp: BABYLON.PostProcess;
    private _numLoadedAssets: number;
    private _totalLoadAssets: number;
    private _postProcessManager: BABYLON.PostProcessManager;

    private static _ins : Game;

    constructor(canvasElement: string) {
        Game._ins = this;
        
        document.oncontextmenu = () => {
            return false;
        }

        this._totalLoadAssets = 0;
        this._numLoadedAssets = 0;

        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    public static getIns() :Game {
        return Game._ins;
    }

    public getScene():BABYLON.Scene {
        return this._scene;
    }

    public createScene(): void {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);

        this._createSkybox();

        new BABYLON.DebugLayer(this._scene).show();

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new CameraManager();
        this._camera.setRotationXRange(-10.0 * Game.DEG_2_RAD, 90 * Game.DEG_2_RAD);
        this._input = new Input(this._canvas);
        this._player = new Player();
        this._postProcessManager = new BABYLON.PostProcessManager(this._scene);

        // Attach the camera to the canvas.
        //this._camera.attachControl(this._canvas, false);

        this._assetsManager = new BABYLON.AssetsManager(this._scene);
        this._assetsManager.useDefaultLoadingScreen = false;

        this._rt = new BABYLON.RenderTargetTexture("", 1024, this._scene, false);
        this._rt.renderList.push(this._skyBox);

        this._mainRt = new BABYLON.RenderTargetTexture("", 1024, this._scene, false);
        this._mainRt.renderList = null;
        //this._scene.customRenderTargets.push(this._mainRt);
        //this._camera.mainCamera.customRenderTargets.push(this._mainRt);

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        let light: BABYLON.DirectionalLight = new BABYLON.DirectionalLight('light1', new BABYLON.Vector3(1, -1, 0), this._scene);
        light.position = new BABYLON.Vector3(-3, 3, 0);
        this._light = light;

        this._shadowGenerator = new BABYLON.ShadowGenerator(1024, this._light);
        this._shadowGenerator.useBlurExponentialShadowMap = true;

        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        this._createPlayer();

        /*
        BABYLON.SceneLoader.ImportMesh("", "", "res/SampleScene.babylon", this._scene, function (newMeshes: BABYLON.AbstractMesh[], particleSystems: BABYLON.ParticleSystem[], skeletons: BABYLON.Skeleton[], animationGroups: BABYLON.AnimationGroup[]) {
           var mesh : BABYLON.AbstractMesh = newMeshes[1];
           mesh.position.x = -2;

           mesh.getScene().removeMesh(mesh);
           mesh = mesh.clone("", null, false);
           mesh.position.x = -4;
        })
        */

        // Move the sphere upward 1/2 of its height.

        // Create a built-in "ground" shape.
        //this._createGround();
        this._createGroundWithHeightMap();
        if (this._ground != null) {
            this._ground.receiveShadows = true;
            let mat = new BABYLON.StandardMaterial("", this._scene);
            mat.emissiveColor = Game.EMISSIVE_COLOR;
            this._ground.material = mat;
        }

        /*
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var text1 = new BABYLON.GUI.TextBlock();
        this._text = text1;
        text1.text = "";
        text1.color = "#FFFF00";
        text1.fontSize = 24;
        advancedTexture.addControl(text1);
        */

        let plane = BABYLON.MeshBuilder.CreatePlane("", { width: 6, height: 3 }, this._scene);
        plane.position.y = 2;
        plane.position.z = 2;
        let mat = new BABYLON.StandardMaterial("", this._scene);
        mat.emissiveTexture = this._mainRt;
        mat.disableLighting = true;
        mat.backFaceCulling = false;
        plane.material = mat;

        this._totalLoadAssets++;
        let txtTask = this._assetsManager.addTextFileTask("", "res/shaders/ppDrawTo.txt");
        txtTask.onSuccess = (task: BABYLON.TextFileAssetTask) => {
            BABYLON.Effect.ShadersStore["ppDrawToPixelShader"] = task.text;
            this._numLoadedAssets++;

            this._pp = new BABYLON.PostProcess("", "ppDrawTo", null, ["tex"], 0, null);
            this._pp.onApply = (effect: BABYLON.Effect) => {
                effect.setTexture("tex", this._mainRt);
            };
        };
        txtTask.onError = (task: BABYLON.TextFileAssetTask) => {
            let a = 1;
        };

        this._assetsManager.addTextureTask("", "res/earth.jpg").onSuccess = (task: BABYLON.TextureAssetTask) => {
            let mat = this._ground.material as BABYLON.StandardMaterial;
            mat.diffuseTexture = task.texture;

            mat = (this._player.getDisplay() as BABYLON.Mesh).material as BABYLON.StandardMaterial;
            mat.diffuseTexture = task.texture;
        };

        this._assetsManager.load();
    }

    private _createSkybox(): void {
        this._skyBox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this._scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("res/skybox/skybox", this._scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this._skyBox.material = skyboxMaterial;
    }

    private _createGround() :void {
        this._ground = BABYLON.MeshBuilder.CreateGround('ground',
            { width: 6, height: 6, subdivisions: 2 }, this._scene);
    }

    private _createGroundWithHeightMap() :void {
        this._ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "res/worldHeightMap.jpg", 200, 200, 250, 0, 10, this._scene, false);
    }

    private _createPlayer() : void {
        let mesh = BABYLON.MeshBuilder.CreateBox("", { width: 1, height: 2, depth: 1 });
        mesh.position.y = 2;

        let mat = new BABYLON.StandardMaterial("", this._scene);
        mat.emissiveColor = Game.EMISSIVE_COLOR;
        mesh.material = mat;

        this._player.setDisplay(mesh);

        this._camera.setTarget(mesh);
        this._camera.identity();

        //shadowGenerator.getShadowMap().renderList.push(sphere);
        this._shadowGenerator.addShadowCaster(mesh);
    }

    public doRender(): void {
        // Run the render loop.
        this._scene.onBeforeRenderObservable.add((evtData : BABYLON.Scene, evtState : BABYLON.EventState) => {
            //this._rt.render(false, false);
        });

        this._engine.runRenderLoop(() => {
            if (this._numLoadedAssets == this._totalLoadAssets) {
                if (this._input.isKeyPress("a")) this._player.getDisplay().translate(new BABYLON.Vector3(-1, 0, 0), 0.1, BABYLON.Space.LOCAL);
                if (this._input.isKeyPress("d")) this._player.getDisplay().translate(new BABYLON.Vector3(1, 0, 0), 0.1, BABYLON.Space.LOCAL);
                if (this._input.isKeyPress("w")) this._player.getDisplay().translate(new BABYLON.Vector3(0, 0, 1), 0.1, BABYLON.Space.LOCAL);
                if (this._input.isKeyPress("s")) this._player.getDisplay().translate(new BABYLON.Vector3(0, 0, -1), 0.1, BABYLON.Space.LOCAL);

                let mw = this._input.getMouseWheel();
                if (mw != 0) this._camera.mainCamera.position.z += mw * 0.01;

                let mlk = this._input.getMouseKeyInfo(0);
                if (mlk != null && mlk.isDragging) {
                    this._camera.rotationY -= mlk.dragDelta.x * 1 * Game.DEG_2_RAD;
                }

                let mrk = this._input.getMouseKeyInfo(2);
                if (mrk != null && mrk.isDragging) {
                    this._player.getDisplay().rotation.y -= mrk.dragDelta.x * 1 * Game.DEG_2_RAD;
                    this._camera.rotationX -= mrk.dragDelta.y * 1 * Game.DEG_2_RAD;
                }

                if (this._input.isMousePress(1)) this._camera.identity();

                this._scene.activeCamera = this._camera.mainCamera;

                this._scene.render();
                //this._mainRt.render(false, false);

                //this._postProcessManager.directRender([this._pp], null, true);
                //this._scene.activeCamera = this._camera.postProcessCamera;
                //this._scene.render();
            } else {
                this._scene.render();
            }

            this._input.tickEnd();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', (evt: UIEvent) => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');
    // Create the scene.
    game.createScene();

    // Start render loop.
    game.doRender();
});