import {BaseMaterialFactory} from './base-material-factory.js';
import {UpdatableShaderMaterial} from '../updatable-shader-material.js';

export class GuiMaterialFactory extends BaseMaterialFactory {
    constructor(assetLoader) {
        super(assetLoader);
    }

    clone() {
        return new GuiMaterialFactory(this._assetLoader);
    }

    create(name, materialDef) {
        // Some textures may not be loaded in advance. We are going to load them here.
        this._assetLoader.loadTextures(materialDef);
        return super.create(name, materialDef);
    }

    _createShaderMaterial(name, definition) {
        const basicShaderLib = THREE.ShaderLib['basic'];
        return new UpdatableShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(basicShaderLib.uniforms),
            vertexShader: basicShaderLib.vertexShader,
            fragmentShader: basicShaderLib.fragmentShader
        });
    }

    _setSide(materialDef, material) {
        material.side = THREE.DoubleSide;
    }
}
