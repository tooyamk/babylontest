class TestOITRenderScene extends AbstractLogicScene {
    public static readonly EMISSIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(0.2, 0.2, 0.2);

    private _camera: CameraManager;
    private _light: BABYLON.ShadowLight;
    private _assetsManager: BABYLON.AssetsManager;
    private _ground: BABYLON.Mesh;
    private _skyBox: BABYLON.Mesh;
    private _shadowGenerator: BABYLON.ShadowGenerator;
    private _rt: BABYLON.RenderTargetTexture;
    private _mainRt: RenderTexture;
    private _pp: BABYLON.PostProcess;
    private _numLoadedAssets: number;
    private _totalLoadAssets: number;
    private _postProcessManager: BABYLON.PostProcessManager;

    constructor() {
        super();

        this._totalLoadAssets = 0;
        this._numLoadedAssets = 0;
    }

    public activate(): void {
        super.activate();

        this._createSkybox();

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new CameraManager();
        this._camera.setRotationXRange(-10.0 * GameManager.DEG_2_RAD, 90 * GameManager.DEG_2_RAD);
        this._postProcessManager = new BABYLON.PostProcessManager(GameManager.ins.scene);

        this._rt = new BABYLON.RenderTargetTexture("", 1024, GameManager.ins.scene, false);
        this._rt.renderList.push(this._skyBox);

        let mesh1 = BABYLON.MeshBuilder.CreateBox("player1", { width: 1, height: 2, depth: 1 });
        mesh1.layerMask = 1;
        mesh1.position.y = 4000;
        //mesh1.parent = mesh;
        //mesh1.position.x = 0;

        this._mainRt = new RenderTexture("", 2048, false);
        this._mainRt.renderList = null;
        this._mainRt.clearBackBuffer = false;
        this._mainRt.clearDepth = false;
        this._mainRt.clearStencil = false;
        this._camera.mainCamera.renderTarget = this._mainRt;

        let setPass = (pass: number) => {
            let meshes = GameManager.ins.scene.getActiveMeshes().data;
            let len = GameManager.ins.scene.getActiveMeshes().length;
            for (let i = 0; i < len; ++i) {
                let mat = meshes[i].material;
                if (mat) (mat as WeightedBlendedMaterial).pass = pass;
            }
        };
        
        //this._scene.customRenderTargets.push(this._mainRt);
        //this._camera.mainCamera.customRenderTargets.push(this._mainRt);
        let mask = this._camera.mainCamera.layerMask;
        //this._camera.mainCamera.layerMask = mask;
        this._camera.mainCamera.onRenderFinish = camera => {
            this._camera.mainCamera.layerMask = 1;

            GameManager.ins.scene.unfreezeActiveMeshes();
            GameManager.ins.scene.freezeActiveMeshes();
            GameManager.ins.scene.unfreezeActiveMeshes();

            setPass(WeightedBlendedMaterial.PASS_TRANSPARENT);
            this._mainRt.render(false, false);
            setPass(WeightedBlendedMaterial.PASS_OPAQUE);

            this._camera.mainCamera.layerMask = mask;
        };

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        
        let light: BABYLON.DirectionalLight = new BABYLON.DirectionalLight('light1', new BABYLON.Vector3(1, -1, 0), GameManager.ins.scene);
        light.position = new BABYLON.Vector3(-30, 30, 0);
        this._light = light;

        this._shadowGenerator = new BABYLON.ShadowGenerator(1024, this._light);
        this._shadowGenerator.useBlurExponentialShadowMap = true;
        this._shadowGenerator.bias = 0.01;

        this._createPlayer();

        // Create a built-in "ground" shape.
        //this._createGround();
        this._createGroundWithHeightMap();
        if (this._ground) {
            this._ground.receiveShadows = true;
            let mat = new BABYLON.StandardMaterial("", GameManager.ins.scene);
            mat.emissiveColor = TestScene1.EMISSIVE_COLOR;
            this._ground.material = mat;
        }

        let pp = new BABYLON.PostProcess("", "ppDrawTo", null, ["tex"], 0, this._camera.postProcessCamera);
        this._pp = pp;
        this._pp.onApply = (effect: BABYLON.Effect) => {
            effect.setTexture("tex", this._mainRt);
        };

        ResManager.ins.loadTexture("res/tex.png", info => {
            if (!info.isError) {
                let tex = info.data as BABYLON.Texture;
                tex.hasAlpha = true;

                let plane1 = BABYLON.MeshBuilder.CreatePlane("aa", { width: 6, height: 3 }, GameManager.ins.scene);
                plane1.layerMask = 1;
                plane1.position.y = 2;
                plane1.position.z = 2;
                plane1.position.x = -0;
                //plane1.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI * 0.3, BABYLON.Space.LOCAL);
                //let opt = ResManager.ins.createShaderOptions(true, true, ["position"], ["worldViewProjection", "color"]);
                //let mat1 = new BABYLON.ShaderMaterial("", GameManager.ins.scene, ResManager.ins.createShaderPath("WeightedBlended", null), opt);
                let mat1 = new WeightedBlendedMaterial("");
                mat1.emissiveColor = new BABYLON.Color3(1, 0, 0);
                mat1.diffuseTexture = tex;
                mat1.pass = WeightedBlendedMaterial.PASS_OPAQUE;
                //mat1.setColor4("color", new BABYLON.Color4(1, 0, 0, 0.5));
                mat1.backFaceCulling = false;
                plane1.material = mat1;
                //plane1.renderingGroupId = 10;

                let plane2 = BABYLON.MeshBuilder.CreatePlane("bb", { width: 6, height: 3 }, GameManager.ins.scene);
                plane2.layerMask = 1;
                plane2.position.y = 2;
                plane2.position.z = 3;
                plane2.position.x = 2;
                let mat2 = mat1.clone("");
                //mat2.setColor4("color", new BABYLON.Color4(0, 1, 0, 0.5));
                mat2.emissiveColor = new BABYLON.Color3(0, 1, 0);
                mat2.backFaceCulling = false;
                plane2.material = mat2;
            }
        });

        ResManager.ins.loadTexture("res/earth.jpg", info => {
            if (!info.isError) {
                let tex = info.data as BABYLON.Texture;

                if (this._ground) {
                    let mat = this._ground.material as BABYLON.StandardMaterial;
                    mat.diffuseTexture = tex;
                }

                if (Player.self) {
                    Player.self.displayContainer.getChildMeshes(true, node => {
                        let mat = (node as BABYLON.Mesh).material as BABYLON.StandardMaterial;
                        if (mat) mat.diffuseTexture = tex;
                        return false;
                    });
                }
            }
        });
    }

    private _createSkybox(): void {
        this._skyBox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, GameManager.ins.scene);
        this._skyBox.layerMask = 0x0FFFFFFF & ~0b1;
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
        this._ground.layerMask = 0x0FFFFFFF & ~0b1;
    }

    private _createPlayer(): void {
        let player = new Player();
        Player.self = player;

        let mesh = BABYLON.MeshBuilder.CreateBox("player", { width: 1, height: 2, depth: 1 });
        mesh.layerMask = 0x0FFFFFFF & ~0b1;
        mesh.position.y = 2;

        let mat = new BABYLON.StandardMaterial("", GameManager.ins.scene);
        mat.emissiveColor = TestScene1.EMISSIVE_COLOR;
        mesh.material = mat;

        //let mesh1 = mesh.clone("");
        //mesh1.parent = mesh;
        //mesh1.position.x = 0;

        mesh.parent = player.displayContainer;
        //this._player.root.setEnabled(false);
        //this._player.root.dispose(true);

        this._camera.setTarget(mesh);
        this._camera.identity();

        //shadowGenerator.getShadowMap().renderList.push(sphere);
        this._shadowGenerator.addShadowCaster(mesh);

        LogicSceneManager.ins.scene.addEntity(player);
        player.behavior = new KeyboardMouseBehavior();
    }

    protected _onBeginFrame(evtData: BABYLON.Engine, evtState: BABYLON.EventState): void {
        let mw = InputManager.ins.getMouseWheel();
        if (mw != 0) this._camera.mainCamera.position.z += mw * 0.01;

        let mlk = InputManager.ins.getMouseKeyInfo(0);
        if (mlk != null && mlk.isDragging) {
            this._camera.rotationY += mlk.dragDelta.x * 1 * GameManager.DEG_2_RAD;
        }

        let mrk = InputManager.ins.getMouseKeyInfo(2);
        if (mrk != null && mrk.isDragging) {
            this._camera.rotationX += mrk.dragDelta.y * 1 * GameManager.DEG_2_RAD;
        }

        if (InputManager.ins.isMousePress(1)) this._camera.identity();
    }

    protected _onBeforeRender(evtData: BABYLON.Scene, evtState: BABYLON.EventState): void {
        this._rt.render(false, false);
    }

    protected _onAfterRender(evtData: BABYLON.Scene, evtState: BABYLON.EventState): void {
        if (this._numLoadedAssets == this._totalLoadAssets) {
            //this._mainRt.render(false, false);
            this._postProcessManager.directRender([this._pp], null, true);
        }
    }
}