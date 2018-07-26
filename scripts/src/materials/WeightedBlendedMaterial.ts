class WeightedBlendedMaterial extends BABYLON.StandardMaterial {
    public static readonly ALPHATEST_FUNC_LESS = 1;
    public static readonly ALPHATEST_FUNC_GREATER = 2;

    public static readonly PASS_NONE = 0;
    public static readonly PASS_OPAQUE = 1;
    public static readonly PASS_TRANSPARENT = 2;

    private _pass: number;
    private _passID: number;

    constructor(name: string) {
        super(name, GameManager.ins.scene);

        this._pass = WeightedBlendedMaterial.PASS_NONE;
        this._passID = 0;
        this.useAlphaFromDiffuseTexture = true;

        this.customShaderNameResolve = (shaderName: string, uniforms: string[], uniformBuffers: string[], samplers: string[], defines: BABYLON.StandardMaterialDefines) => {
            return "WeightedBlended";
        }
    }

    public get pass(): number {
        return this._pass;
    }

    public set pass(value: number) {
        if (this._pass != value) {
            this._pass = value;
            ++this._passID;

            if (this._pass == WeightedBlendedMaterial.PASS_OPAQUE) {
                this.alphaMode = BABYLON.Engine.ALPHA_DISABLE;
                this.alphaCutOff = 0.99;
                this.disableDepthWrite = false;
            } else if (this._pass == WeightedBlendedMaterial.PASS_TRANSPARENT) {
                this.alphaCutOff = 0.99;
                this.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                this.disableDepthWrite = true;
            } else {
                this.alphaCutOff = 1.0;
                this.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                this.disableDepthWrite = false;
            }
        }
    }

    public needAlphaBlending(): boolean {
        if (this._pass == WeightedBlendedMaterial.PASS_OPAQUE) {
            return false;
        } else if (this._pass == WeightedBlendedMaterial.PASS_TRANSPARENT) {
            return true;
        } else {
            return super.needAlphaBlending();
        }
    }

    public needAlphaTesting(): boolean {
        if (this._pass == WeightedBlendedMaterial.PASS_NONE) {
            return super.needAlphaTesting();
        } else {
            return true;
        }
    }

    public clone(name: string): WeightedBlendedMaterial {
        let result = BABYLON.SerializationHelper.Clone(() => new WeightedBlendedMaterial(name), this);

        result.name = name;
        result.id = name;
        result.pass = this.pass;

        return result;
    }

    public isReadyForSubMesh(mesh: BABYLON.AbstractMesh, subMesh: BABYLON.SubMesh, useInstances: boolean = false): boolean {
        if (!subMesh._materialDefines) {
            subMesh._materialDefines = new BABYLON.StandardMaterialDefines();
        }

        let defines = <any>subMesh._materialDefines;
        
        if (this._pass == WeightedBlendedMaterial.PASS_TRANSPARENT) {
            defines.ALPHATEST_FUNC = WeightedBlendedMaterial.ALPHATEST_FUNC_GREATER;
        } else {
            defines.ALPHATEST_FUNC = WeightedBlendedMaterial.ALPHATEST_FUNC_LESS;
        }

        if (defines._passID !== this._passID) {
            defines._passID = this._passID;
            defines._renderId = 0;
        }

        return super.isReadyForSubMesh(mesh, subMesh, useInstances);
    }

    protected _shouldTurnAlphaTestOn(mesh: BABYLON.AbstractMesh): boolean {
        if (this._pass == WeightedBlendedMaterial.PASS_NONE) {
            return super._shouldTurnAlphaTestOn(mesh);
        } else {
            return true;
        }
    }
}