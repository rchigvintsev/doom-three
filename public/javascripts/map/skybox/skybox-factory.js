import {MATERIALS} from '../../material/materials.js';
import {TextureImageService} from "../../image/texture-image-service.js";

export class SkyboxFactory {
    constructor(assetLoader) {
        if (assetLoader == null) {
            throw new Error('Asset loader must not be null');
        }
        this._textureImageService = new TextureImageService(assetLoader);
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

        const images = [];
        ['_right', '_left', '_up', '_down', '_forward', '_back'].forEach((postfix) => {
            this._textureImageService.getTextureImage(materialDef.cubeMap + postfix)
                .then(img => {
                    images.push(img);
                    cubeTexture.needsUpdate = true;
                })
                .catch(() => console.error('Texture "' + materialDef.cubeMap + postfix + '" is not found'))
        });
        const cubeTexture = new THREE.CubeTexture();
        cubeTexture.images = images;
        cubeTexture.format = THREE.RGBFormat;
        return cubeTexture;
    }
}
