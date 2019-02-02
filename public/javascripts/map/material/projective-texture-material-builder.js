import {MaterialBuilder} from './material-builder.js';
import {AssetLoader} from '../../asset-loader.js';
import {MeshPhongProjectiveTextureMaterial} from '../../util/material/mesh-phong-projective-texture-material.js';

export class ProjectiveTextureMaterialBuilder extends MaterialBuilder {
    constructor(assets, flashlight) {
        super(assets);
        this._flashlight = flashlight;
        this._projTexture = assets[AssetLoader.AssetType.TEXTURES]['lights/flashlight5'];
    }

    newPhongMaterial() {
        // return new MeshPhongProjectiveTextureMaterial(this._flashlight, this._projTexture);
        return new THREE.MeshPhongMaterial();
    }
}
