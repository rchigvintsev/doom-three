import {MeshPhongMaterial, MeshPhongMaterialParameters} from 'three';

import {UpdatableMaterial} from './updatable-material';
import {MaterialKind} from './material-kind';
import {Objects} from '../util/objects';

export class UpdatableMeshPhongMaterial extends MeshPhongMaterial implements UpdatableMaterial {
    readonly updatableMaterial = true;
    readonly kind: MaterialKind;

    constructor(parameters?: UpdatableMeshPhongMaterialParameters) {
        super(Objects.narrowToParent(parameters));
        this.kind = parameters?.kind || MaterialKind.METAL;
    }

    setParameters(_params: Map<string, any>) {
        // Do nothing for now
    }

    update(_deltaTime?: number) {
        // Do nothing for now
    }
}

export interface UpdatableMeshPhongMaterialParameters extends MeshPhongMaterialParameters {
    kind: MaterialKind;
    evalScope?: any;
}
