function _readShort(buffer, cursor) {
    return buffer[cursor] | buffer[cursor + 1] << 8
}

function _copyArray(src, dst) {
    for (let i = 0; i < src.length; i++)
        dst[i] = src[i];
}

export class Textures {
    /*
     * Based on the code of Image_program.cpp file from DOOM 3 GitHub repository
     * (https://github.com/id-Software/DOOM-3)
     */
    static addNormals(normalMap, bumpMap, scale) {
        normalMap = Textures.loadTga(normalMap);
        bumpMap = Textures.loadTga(bumpMap);
        bumpMap = Textures._bumpMapToNormalMap(bumpMap, scale);

        if (bumpMap.width !== normalMap.width || bumpMap.height !== normalMap.height)
            throw 'Images of different size are not supported';

        const canvas = document.createElement('canvas');
        canvas.width = normalMap.width;
        canvas.height = normalMap.height;

        const context = canvas.getContext('2d');
        const imageData = context.createImageData(normalMap.width, normalMap.height);
        _copyArray(normalMap.data, imageData.data);
        Textures._addNormalMaps(imageData.data, normalMap, bumpMap);
        context.putImageData(imageData, 0, 0);

        return canvas;
    }

    static loadTga(buffer) {
        const data = new Uint8Array(buffer);
        const image = new TgaImage();
        let cursor = Textures._readTgaHeader(data, image);

        if (image.type !== 2)
            throw 'Unsupported TGA image type: ' + image.type;
        if (image.pixelSize !== 8 && image.pixelSize !== 24 && image.pixelSize !== 32)
            throw 'Unsupported TGA image pixel size: ' + image.pixelSize;
        // noinspection JSBitwiseOperatorUsage
        if (image.attributes & (1 << 5))
            throw 'TGA image flipping is not supported';

        cursor += image.commentLength;
        for (let row = image.height - 1; row >= 0; row--) {
            let offset = row * image.width * 4;
            for (let column = 0; column < image.width; column++) {
                let red, green, blue, alpha;
                switch (image.pixelSize) {
                    case 8: {
                        blue = data[cursor++];
                        green = blue;
                        red = blue;
                        alpha = 255;
                        break;
                    }
                    case 24: {
                        blue = data[cursor++];
                        green = data[cursor++];
                        red = data[cursor++];
                        alpha = 255;
                        break;
                    }
                    case 32: {
                        blue = data[cursor++];
                        green = data[cursor++];
                        red = data[cursor++];
                        alpha = data[cursor++];
                        break;
                    }
                }

                image.data[offset++] = red;
                image.data[offset++] = green;
                image.data[offset++] = blue;
                image.data[offset++] = alpha;
            }
        }

        return image;
    }

    static _bumpMapToNormalMap(bumpMap, scale) {
        scale = scale / 256;

        // Copy and convert to grey scale
        const depth = [];
        const n = bumpMap.width * bumpMap.height;
        for (let i = 0; i < n; i++)
            depth[i] = (bumpMap.data[i * 4] + bumpMap.data[i * 4 + 1] + bumpMap.data[i * 4 + 2]) / 3;

        const dir = new THREE.Vector3();
        const dir2 = new THREE.Vector3();

        const result = new TgaImage();
        result.copy(bumpMap);

        for (let i = 0; i < bumpMap.height; i++) {
            for (let j = 0; j < bumpMap.width; j++) {
                let a1, a2, a3, a4;
                let d1, d2, d3, d4;

                // Look at three points to estimate the gradient
                a1 = d1 = depth[i * bumpMap.width + j];
                a2 = d2 = depth[i * bumpMap.width + ((j + 1) & (bumpMap.width - 1))];
                a3 = d3 = depth[((i + 1) & (bumpMap.height - 1)) * bumpMap.width + j];
                a4 = d4 = depth[((i + 1) & (bumpMap.height - 1)) * bumpMap.width + ((j + 1) & (bumpMap.width - 1))];

                d2 -= d1;
                d3 -= d1;

                dir.set(-d2 * scale, -d3 * scale, 1);
                dir.normalize();

                a1 -= a3;
                a4 -= a3;

                dir2.set(-a4 * scale, a1 * scale, 1);
                dir2.normalize();

                dir.add(dir2);
                dir.normalize();

                a1 = (i * bumpMap.width + j) * 4;
                result.data[a1] = dir.x * 127 + 128;
                result.data[a1 + 1] = dir.y * 127 + 128;
                result.data[a1 + 2] = dir.z * 127 + 128;
                result.data[a1 + 3] = 255;
            }
        }

        return result;
    }

