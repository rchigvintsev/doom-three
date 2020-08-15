import {ProjectiveTextureMaterialFactory} from './projective-texture-material-factory.js';

export class ModelMaterialFactory extends ProjectiveTextureMaterialFactory {
    constructor(assetLoader) {
        super(assetLoader);
    }

    create(name, materialDef) {
        // Some textures may not be loaded in advance. We are going to load them here.
        this._assetLoader.loadTextures(materialDef);
        const material = super.create(name, materialDef);
        if (Array.isArray(material)) {
            material[0].side = THREE.FrontSide;
        } else {
            material.side = THREE.FrontSide;
        }
        return material;
    }
}
