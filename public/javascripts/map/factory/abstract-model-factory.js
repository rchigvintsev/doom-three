import {AbstractMeshFactory} from './abstract-mesh-factory.js';
import {Settings} from '../../settings.js';
import {Materials} from '../materials.js';
import {GameWorld} from '../../game-world.js';

export class AbstractModelFactory extends AbstractMeshFactory {
    constructor(materialBuilder, type) {
        super(materialBuilder);
        this._type = type;
    }

    loadModel() {
        throw 'Function "loadModel" is not implemented'
    }

    createModel(modelDef) {
        const model = this.loadModel(modelDef);
        let mesh;
        if (Settings.showWireframe || Settings.wireframeOnly)
            mesh = new THREE.SkinnedMesh(model.geometry, this.createWireframeMaterial());
        else {
            const materials = [];
            const declaredMaterials = modelDef.materials || model.materials;
            if (declaredMaterials)
                for (let i = 0; i < declaredMaterials.length; i++) {
                    const declaredMaterial = declaredMaterials[i];
                    const materialName = typeof declaredMaterial === 'string' ? declaredMaterial
                        : declaredMaterial.name;
                    const materialDef = Materials.definition[materialName];
                    if (!materialDef) {
                        console.error('Definition for material ' + materialName + ' is not found');
                        materials.push(new THREE.MeshPhongMaterial());
                    } else
                        materials.push(this.createRegularMaterial(materialName, materialDef));
                }

            if (materials.length === 0) {
                console.warn('Materials are not defined for ' + this._type + ' model ' + modelDef.name);
                materials.push(new THREE.MeshPhongMaterial());
            }

            mesh = new THREE.SkinnedMesh(model.geometry, materials);
        }

        mesh.scale.setScalar(GameWorld.WORLD_SCALE);
        mesh.position.fromArray(modelDef.position).multiplyScalar(GameWorld.WORLD_SCALE);
        this._rotateMesh(mesh);
        return mesh;
    }

    _rotateMesh() {
        // Override in subclasses
    }
}