import {EntityFactory} from './entity-factory.js';

export class MeshFactory extends EntityFactory {
    constructor(assets, materialBuilder) {
        super(assets);
        this._materialBuilder = materialBuilder;
    }

    _createRegularMaterial(name, materialDef) {
        return this._materialBuilder.build(name, materialDef);
    }

    _createWireframeMaterial() {
        return this._materialBuilder.newBasicMaterial(true);
    }
}