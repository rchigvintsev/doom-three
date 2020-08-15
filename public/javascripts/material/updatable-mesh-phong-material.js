import {UpdatableMaterialMixin} from './updatable-material-mixin.js';

export class UpdatableMeshPhongMaterial extends UpdatableMaterialMixin(THREE.MeshPhongMaterial) {
    constructor(parameters) {
        super(parameters);
    }

    update(time) {
        this._updateColor(time);
    }
}
