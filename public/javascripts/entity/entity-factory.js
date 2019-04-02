export class EntityFactory {
    constructor(assetLoader) {
        this._assetLoader = assetLoader;
    }

    create(entityDef) {
        throw 'Method "create" is not implemented'
    }
}