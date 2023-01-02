import {MeshBasicMaterial, Texture} from 'three';
import {MeshBasicMaterialParameters} from 'three/src/materials/MeshBasicMaterial';

import {EvalFunction} from 'mathjs';

import {UpdatableMaterial, updateOpacity} from './updatable-material';
import {UpdatableTexture} from '../texture/updatable-texture';

export class UpdatableMeshBasicMaterial extends MeshBasicMaterial implements UpdatableMaterial {
    readonly updatableMaterial = true;

    evalScope: any;
    opacityExpression?: EvalFunction;

    constructor(parameters?: UpdatableMeshBasicMaterialParameters) {
        super(parameters);
        if (parameters && parameters.evalScope) {
            this.evalScope = {...parameters.evalScope, ...{time: 0}};
        } else {
            this.evalScope = {time: 0};
        }
    }

    setParameters(params: Map<string, any>) {
        this.forEachMap(map => (<UpdatableTexture>map).setParameters(params), map => map instanceof UpdatableTexture);
    }

    update(deltaTime = 0) {
        if (this.visible) {
            this.updateMaps(deltaTime);
            updateOpacity(this);
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

export interface UpdatableMeshBasicMaterialParameters extends MeshBasicMaterialParameters {
    evalScope?: any;
}