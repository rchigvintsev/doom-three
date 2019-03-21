export class EntityFactory {
    constructor(assets) {
        this._assets = assets;
    }

    create(entityDef) {
        throw 'Method "create" is not implemented'
    }
}