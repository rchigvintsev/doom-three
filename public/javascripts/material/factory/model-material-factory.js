import {ProjectiveTextureMaterialFactory} from './projective-texture-material-factory.js';

export class ModelMaterialFactory extends ProjectiveTextureMaterialFactory {
    constructor(assetLoader) {
        super(assetLoader);
    }

    create(name, materialDef) {
        // Some textures may not be loaded in advance. We are going to load them here.
        this._assetLoader.loadTextures(materialDef);
        return super.create(name, materialDef);
    }


    _setSide(materialDef, material) {
        material.side = THREE.FrontSide;
    }
}
