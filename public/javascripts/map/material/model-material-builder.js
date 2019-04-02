import {ProjectiveTextureMaterialBuilder} from './projective-texture-material-builder.js';

export class ModelMaterialBuilder extends ProjectiveTextureMaterialBuilder {
    constructor(assetLoader) {
        super(assetLoader);
    }

    build(name, materialDef) {
        // Some textures may not be loaded in advance. We are going to load them here.
        this._assetLoader.loadTextures(materialDef);

        const material = super.build(name, materialDef);
        if (Array.isArray(material))
            material[0].side = THREE.FrontSide;
        else
            material.side = THREE.FrontSide;
        return material;
    }

    newPhongMaterial() {
        // return new DT.MeshPhongProjectiveTextureMaterial(this._projTexture);
        return super.newPhongMaterial();
    }
}
