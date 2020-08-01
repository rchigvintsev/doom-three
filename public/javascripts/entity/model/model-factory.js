import {MeshFactory} from '../mesh-factory.js';
import {GameWorld} from '../../game-world.js';

export class ModelFactory extends MeshFactory {
    constructor(type, assetLoader, materialBuilder) {
        super(assetLoader, materialBuilder);
        this._type = type;
    }

    create(entityDef) {
        const model = this._loadModel(entityDef);
        if (!model) {
            console.error(this._type + ' model "' + entityDef.model + '" is not found for entity "'
                + entityDef.name + '"');
            return null;
        }
        const materials = this._getMaterials(entityDef, model);
        const mesh = this._createModelMesh(entityDef, model, materials);
        mesh.scale.setScalar(GameWorld.WORLD_SCALE);
        this._positionMesh(mesh, entityDef.position);
        this._rotateMesh(mesh, entityDef.rotation);
        return mesh;
    }

    _loadModel(modelDef) {
        throw 'Method "_loadModel" is not implemented'
    }

    _createModelMesh(modelDef, model, materials) {
        throw 'Method "_createModelMesh" is not implemented'
    }

    _getMaterials(modelDef, model) {
        throw 'Method "_getMaterials" is not implemented'
    }

    _positionMesh(mesh, position) {
        throw 'Method "_positionMesh" is not implemented'
    }

    _rotateMesh(mesh, rotation) {
        throw 'Method "_rotateMesh" is not implemented'
    }
}
