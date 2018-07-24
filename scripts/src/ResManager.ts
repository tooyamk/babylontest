interface ResCallback {
    (info: ResInfo): void;
}


enum ResType {
    NULL,
    OTHER,
    TXT,
    BIN,
    TEX,
    ASSET_CONTAINER,
    SKELETON
}


class ResInfo {
    public loading: boolean;

    private _callbacks: ResCallback[];
    private _key: string;
    private _data: any;
    private _additionalInfo: any;
    private _dataType: ResType;
    private _error: string;
    private _isError: boolean;
    private _isDisposed: boolean;
    private _rc: number;

    constructor(key: string) {
        this._key = key;

        this.loading = true;
        this._data = null;
        this._dataType = ResType.NULL;
        this._isDisposed = false;
        this._isError = false;

        this._rc = 0;
        this._callbacks = [];
    }

    public get key(): string {
        return this._key;
    }

    public get data(): any {
        return this._data;
    }

    public get dataType(): ResType {
        return this._dataType;
    }

    public get additionalInfo(): any {
        return this._additionalInfo;
    }

    public get isError(): boolean {
        return this._isError;
    }

    public get error(): string {
        return this._error;
    }

    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    public retain(): void {
        ++this._rc;
    }

    public release(): void {
        if (--this._rc <= 0) this.dispose();
    }

    public dispose(): void {
        if (!this._isDisposed) {
            if (this.loading) {
                this._callbacks.length = 0;
                ResManager.ins.appendDelayDispose(this);
            } else {
                this._isDisposed = true;

                switch (this._dataType) {
                    case ResType.ASSET_CONTAINER:
                        ResManager.disposeAssetContainer(this._data as BABYLON.AssetContainer);
                        break;
                    case ResType.SKELETON:
                        (this._data as BABYLON.Skeleton).dispose();
                        break;
                    case ResType.TEX:
                        (this._data as BABYLON.Texture).dispose();
                        break;
                    default:
                        break;
                }

                this.setData(null, ResType.NULL);
                this._callbacks.length = 0;

                ResManager.ins.disposeResourceInfo(this);
            }
        }
    }

    public setError(msg:string = null): void {
        this._isError = true;
        if (msg) this._error = msg;
        this._data = null;
        this._dataType = ResType.NULL;
    }

    public setData(data: any, type: ResType, additionalInfo: any = null): void {
        this._data = data;
        this._dataType = type;
        this._additionalInfo = additionalInfo;
    }

    public done(): void {
        if (!this._isDisposed) {
            for (let func of this._callbacks) {
                func(this);
            }

            this._callbacks.length = 0;
        }
    }

    public addCallback(callback: ResCallback): void {
        if (callback && !this._isDisposed) {
            if (this.loading) {
                this._callbacks.push(callback);
            } else {
                callback(this);
            }
        }
    }

    public removeCallback(callback: ResCallback): void {
        if (callback && !this._isDisposed && this.loading) {
            let idx = this._callbacks.indexOf(callback);
            if (idx >= 0) this._callbacks.splice(idx, 1);
        }
    }
}


class ResManager {
    public static readonly RES_ROOT:string = "";
    //public static readonly RES_ROOT:string = "http://127.0.0.1/wwwroot/";

    public static readonly ins: ResManager = new ResManager();

    private _resMap: { [key: string]: ResInfo };
    private _delayDisposeRes: ResInfo[];

    constructor() {
        this._resMap = {};
        this._delayDisposeRes = [];
    }

