import {MD5Loader} from '../../loader/md5-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {ModelMaterialFactory} from '../../material/factory/model-material-factory.js';
import {Settings} from '../../settings.js';
import {MATERIALS} from '../../material/materials.js';
import {ModelFactory} from './model-factory.js';
import {GameWorld} from '../../game-world.js';

export class Md5ModelFactory extends ModelFactory {
    constructor(assetLoader) {
        super('MD5', assetLoader, new Md5ModelMaterialFactory(assetLoader));
        this.md5Loader = new MD5Loader();
    }

    static isMD5Model(modelName) {
        return modelName.toLowerCase().indexOf('.md5mesh') > 0;
    }

    _loadModel(modelDef) {
        const model = this._assetLoader.assets[AssetLoader.AssetType.MODELS][modelDef.model];
        const animations = [];
        for (let i = 0; i < modelDef.animations.length; i++) {
            animations.push(this._assetLoader.assets[AssetLoader.AssetType.ANIMATIONS][modelDef.animations[i]]);
        }
        return this.md5Loader.load(model, animations);
    }

    _getMaterials(modelDef, model) {
        const materials = {main: [], additional: [], gui: []};

        if (Settings.showWireframe || Settings.wireframeOnly) {
            materials.main.push(this._createWireframeMaterial());
        } else {
            const declaredMaterials = modelDef.materials || model.materials;
            if (declaredMaterials) {
                for (let i = 0; i < declaredMaterials.length; i++) {
                    const declaredMaterial = declaredMaterials[i];
                    const materialName = typeof declaredMaterial === 'string'
                        ? declaredMaterial
                        : declaredMaterial.name;
                    const materialDef = MATERIALS[materialName];
                    if (!materialDef) {
                        console.error('Definition for material ' + materialName + ' is not found');
                        materials.main.push(new THREE.MeshPhongMaterial());
                    } else {
                        materials.main = materials.main.concat(this._createRegularMaterial(materialName, materialDef));
                    }
                }
            }

            if (materials.main.length === 0) {
                console.warn('Materials are not defined for MD5 model ' + modelDef.name);
                materials.main.push(new THREE.MeshPhongMaterial());
            }
        }

        return materials;
    }

    _createModelMesh(modelDef, model, materials) {
        return new THREE.Mesh(model.geometry, materials.main);
    }

    _createWireframeMaterial() {
        const material = super._createWireframeMaterial();
        material.skinning = true;
        return material;
    }

    _positionMesh(mesh, position) {
        mesh.position.fromArray(position).multiplyScalar(GameWorld.WORLD_SCALE);
    }

    _rotateMesh(mesh, rotation) {
        mesh.rotation.set(THREE.Math.degToRad(-90), 0, THREE.Math.degToRad(90));
    }
}

class Md5ModelMaterialFactory extends ModelMaterialFactory {
    create(name, materialDefinition) {
        const materials = super.create(name, materialDefinition);
        materials[0].skinning = true;
        return materials;
    }
}
