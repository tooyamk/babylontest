class TestScene1 extends BaseScene {
    public static readonly EMISSIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(0.2, 0.2, 0.2);

    private _camera: CameraManager;
    private _light: BABYLON.ShadowLight;
    private _assetsManager: BABYLON.AssetsManager;
    private _ground: BABYLON.Mesh;
    private _input: Input;
    private _player: Player;
    private _skyBox: BABYLON.Mesh;
    private _shadowGenerator: BABYLON.ShadowGenerator;
    private _rt: BABYLON.RenderTargetTexture;
    private _mainRt: BABYLON.RenderTargetTexture;
    private _pp: BABYLON.PostProcess;
    private _numLoadedAssets: number;
    private _totalLoadAssets: number;
    private _postProcessManager: BABYLON.PostProcessManager;

    constructor() {
        super();

        this._totalLoadAssets = 0;
        this._numLoadedAssets = 0;
    }

    public start(): void {
        super.start();

        this._createSkybox();

        GameManager.ins.scene.clearColor.set(1, 0, 0, 1);

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new CameraManager();
        this._camera.setRotationXRange(-10.0 * GameManager.DEG_2_RAD, 90 * GameManager.DEG_2_RAD);
        this._input = new Input(GameManager.ins.canvas);
        this._player = new Player();
        //this._postProcessManager = new BABYLON.PostProcessManager(GameManager.ins.scene);

        // Attach the camera to the canvas.
        //this._camera.attachControl(this._canvas, false);

        //this._assetsManager = new BABYLON.AssetsManager(GameManager.ins.scene);
        //this._assetsManager.useDefaultLoadingScreen = false;

        this._rt = new BABYLON.RenderTargetTexture("", 1024, GameManager.ins.scene, false);
        this._rt.renderList.push(this._skyBox);

        this._mainRt = new BABYLON.RenderTargetTexture("", 2048, GameManager.ins.scene, false);
        //this._camera.mainCamera.renderTarget = this._mainRt;
        //this._mainRt.renderList = null;
        //this._scene.customRenderTargets.push(this._mainRt);
        //this._camera.mainCamera.customRenderTargets.push(this._mainRt);

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        
        let light: BABYLON.DirectionalLight = new BABYLON.DirectionalLight('light1', new BABYLON.Vector3(1, -1, 0), GameManager.ins.scene);
        light.position = new BABYLON.Vector3(-30, 30, 0);
        this._light = light;

        this._shadowGenerator = new BABYLON.ShadowGenerator(1024, this._light);
        this._shadowGenerator.useBlurExponentialShadowMap = true;
        this._shadowGenerator.bias = 0.01;
        
        //this._shadowGenerator.forceBackFacesOnly = true;

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
        if (this._ground) {
            this._ground.receiveShadows = true;
            let mat = new BABYLON.StandardMaterial("", GameManager.ins.scene);
            mat.emissiveColor = TestScene1.EMISSIVE_COLOR;
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

        /*
        let plane = BABYLON.MeshBuilder.CreatePlane("", { width: 6, height: 3 }, GameManager.ins.scene);
        plane.position.y = 2;
        plane.position.z = 2;
        let mat = new BABYLON.StandardMaterial("", GameManager.ins.scene);
        mat.emissiveTexture = this._rt;
        mat.disableLighting = true;
        mat.backFaceCulling = false;
        plane.material = mat;
        */

        /*
        let pp = new BABYLON.PostProcess("", "ppDrawTo", null, ["tex"], 0, this._camera.postProcessCamera);
        this._pp = pp;
        this._pp.onApply = (effect: BABYLON.Effect) => {
            effect.setTexture("tex", this._mainRt);
        };
        */

        /*
        let plane1 = BABYLON.MeshBuilder.CreatePlane("", { width: 6, height: 3 }, GameManager.ins.scene);
        plane1.position.y = 2;
        plane1.position.z = 2;
        plane1.position.x = -2;
        let mat1 = new BABYLON.ShaderMaterial("", GameManager.ins.scene, ResManager.ins.createShaderPath("oit", null), ResManager.ins.createShaderOptions(true, ["position"], ["worldViewProjection", "color"]));
        mat1.setColor4("color", new BABYLON.Color4(1, 0, 0, 0.5));
        mat1.backFaceCulling = false;
        plane1.material = mat1;
        //plane1.renderingGroupId = 1;

        let plane2 = BABYLON.MeshBuilder.CreatePlane("", { width: 6, height: 3 }, GameManager.ins.scene);
        plane2.position.y = 2;
        plane2.position.z = 3;
        plane2.position.x = 2;
        let mat2 = mat1.clone("");
        mat2.setColor4("color", new BABYLON.Color4(0, 1, 0, 0.5));
        mat2.backFaceCulling = false;
        plane2.material = mat2;
        */

        /*
        this._assetsManager.addMeshTask("", "", "res/test static model/", "test_one.babylon").onSuccess = (task : BABYLON.MeshAssetTask) => {
            if (task.loadedMeshes.length > 0) {
                let mesh = task.loadedMeshes[0];
                mesh.position.y = 2;
                let mat = mesh.material as BABYLON.StandardMaterial;
                mat.emissiveColor = Game.EMISSIVE_COLOR;
            }
        };
        */

        /*
        let s = GameManager.ins.scene;

        ResManager.ins.loadAssetContainer("res/bone anim model/model.babylon", info => {
            ResManager.ins.loadSkeleton("res/bone anim model/anim1.babylon", info2 => {
                ResManager.ins.loadSkeleton("res/bone anim model/anim2.babylon", info3 => {
                    let ac1 = info.data as BABYLON.AssetContainer;
                    let loadedSke1 = info2.data as BABYLON.Skeleton[];
                    let loadedSke2 = info3.data as BABYLON.Skeleton[];

                    let mesh = ac1.meshes[0];

                    GameManager.ins.scene.addMesh(mesh);

                    let ske = new BABYLON.Skeleton("", "", GameManager.ins.scene);

                    let range = SkeletonHelper.skeletonAppendAnimation(ske, loadedSke1[0]);
                    ske.createAnimationRange("anim1", range.x, range.y);

                    range = SkeletonHelper.skeletonAppendAnimation(ske, loadedSke2[0]);
                    ske.createAnimationRange("anim2", range.x, range.y);

                    mesh.skeleton = ske;

                    //mesh.skeleton.createAnimationRange("a", 0, 30);
                    //mesh.skeleton.createAnimationRange("b", 25, 30);
                    let anim1 = mesh.skeleton.beginAnimation("anim2", true);
                });
            });


            //ac.skeletons[0].createAnimationRange("a", 0, 5);
            //ac.skeletons[0].createAnimationRange("b", 25, 30);
            //let anim1 = ac.skeletons[0].beginAnimation("a", true);

            //setInterval(() => {
            //console.log(anim1.masterFrame);
            //}, 30);
        });
        */

        /*
        this._assetsManager.addMeshTask("", "", "res/bone anim model/", "Gremlin_walktest.babylon").onSuccess = (task: BABYLON.MeshAssetTask) => {
            if (task.loadedMeshes.length > 0) {
                let node = new BABYLON.TransformNode("", GameManager.ins.scene);
                node.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
                node.position.y = 2;
                let p = node.parent;
                for (let i = 0; i < task.loadedMeshes.length; i++) {
                    let mesh = task.loadedMeshes[i];
                    mesh.parent = node;
                    let mat = mesh.material as BABYLON.StandardMaterial;
                    if (mat != null) mat.emissiveColor = Game.EMISSIVE_COLOR;
                }

                for (let i = 0; i < task.loadedSkeletons.length; i++) {
                    let ske = task.loadedSkeletons[i];
                    ske.createAnimationRange("a", 0, 2);

                    GameManager.ins.scene.beginAnimation(ske, 0, 2, true);
                }
            }
        };
        */


        /*
        BABYLON.SceneLoader.ImportMesh("", "res/bone anim model3/", "aaa.babylon", GameManager.ins.scene, function (newMeshes: BABYLON.AbstractMesh[], particleSystems: BABYLON.ParticleSystem[], skeletons: BABYLON.Skeleton[], animationGroups: BABYLON.AnimationGroup[]) {
            
        }, null, (scene : BABYLON.Scene, msg : string, exception : any) => {
            let a = 1;
        });
        */

        /*
        let task1 = this._assetsManager.addMeshTask("111", "", "res/bone anim model3/", "aaa.babylon");
        task1.onSuccess = (task: BABYLON.MeshAssetTask) => {
            if (task.loadedMeshes.length > 0) {
                let node = new BABYLON.TransformNode("", GameManager.ins.scene);
                //node.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
                node.position.y = 2;
                let max = task.loadedMeshes.length;
                for (let i = 0; i < max; i++) {
                    let mesh = task.loadedMeshes[i];
                    mesh.parent = node;
                    let mat = mesh.material as BABYLON.StandardMaterial;
                    if (mat != null) mat.emissiveColor = Game.EMISSIVE_COLOR;
                }

                let ske = task.loadedSkeletons[1];
                ske.createAnimationRange("a", 0, 2);

                GameManager.ins.scene.beginAnimation(ske, 0, 30, true);
            }
        };
        task1.onError = (task: BABYLON.MeshAssetTask) => {
            let a = 1;
        };
        */

        ResManager.ins.loadTexture("res/earth.jpg", info => {
            if (!info.isError) {
                let tex = info.data as BABYLON.Texture;

                if (this._ground) {
                    let mat = this._ground.material as BABYLON.StandardMaterial;
                    mat.diffuseTexture = tex;
                }

                if (this._player) {
                    let mat = (this._player.getDisplay() as BABYLON.Mesh).material as BABYLON.StandardMaterial;
                    mat.diffuseTexture = tex;
                }
            }
        });

        /*
        let task2 = this._assetsManager.addTextureTask("", "res/earth.jpg");
        task2.runTask(s, () => {
            let mat = this._ground.material as BABYLON.StandardMaterial;
            mat.diffuseTexture = task2.texture;

            mat = (this._player.getDisplay() as BABYLON.Mesh).material as BABYLON.StandardMaterial;
            mat.diffuseTexture = task2.texture;
        }, null);
        */
    }

    private _createSkybox(): void {
        this._skyBox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, GameManager.ins.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", GameManager.ins.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("res/skybox/skybox", GameManager.ins.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this._skyBox.material = skyboxMaterial;
    }

    private _createGround(): void {
        this._ground = BABYLON.MeshBuilder.CreateGround('ground',
            { width: 6, height: 6, subdivisions: 2 }, GameManager.ins.scene);
    }

    private _createGroundWithHeightMap(): void {
        this._ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "res/worldHeightMap.jpg", 200, 200, 250, 0, 10, GameManager.ins.scene, false);
    }

    private _createPlayer(): void {
        let mesh = BABYLON.MeshBuilder.CreateBox("", { width: 1, height: 2, depth: 1 });
        mesh.position.y = 2;

        let mat = new BABYLON.StandardMaterial("", GameManager.ins.scene);
        mat.emissiveColor = TestScene1.EMISSIVE_COLOR;
        mesh.material = mat;

        this._player.setDisplay(mesh);

        this._camera.setTarget(mesh);
        this._camera.identity();

        //shadowGenerator.getShadowMap().renderList.push(sphere);
        this._shadowGenerator.addShadowCaster(mesh);
    }

    protected _onBeginFrame(evtData: BABYLON.Engine, evtState: BABYLON.EventState): void {
        if (this._input.isKeyPress("a")) this._player.getDisplay().translate(new BABYLON.Vector3(-1, 0, 0), 0.1, BABYLON.Space.LOCAL);
        if (this._input.isKeyPress("d")) this._player.getDisplay().translate(new BABYLON.Vector3(1, 0, 0), 0.1, BABYLON.Space.LOCAL);
        if (this._input.isKeyPress("w")) this._player.getDisplay().translate(new BABYLON.Vector3(0, 0, 1), 0.1, BABYLON.Space.LOCAL);
        if (this._input.isKeyPress("s")) this._player.getDisplay().translate(new BABYLON.Vector3(0, 0, -1), 0.1, BABYLON.Space.LOCAL);

        let mw = this._input.getMouseWheel();
        if (mw != 0) this._camera.mainCamera.position.z += mw * 0.01;

        let mlk = this._input.getMouseKeyInfo(0);
        if (mlk != null && mlk.isDragging) {
            this._camera.rotationY += mlk.dragDelta.x * 1 * GameManager.DEG_2_RAD;
        }

        let mrk = this._input.getMouseKeyInfo(2);
        if (mrk != null && mrk.isDragging) {
            this._player.getDisplay().rotation.y += mrk.dragDelta.x * 1 * GameManager.DEG_2_RAD;
            this._camera.rotationX += mrk.dragDelta.y * 1 * GameManager.DEG_2_RAD;
        }

        if (this._input.isMousePress(1)) this._camera.identity();
    }

    protected _onBeforeRender(evtData: BABYLON.Scene, evtState: BABYLON.EventState): void {
        this._rt.render(false, false);
    }

    protected _onAfterRender(evtData: BABYLON.Scene, evtState: BABYLON.EventState): void {
        if (this._numLoadedAssets == this._totalLoadAssets) {
            //this._mainRt.render(false, false);
            //this._postProcessManager.directRender([this._pp], null, true);
        }

        this._input.endFrame();
    }
}