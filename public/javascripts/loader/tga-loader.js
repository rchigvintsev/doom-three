import {Images} from '../util/images.js';
import {Arrays} from '../util/arrays.js';

export class TGALoader extends THREE.Loader {
    constructor(manager) {
        super(manager);
        this._fileLoader = new THREE.FileLoader(this.manager);
        this._fileLoader.setResponseType('arraybuffer');
        this._fileLoader.setPath(this.path);
    }

    load(url, onLoad, onProgress, onError) {
        const texture = new THREE.Texture();
        this._fileLoader.load(url, (buffer) => {
            texture.image = this.parse(buffer, url);
            texture.needsUpdate = true;
            if (onLoad != null) {
                onLoad(texture);
            }
        }, onProgress, onError);
        return texture;
    }

    parse(buffer) {
        const tga = Images.parseTga(buffer);

        const canvas = document.createElement('canvas');
        canvas.width = tga.width;
        canvas.height = tga.height;

        const context = canvas.getContext('2d');

        const imageData = context.createImageData(tga.width, tga.height);
        Arrays.copy(tga.data, imageData.data);
        context.putImageData(imageData, 0, 0);
        return canvas;
    }
}
