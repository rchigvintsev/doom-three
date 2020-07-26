import {AssetLoader} from '../asset-loader.js';

export class TextureImageService {
    constructor(assetLoader) {
        this._assetLoader = assetLoader;
    }

    getTextureImage(name) {
        const image = this._assetLoader.assets[AssetLoader.AssetType.TEXTURES][name];
        if (image instanceof Promise) {
            return image;
        }
        return image ? Promise.resolve(image) : Promise.reject();
    }
}
