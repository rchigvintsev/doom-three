import {MeshPhongMaterial, MeshPhongMaterialParameters} from 'three';

import {UpdatableMaterial} from './updatable-material';

export class UpdatableMeshPhongMaterial extends MeshPhongMaterial implements UpdatableMaterial {
    constructor(parameters?: UpdatableMeshPhongMaterialParameters) {
        super(parameters);
    }

    setParameters(_params: Map<string, any>) {
        // Do nothing for now
    }

    update(_deltaTime?: number) {
        // Do nothing for now
    }
}

export interface UpdatableMeshPhongMaterialParameters extends MeshPhongMaterialParameters {
    evalScope?: any;
}