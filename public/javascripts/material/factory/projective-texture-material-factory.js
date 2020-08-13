import {BaseMaterialFactory} from './base-material-factory.js';
import {AssetLoader} from '../../asset-loader.js';
import {UpdatableMeshPhongMaterial} from '../updatable-mesh-phong-material.js';

export class ProjectiveTextureMaterialFactory extends BaseMaterialFactory {
    constructor(assetLoader) {
        super(assetLoader);
        this._projTexture = this._assetLoader.assets[AssetLoader.AssetType.TEXTURES]['lights/flashlight5'];
    }

    _createPhongMaterial() {
        // return new MeshPhongProjectiveTextureMaterial(this._projTexture);
        return new UpdatableMeshPhongMaterial();
    }
}
