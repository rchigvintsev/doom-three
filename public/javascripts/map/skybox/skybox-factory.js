import {MATERIALS} from '../../material/materials.js';
import {AssetLoader} from '../../asset-loader.js';

export class SkyboxFactory {
    constructor(assetLoader) {
        if (assetLoader == null) {
            throw new Error('Asset loader must not be null');
        }
        this._assetLoader = assetLoader;
    }

    createSkybox(skyboxDef) {
        if (skyboxDef == null) {
            throw new Error('Skybox definition must not be null');
        }

        const materialDef = MATERIALS[skyboxDef.material];
        if (!materialDef) {
            console.error('Definition of material "' + skyboxDef.material + '" is not found');
            return;
        }

        const textures = this._assetLoader.assets[AssetLoader.AssetType.TEXTURES];
        const images = [];
        ['_right', '_left', '_up', '_down', '_forward', '_back'].forEach(function (postfix) {
            const texture = textures[materialDef.cubeMap + postfix];
            if (!texture) {
                console.error('Texture "' + materialDef.cubeMap + postfix + '" is not found');
            } else {
                images.push(texture.image);
            }
        });

        const cubeTexture = new THREE.CubeTexture();
        cubeTexture.images = images;
        cubeTexture.format = THREE.RGBFormat;
        cubeTexture.needsUpdate = true;
        return cubeTexture;
    }
}