    public static disposeAssetContainer(ac: BABYLON.AssetContainer): void {
        if (ac) {
            for (let value of ac.actionManagers) value.dispose(); 
            ac.actionManagers.length = 0;

            for (let value of ac.animationGroups) value.dispose();
            ac.animationGroups.length = 0;

            for (let value of ac.cameras) value.dispose();
            ac.cameras.length = 0;

            for (let value of ac.effectLayers) value.dispose();
            ac.effectLayers.length = 0;

            for (let value of ac.geometries) value.dispose();
            ac.geometries.length = 0;

            for (let value of ac.lensFlareSystems) value.dispose();
            ac.lensFlareSystems.length = 0;

            for (let value of ac.lights) value.dispose();
            ac.lights.length = 0;

            for (let value of ac.materials) value.dispose();
            ac.materials.length = 0;

            for (let value of ac.meshes) value.dispose();
            ac.meshes.length = 0;

            for (let value of ac.multiMaterials) value.dispose();
            ac.multiMaterials.length = 0;

            for (let value of ac.particleSystems) value.dispose();
            ac.particleSystems.length = 0;

            for (let value of ac.shadowGenerators) value.dispose();
            ac.shadowGenerators.length = 0;

            for (let value of ac.skeletons) value.dispose();
            ac.skeletons.length = 0;

            for (let value of ac.sounds) value.dispose();
            ac.sounds.length = 0;

            for (let value of ac.textures) value.dispose();
            ac.textures.length = 0;

            for (let value of ac.transformNodes) value.dispose();
            ac.transformNodes.length = 0;
        }
    }

    public tick(): void {
        let num = this._delayDisposeRes.length;
        if (num > 0) {
            let arr: ResInfo[] = [];
            let curIdx = 0, endIdx = num - 1;
            do {
                let info = this._delayDisposeRes[curIdx];
                if (info.loading) {
                    ++curIdx;
                } else {
                    this._delayDisposeRes[curIdx] = this._delayDisposeRes[endIdx];
                    --endIdx;

                    arr.push(info);
                }
            } while (curIdx <= endIdx);

            if (arr.length > 0) {
                this._delayDisposeRes.length -= arr.length;

                for (let info of arr) info.dispose();
            }
        }
    }

    public appendDelayDispose(info: ResInfo): void {
        if (info) {
            delete this._resMap[info.key];
            this._delayDisposeRes.push(info);
        }
    }

    public disposeResourceInfoWithURL(url: string): void {
        this.disposeResourceInfo(this._resMap[url]);
    }

    public disposeResourceInfo(info: ResInfo): void {
        if (info) {
            delete this._resMap[info.key];
            info.dispose();
        }
    }

    public getResInfo(url: string): ResInfo {
        return this._resMap[url];
    }

    public unload(url: string): void {
        let ri = this._resMap[url];
        if (ri) ri.release();
    }

    public load(url: string, useArrayBuffer: boolean = false): ResInfo {
        let info = this._resMap[url];
        if (info) {
            info.retain();
        } else {
            info = new ResInfo(url);
            info.retain();
            this._resMap[url] = info;

            BABYLON.Tools.LoadFile(ResManager.RES_ROOT + url + "?ts=" + GameManager.ins.getTimestamp().toString(), (data: string | ArrayBuffer, responseURL: string) => {
                if (!data) data = null;
                if (!info.isDisposed) {
                    info.loading = false;
                    info.setData(data, useArrayBuffer ? ResType.BIN : ResType.TXT);
                    info.done();
                }
            }, null, null, useArrayBuffer, (request: XMLHttpRequest, exception: any) => {
                info.loading = false;
                info.setError("res not found");
                info.done();
            });
        }

        return info;
    }

    public addResCallback(url: string, callback?: ResCallback, useArrayBuffer: boolean = false): void {
        let ri = this._resMap[url];
        if (ri) {
            ri.addCallback(callback);
        } else {
            this.load(url, useArrayBuffer).addCallback(callback);
        }
    }

    public removeResCallback(url: string, callback?: ResCallback): void {
        let ri = this._resMap[url];
        if (ri) ri.removeCallback(callback);
    }

