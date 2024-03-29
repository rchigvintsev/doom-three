import {ShaderMaterial, Texture} from 'three';
import {ShaderMaterialParameters} from 'three/src/materials/ShaderMaterial';

import {UpdatableMaterial, UpdatableMaterialExtraParameters} from './updatable-material';
import {UpdatableTexture} from '../texture/updatable-texture';
import {MaterialKind} from './material-kind';

export class UpdatableShaderMaterial extends ShaderMaterial implements UpdatableMaterial {
    readonly updatableMaterial = true;
    readonly kind: MaterialKind;

    constructor(parameters?: ShaderMaterialParameters, extraParameters?: UpdatableMaterialExtraParameters) {
        super(parameters);
        this.kind = extraParameters?.kind || MaterialKind.METAL;
    }

    setParameters(params: Map<string, any>) {
        this.forEachMap(map => (<UpdatableTexture>map).setParameters(params), map => map instanceof UpdatableTexture);
    }

    update(deltaTime = 0) {
        if (this.visible) {
            this.updateMaps(deltaTime);
        }
    }

    private updateMaps(deltaTime: number) {
        this.forEachMap((map: Texture, i) => {
            (<UpdatableTexture>map).update(deltaTime);
            this.uniforms[`uv_transform${i + 1}`].value.copy(map.matrix);
        }, map => map instanceof UpdatableTexture);
    }

    private forEachMap(callbackFn: (map: Texture, index: number) => void,
                       filterFn: (map: Texture, index: number) => boolean = () => true) {
        for (let i = 0; ; i++) {
            const mapUniform = this.uniforms[`u_map${i + 1}`];
            if (!mapUniform) {
                break;
            }
            const map: Texture = mapUniform.value;
            if (filterFn(map, i)) {
                callbackFn(map, i);
            }
        }
    }
}
