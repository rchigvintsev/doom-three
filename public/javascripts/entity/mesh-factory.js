import {EntityFactory} from './entity-factory.js';

export class MeshFactory extends EntityFactory {
    constructor(assetLoader, materialBuilder) {
        super(assetLoader);
        this._materialBuilder = materialBuilder;
    }

    _createRegularMaterial(name, materialDef) {
        return this._materialBuilder.create(name, materialDef);
    }

    _createWireframeMaterial() {
        return this._materialBuilder._createBasicMaterial(true);
    }
}