    static _readTgaHeader(data, image) {
        let cursor = 0;
        image.commentLength = data[cursor++];
        image.colorMapType = data[cursor++];
        image.type = data[cursor++];
        image.colorMapIndex = _readShort(data, cursor);
        cursor += 2;
        image.colorMapLength = _readShort(data, cursor);
        cursor += 2;
        image.colorMapSize = data[cursor++];
        image.origin.set(_readShort(data, cursor), _readShort(data, cursor + 2));
        cursor += 4;
        image.width = _readShort(data, cursor);
        cursor += 2;
        image.height = _readShort(data, cursor);
        cursor += 2;
        image.pixelSize = data[cursor++];
        image.attributes = data[cursor++];
        return cursor;
    }

    static _addNormalMaps(dst, normalMap, bumpMap) {
        // Add the normal change from the second and renormalize
        for (let i = 0; i < normalMap.height; i++) {
            for (let j = 0; j < normalMap.width; j++) {
                const pos = (i * normalMap.width + j) * 4;
                const n = new THREE.Vector3();
                n.set((dst[pos] - 128) / 127.0, (dst[pos + 1] - 128) / 127.0, (dst[pos + 2] - 128) / 127.0);

                // There are some normal maps that blend to 0,0,0 at the edges. This screws up compression,
                // so we try to correct that here by instead fading it to 0,0,1
                if (n.length() < 1.0)
                    n.z = Math.sqrt(1.0 - (n.x * n.x) - (n.y * n.y));

                n.x += (bumpMap.data[pos] - 128) / 127.0;
                n.y += (bumpMap.data[pos + 1] - 128) / 127.0;
                n.normalize();

                dst[pos] = n.x * 127 + 128;
                dst[pos + 1] = n.y * 127 + 128;
                dst[pos + 2] = n.z * 127 + 128;
                dst[pos + 3] = 255;
            }
        }
    }
}

class TgaImage {
    constructor() {
        this._origin = new THREE.Vector2();
        this._data = [];
    }

    copy(other) {
        this.origin.copy(other.origin);

        this._data = [];
        _copyArray(other.data, this.data);

        this.commentLength = other.commentLength;
        this.colorMapType = other.colorMapType;
        this.colorMapIndex = other.colorMapIndex;
        this.colorMapLength = other.colorMapLength;
        this.colorMapSize = other.colorMapSize;
        this.type = other.type;
        this.width = other.width;
        this.height = other.height;
        this.pixelSize = other.pixelSize;
        this.attributes = other.attributes;
    }

    get commentLength() {
        return this._commentLength;
    }

    set commentLength(value) {
        this._commentLength = value;
    }

    get colorMapType() {
        return this._colorMapType;
    }

    set colorMapType(value) {
        this._colorMapType = value;
    }

    get colorMapIndex() {
        return this._colorMapIndex;
    }

    set colorMapIndex(value) {
        this._colorMapIndex = value;
    }

    get colorMapLength() {
        return this._colorMapLength;
    }

    set colorMapLength(value) {
        this._colorMapLength = value;
    }

    get colorMapSize() {
        return this._colorMapSize;
    }

    set colorMapSize(value) {
        this._colorMapSize = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get origin() {
        return this._origin;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    get pixelSize() {
        return this._pixelSize;
    }

    set pixelSize(value) {
        this._pixelSize = value;
    }

    get attributes() {
        return this._attributes;
    }

    set attributes(value) {
        this._attributes = value;
    }

    get data() {
        return this._data;
    }
}