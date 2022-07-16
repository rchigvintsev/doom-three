import {ShaderMaterial, Texture} from 'three';
import {ShaderMaterialParameters} from 'three/src/materials/ShaderMaterial';

import {UpdatableMaterial} from './updatable-material';
import {UpdatableTexture} from '../texture/updatable-texture';

export class UpdatableShaderMaterial extends ShaderMaterial implements UpdatableMaterial {
    constructor(parameters?: ShaderMaterialParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        this.updateMaps(deltaTime);
    }

    private updateMaps(deltaTime: number) {
        for (let i = 0; ; i++) {
            const mapUniform = this.uniforms[`u_map${i + 1}`];
            if (!mapUniform) {
                break;
            }

            const texture: Texture = mapUniform.value;
            if (texture instanceof UpdatableTexture) {
                texture.update(deltaTime);
                this.uniforms[`uv_transform${i + 1}`].value.copy(texture.matrix);
            }
        }
    }
}
