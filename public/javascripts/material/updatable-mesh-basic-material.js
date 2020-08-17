import {UpdatableMaterialMixin} from './updatable-material-mixin.js';

export class UpdatableMeshBasicMaterial extends UpdatableMaterialMixin(THREE.MeshBasicMaterial) {
    constructor(parameters) {
        super(parameters);
    }

    update(time) {
        this._updateColor(time);
        this._updateOpacity(time);
        this._updateTransformMatrices(time);
    }
}
