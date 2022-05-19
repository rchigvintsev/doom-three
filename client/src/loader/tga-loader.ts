import {FileLoader, Loader, LoadingManager, Texture} from 'three';

import {Images} from '../util/images';
import {TgaImage} from "../util/tga-image";

export class TgaLoader extends Loader {
    private readonly fileLoader: FileLoader;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(this.manager);
        this.fileLoader.setResponseType('arraybuffer');
        this.fileLoader.setPath(this.path);
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Texture> {
        return this.fileLoader.loadAsync(url, onProgress).then(buffer => {
            const texture = new Texture();
            texture.image = this.parse(<ArrayBuffer>buffer);
            texture.needsUpdate = true;
            return texture;
        });
    }

    parse(buffer: ArrayBuffer) {
        const tgaImage = Images.parseTga(buffer);

        const canvas = document.createElement('canvas');
        canvas.width = tgaImage.width;
        canvas.height = tgaImage.height;

        const renderingContext = canvas.getContext('2d');
        if (!renderingContext) {
            throw new Error('Failed to parse TGA texture: could not get rendering context');
        }

        const imageData = TgaLoader.createImageData(renderingContext, tgaImage);
        renderingContext.putImageData(imageData, 0, 0);

        return canvas;
    }

    private static createImageData(renderingContext: CanvasRenderingContext2D, tgaImage: TgaImage) {
        const imageData = renderingContext.createImageData(tgaImage.width, tgaImage.height);
        for (let i = 0; i < tgaImage.data.length; i++) {
            imageData.data[i] = tgaImage.data[0];
        }
        Images.flip(imageData);
        return imageData;
    }
}
