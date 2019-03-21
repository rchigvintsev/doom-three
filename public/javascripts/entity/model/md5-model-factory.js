import {MD5Loader} from '../../loader/md5-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {ModelMaterialBuilder} from '../../map/material/model-material-builder.js';
import {Settings} from '../../settings.js';
import {Materials} from '../../map/materials.js';
import {GameWorld} from '../../game-world.js';
import {MeshFactory} from '../mesh-factory.js';

export class Md5ModelFactory extends MeshFactory {
    constructor(assets, flashlight) {
        super(assets, new Md5ModelMaterialBuilder(assets, flashlight));
        this.md5Loader = new MD5Loader();
    }

    static isMD5Model(modelName) {
        return modelName.toLowerCase().indexOf('.md5mesh') > 0;
    }

    create(entityDef) {
        const model = this._loadModel(entityDef);
        let mesh;
        if (Settings.showWireframe || Settings.wireframeOnly)
            mesh = new THREE.SkinnedMesh(model.geometry, this._createWireframeMaterial());
        else {
            const materials = [];
            const declaredMaterials = entityDef.materials || model.materials;
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
                        materials.push(this._createRegularMaterial(materialName, materialDef));
                }

            if (materials.length === 0) {
                console.warn('Materials are not defined for MD5 model ' + entityDef.name);
                materials.push(new THREE.MeshPhongMaterial());
            }

            mesh = new THREE.SkinnedMesh(model.geometry, materials);
        }

        mesh.scale.setScalar(GameWorld.WORLD_SCALE);
        mesh.position.fromArray(entityDef.position).multiplyScalar(GameWorld.WORLD_SCALE);
        this._rotateMesh(mesh);
        return mesh;
    }

    _loadModel(modelDef) {
        const model = this._assets[AssetLoader.AssetType.MODELS][modelDef.model];
        const animations = [];
        for (let i = 0; i < modelDef.animations.length; i++)
            animations.push(this._assets[AssetLoader.AssetType.ANIMATIONS][modelDef.animations[i]]);
        return this.md5Loader.load(model, animations);
    }

    _createWireframeMaterial() {
        const material = super._createWireframeMaterial();
        material.skinning = true;
        return material;
    }

    // noinspection JSMethodCanBeStatic
    _rotateMesh(mesh) {
        mesh.rotation.set(THREE.Math.degToRad(-90), 0, THREE.Math.degToRad(90));
    }
}

class Md5ModelMaterialBuilder extends ModelMaterialBuilder {
    build(name, materialDefinition) {
        const material = super.build(name, materialDefinition);
        if (Array.isArray(material))
            material[0].skinning = true;
        else
            material.skinning = true;
        return material;
    }
}
