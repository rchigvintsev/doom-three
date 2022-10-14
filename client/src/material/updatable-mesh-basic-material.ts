import {MeshBasicMaterial, Texture} from 'three';
import {UpdatableMaterial} from './updatable-material';
import {MeshBasicMaterialParameters} from 'three/src/materials/MeshBasicMaterial';
import {UpdatableTexture} from '../texture/updatable-texture';

export class UpdatableMeshBasicMaterial extends MeshBasicMaterial implements UpdatableMaterial {
    constructor(parameters?: MeshBasicMaterialParameters) {
        super(parameters);
    }

    setParameters(params: Map<string, any>) {
        this.forEachMap(map => (<UpdatableTexture>map).setParameters(params), map => map instanceof UpdatableTexture);
    }

    update(deltaTime = 0): void {
        if (this.visible) {
            this.updateMaps(deltaTime);
        }
    }

    private updateMaps(deltaTime: number) {
        this.forEachMap(map => (<UpdatableTexture>map).update(deltaTime), map => map instanceof UpdatableTexture);
    }

    private forEachMap(callbackFn: (map: Texture) => void, filterFn: (map: Texture) => boolean = () => true) {
        if (this.map && filterFn(this.map)) {
            callbackFn(this.map);
        }
        if (this.specularMap && filterFn(this.specularMap)) {
            callbackFn(this.specularMap);
        }
        if (this.alphaMap && this.alphaMap !== this.map && filterFn(this.alphaMap)) {
            callbackFn(this.alphaMap);
        }
    }
}