import {MaterialBuilder} from './material-builder.js';
import {AssetLoader} from '../../asset-loader.js';

export class ProjectiveTextureMaterialBuilder extends MaterialBuilder {
    constructor(assetLoader) {
        super(assetLoader);
        this._projTexture = this._assetLoader.assets[AssetLoader.AssetType.TEXTURES]['lights/flashlight5'];
    }

    newPhongMaterial() {
        // return new MeshPhongProjectiveTextureMaterial(this._projTexture);
        return new THREE.MeshPhongMaterial();
    }
}
