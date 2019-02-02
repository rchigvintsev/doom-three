import {ProjectiveTextureMaterialBuilder} from './projective-texture-material-builder.js';
import {AssetLoader} from '../../asset-loader.js';

export class ModelMaterialBuilder extends ProjectiveTextureMaterialBuilder {
    constructor(assets, flashlight) {
        super(assets, flashlight);
        this._tgaLoader = new THREE.TGALoader();
    }

    build(name, materialDefinition) {
        // Some textures may not be loaded in advance. We are going to load them here.

        if (materialDefinition.diffuseMap) {
            const diffuseMapName = typeof materialDefinition.diffuseMap === 'string' ? materialDefinition.diffuseMap
                : materialDefinition.diffuseMap.name;
            let diffuseMap = this._assets[AssetLoader.AssetType.TEXTURES][diffuseMapName];
            if (!diffuseMap) {
                diffuseMap = this._tgaLoader.load(diffuseMapName + '.tga');
                diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
                this._assets[AssetLoader.AssetType.TEXTURES][diffuseMapName] = diffuseMap;
            }
        }

        if (materialDefinition.normalMap) {
            const normalMapName = typeof materialDefinition.normalMap === 'string' ? materialDefinition.normalMap
                : materialDefinition.normalMap.name;
            let normalMap = this._assets[AssetLoader.AssetType.TEXTURES][normalMapName];
            if (!normalMap) {
                normalMap = this._tgaLoader.load(normalMapName + '.tga');
                normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
                this._assets[AssetLoader.AssetType.TEXTURES][normalMapName] = normalMap;
            }
        }

        if (materialDefinition.specularMap) {
            const specularMapName = typeof materialDefinition.specularMap === 'string' ? materialDefinition.specularMap
                : materialDefinition.specularMap.name;
            let specularMap = this._assets[AssetLoader.AssetType.TEXTURES][specularMapName];
            if (!specularMap) {
                specularMap = this._tgaLoader.load(specularMapName + '.tga');
                specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
                this._assets[AssetLoader.AssetType.TEXTURES][specularMapName] = specularMap;
            }
        }

        if (materialDefinition.additionalMap) {
            const additionalMapName = typeof materialDefinition.additionalMap === 'string'
                ? materialDefinition.additionalMap : materialDefinition.additionalMap.name;
            let additionalMap = this._assets[AssetLoader.AssetType.TEXTURES][additionalMapName];
            if (!additionalMap) {
                additionalMap = this._tgaLoader.load(additionalMapName + '.tga');
                additionalMap.wrapS = additionalMap.wrapT = THREE.RepeatWrapping;
                this._assets[AssetLoader.AssetType.TEXTURES][additionalMapName] = additionalMap;
            }
        }

        const material = super.build(name, materialDefinition);
        if (Array.isArray(material))
            material[0].side = THREE.FrontSide;
        else
            material.side = THREE.FrontSide;
        return material;
    }

    newPhongMaterial() {
        /*if (this._flashlight && this._projTexture)
            return new DT.MeshPhongProjectiveTextureMaterial(this._flashlight, this._projTexture);*/
        return super.newPhongMaterial();
    }
}
