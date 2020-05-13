import {MATERIALS} from '../../material/materials.js';
import {AssetLoader} from '../../asset-loader.js';
import {Images} from '../../util/images.js';

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
                const canvas = texture.image;
                const context = canvas.getContext('2d');
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                // For some reason skybox textures need to be flipped
                Images.flip(imageData);
                context.putImageData(imageData, 0, 0);
                images.push(canvas);
            }
        });

        const cubeTexture = new THREE.CubeTexture();
        cubeTexture.images = images;
        cubeTexture.format = THREE.RGBFormat;
        cubeTexture.needsUpdate = true;
        return cubeTexture;
    }
}