    public loadAssetContainer(url: string, callback?: ResCallback): void {
        let root = "";
        let idx =  url.lastIndexOf("/");
        if (idx >= 0) root = url.substr(0, idx + 1);

        this.addResCallback(url, info => {
            if (!info.isError && info.dataType == ResType.TXT) {
                let plugin = BABYLON.SceneLoader.GetPluginForExtension(".babylon") as BABYLON.ISceneLoaderPlugin;
                let ac = plugin.loadAssetContainer(GameManager.ins.scene, info.data as string, root, (msg: string, exception: any) => {
                    info.setError(msg);
                });
                
                if (!info.isDisposed) {
                    if (info.isError) {
                        info.setError();
                    } else {
                        info.setData(ac, ResType.ASSET_CONTAINER);
                    }
                }
            }
        });

        this.addResCallback(url, callback);
    }

    public loadSkeleton(url: string, callback?: ResCallback): void {
        this.addResCallback(url, info => {
            if (!info.isError && info.dataType == ResType.TXT) {
                let parsedData = JSON.parse(info.data);
                if (parsedData.skeletons) {
                    let skeletons: BABYLON.Skeleton[] = [];
                    let skeletonsHighestAnimationFrame: BABYLON.Vector2[] = [];
                    let scene = GameManager.ins.scene;
                    for (let index = 0, cache = parsedData.skeletons.length; index < cache; ++index) {
                        let parsedSkeleton = parsedData.skeletons[index];
                        let skeleton = BABYLON.Skeleton.Parse(parsedSkeleton, scene);
                        skeletons.push(skeleton);

                        let range = SkeletonHelper.getSkeletonAnimationRange(skeleton);

                        skeletonsHighestAnimationFrame.push(range);
                    }

                    if (skeletons.length > 0) {
                        info.setData(skeletons, ResType.SKELETON, skeletonsHighestAnimationFrame);
                    } else {
                        info.setError("no skeleton");
                    }
                }
            }
        });

        this.addResCallback(url, callback);
    }

    public loadTexture(url: string, callback?: ResCallback, noMipmap?: boolean, invertY?: boolean, samplingMode?: number, format?: number): void {
        this.addResCallback(url, info => {
            if (!info.isError && info.dataType == ResType.BIN) {
                let tex = new BABYLON.Texture(url, GameManager.ins.scene, noMipmap, invertY, samplingMode, () => {
                }, (msg: string, exception: any) => {
                    info.setError(msg);
                }, info.data, null, format);

                if (!info.isDisposed) {
                    if (info.isError) {
                        info.setError();
                    } else {
                        info.setData(tex, ResType.TEX);
                    }
                }
            }
        }, true);

        this.addResCallback(url, callback);
    }

    public updateShander(vertName: string, vertCode: string, fragName: string, fragCode: string): void {
        if (vertName && vertCode && vertName.length > 0) {
            BABYLON.Effect.ShadersStore[vertName + "VertexShader"] = vertCode;
        } 

        if (fragName && fragCode && fragName.length > 0) {
            BABYLON.Effect.ShadersStore[fragName + "FragmentShader"] = fragCode;
        } 
    }

    public createShaderPath(vert: string, frag: string = null): any {
        if (!frag) frag = vert;
        return {
            vertexElement: vert,
            fragmentElement: frag
        };
    }

    public createShaderOptions(needAlphaTesting: boolean = false, needAlphaBlending: boolean = false, 
        attributes: string[] = null, uniforms: string[] = null, samplers: string[] = null, 
        defines: string[] = null, undefines: string[] = null): any {
        let opt: any = {};

        opt.needAlphaTesting = needAlphaTesting;
        opt.needAlphaBlending = needAlphaBlending;

        if (attributes) opt.attributes = attributes;
        if (uniforms) opt.uniforms = uniforms;
        if (samplers) opt.samplers = samplers;

        if (defines || undefines) {
            let defs: string[] = [];
            if (defines) for (const value of defines) defs.push("#define " + value);
            if (undefines) for (const value of undefines) defs.push("#define " + value);

            opt.defines = defs;
        }

        return opt;
    }

    public disassembleFileNameFromPath(path: string): string {
        let name = path;
        let idx = path.lastIndexOf("/");
        if (idx >= 0) name = name.substr(idx + 1);
        idx = name.lastIndexOf(".");
        if (idx >= 0) name = name.substr(0, idx);

        return name;
    }
}