import {MeshPhongMaterial, MeshPhongMaterialParameters} from 'three';

import {UpdatableMaterial, UpdatableMaterialExtraParameters} from './updatable-material';
import {MaterialKind} from './material-kind';

export class UpdatableMeshPhongMaterial extends MeshPhongMaterial implements UpdatableMaterial {
    readonly updatableMaterial = true;
    readonly kind: MaterialKind;

    constructor(parameters?: MeshPhongMaterialParameters, extraParameters?: UpdatableMaterialExtraParameters) {
        super(parameters);
        this.kind = extraParameters?.kind || MaterialKind.METAL;
    }

    setParameters(_params: Map<string, any>) {
        // Do nothing for now
    }

    update(_deltaTime?: number) {
        // Do nothing for now
    }
}
