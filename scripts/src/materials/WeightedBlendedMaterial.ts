class WeightedBlendedMaterial extends BABYLON.StandardMaterial {
    constructor(name: string) {
        super(name, GameManager.ins.scene);

        this.customShaderNameResolve = (shaderName: string, uniforms: string[], uniformBuffers: string[], samplers: string[], defines: BABYLON.StandardMaterialDefines) => {
            return "WeightedBlended";
        }
    }
}