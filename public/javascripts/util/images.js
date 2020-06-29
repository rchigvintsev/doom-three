import {TGAImage} from '../image/tga-image.js';
import {Arrays} from './arrays.js';

const TGA_HEADER_LENGTH = 18;

const TGA_TYPE_NO_DATA = 0;
const TGA_TYPE_INDEXED = 1;
const TGA_TYPE_RGB = 2;
const TGA_TYPE_GREY = 3;
const TGA_TYPE_RLE_INDEXED = 9;
const TGA_TYPE_RLE_RGB = 10;
const TGA_TYPE_RLE_GREY = 11;

const TGA_ORIGIN_MASK = 0x30;
const TGA_ORIGIN_SHIFT = 0x04;
const TGA_ORIGIN_BL = 0x00;
const TGA_ORIGIN_BR = 0x01;
const TGA_ORIGIN_UL = 0x02;
const TGA_ORIGIN_UR = 0x03;

function _readShort(buffer, cursor) {
    return buffer[cursor] | buffer[cursor + 1] << 8
}

export class Images {
    static parseTga(buffer, negate=false) {
        buffer = new Uint8Array(buffer);
        if (buffer.length < TGA_HEADER_LENGTH) {
            console.error('Not enough data to contain header');
        }

        const image = new TGAImage();

        let offset = Images._parseTgaHeader(buffer, image);
        Images._checkTga(image);

        if (image.commentLength + TGA_HEADER_LENGTH > buffer.length) {
            console.error('No data');
        }

        offset += image.commentLength;

        const useRle = image.type === TGA_TYPE_RLE_INDEXED
            || image.type === TGA_TYPE_RLE_RGB
            || image.type === TGA_TYPE_RLE_GREY;
        const usePal = image.type === TGA_TYPE_INDEXED || image.type === TGA_TYPE_RLE_INDEXED;
        const useGrey = image.type === TGA_TYPE_GREY || image.type === TGA_TYPE_RLE_GREY;

        const pixelSize = image.pixelSize >> 3;
        const pixelNumber = image.width * image.height * pixelSize;

        let palettes;
        if (usePal) {
            const begin = offset;
            const end = offset + image.colorMapLength * (image.colorMapSize >> 3);
            palettes = buffer.subarray(begin, end);
            offset = end;
        }

        let pixelData;
        if (useRle) {
            pixelData = new Uint8Array(pixelNumber);
            const pixels = new Uint8Array(pixelSize);

            let count;
            let shift = 0;
            while (shift < pixelNumber) {
                let b = buffer[offset++];
                count = (b & 0x7f) + 1;

                if (b & 0x80) {
                    for (let i = 0; i < pixelSize; i++) {
                        pixels[i] = buffer[offset++];
                    }

                    for (let i = 0; i < count; ++i) {
                        pixelData.set(pixels, shift + i * pixelSize);
                    }

                    shift += pixelSize * count;
                } else {
                    count *= pixelSize;
                    for (let i = 0; i < count; i++) {
                        pixelData[shift + i] = buffer[offset++];
                    }
                    shift += count;
                }
            }
        } else {
            pixelData = buffer.subarray(offset, offset + (usePal ? image.width * image.height : pixelNumber));
        }

        let columnFrom, rowFrom;
        let columnTo, rowTo;
        let columnStep, rowStep;

        switch ((image.attributes & TGA_ORIGIN_MASK) >> TGA_ORIGIN_SHIFT) {
            default:
            case TGA_ORIGIN_UL:
                columnFrom = 0;
                columnTo = image.width;
                columnStep = 1;
                rowFrom = 0;
                rowTo = image.height;
                rowStep = 1;
                break;
            case TGA_ORIGIN_BL:
                columnFrom = 0;
                columnTo = image.width;
                columnStep = 1;
                rowFrom = image.height - 1;
                rowTo = -1;
                rowStep = -1;
                break;
            case TGA_ORIGIN_UR:
                columnFrom = image.width - 1;
                columnTo = -1;
                columnStep = -1;
                rowFrom = 0;
                rowTo = window.height;
                rowStep = 1;
                break;
            case TGA_ORIGIN_BR:
                columnFrom = image.width - 1;
                columnTo = -1;
                columnStep = -1;
                rowFrom = image.height - 1;
                rowTo = -1;
                rowStep = -1;
                break;
        }

        let i = 0;
        for (let row = rowFrom; row !== rowTo; row += rowStep) {
            for (let column = columnFrom; column !== columnTo; column += columnStep) {
                let red, green, blue, alpha;

                if (useGrey) {
                    const color = pixelData[i];

                    red = color;
                    green = color;
                    blue = color;

                    switch (image.pixelSize) {
                        case 8: {
                            alpha = 255;
                            i += 1;
                            break;
                        }
                        case 16: {
                            alpha = pixelData[i + 1];
                            i += 2;
                            break;
                        }
                        default: {
                            console.error('Format is not supported');
                        }
                    }
                } else {
                    switch (image.pixelSize) {
                        case 8: {
                            const color = pixelData[i];
                            red = palettes[(color * 3) + 2];
                            blue = palettes[(color * 3) + 2];
                            green = palettes[(color * 3) + 1];
                            alpha = 255;
                            i += 1;
                            break;
                        }
                        case 16: {
                            const color = pixelData[i] + (pixelData[i + 1] << 8);
                            red = (color & 0x7c00) >> 7;
                            green = (color & 0x03e0) >> 2;
                            blue = (color & 0x001f) >> 3;
                            alpha = (color & 0x8000) ? 0 : 255;
                            i += 2;
                            break;
                        }
                        case 24: {
                            red = pixelData[i + 2];
                            green = pixelData[i + 1];
                            blue = pixelData[i];
                            alpha = 255;
                            i += 3;
                            break;
                        }
                        case 32: {
                            red = pixelData[i + 2];
                            green = pixelData[i + 1];
                            blue = pixelData[i];
                            alpha = pixelData[i + 3];
                            i += 4;
                            break;
                        }
                        default: {
                            console.error('Format is not supported');
                        }
                    }
                }

                if (negate) {
                    red = 255 - red;
                    green = 255 - green;
                    blue = 255 - blue;
                }

                let j = (column + image.width * (image.height - 1 - row)) * 4;

                image.data[j++] = red;
                image.data[j++] = green;
                image.data[j++] = blue;
                image.data[j++] = alpha;
            }
        }

        return image;
    }

    static flip(image) {
        const width = image.width * 4;
        for (let column = 0; column < width; column++) {
            for (let row = 0; row < image.height / 2; row++) {
                const i = row * width + column;
                const j = (image.height - 1 - row) * width + column;

                const tmp = image.data[i];
                image.data[i] = image.data[j];
                image.data[j] = tmp;
            }
        }
    }

    /*
     * Based on the code of Image_program.cpp file from DOOM 3 GitHub repository
     * (https://github.com/id-Software/DOOM-3)
     */
    static addNormals(normalMap, bumpMap, scale) {
        normalMap = Images.parseTga(normalMap);
        bumpMap = Images.parseTga(bumpMap);
        bumpMap = Images._bumpMapToNormalMap(bumpMap, scale);

        if (bumpMap.width !== normalMap.width || bumpMap.height !== normalMap.height) {
            throw 'Images of different size are not supported';
        }

        const canvas = document.createElement('canvas');
        canvas.width = normalMap.width;
        canvas.height = normalMap.height;

        const context = canvas.getContext('2d');
        const imageData = context.createImageData(normalMap.width, normalMap.height);
        Arrays.copy(normalMap.data, imageData.data);
        Images._addNormalMaps(imageData.data, normalMap, bumpMap);
        Images.flip(imageData);
        context.putImageData(imageData, 0, 0);

        return canvas;
    }

    static negate(map) {
        map = Images.parseTga(map, true);

        const canvas = document.createElement('canvas');
        canvas.width = map.width;
        canvas.height = map.height;

        const context = canvas.getContext('2d');
        const imageData = context.createImageData(map.width, map.height);
        Arrays.copy(map.data, imageData.data);
        context.putImageData(imageData, 0, 0);

        return canvas;
    }

    static _parseTgaHeader(buffer, image) {
        let offset = 0;

        image.commentLength = buffer[offset++];
        image.colorMapType = buffer[offset++];
        image.type = buffer[offset++];
        image.colorMapIndex = _readShort(buffer, offset);
        offset += 2;
        image.colorMapLength = _readShort(buffer, offset);
        offset += 2;
        image.colorMapSize = buffer[offset++];
        image.origin.set(_readShort(buffer, offset), _readShort(buffer, offset + 2));
        offset += 4;
        image.width = _readShort(buffer, offset);
        offset += 2;
        image.height = _readShort(buffer, offset);
        offset += 2;
        image.pixelSize = buffer[offset++];
        image.attributes = buffer[offset++];

        return TGA_HEADER_LENGTH;
    }

    static _checkTga(image) {
        switch (image.type) {
            case TGA_TYPE_INDEXED:
            case TGA_TYPE_RLE_INDEXED:
                if (image.colorMapLength > 256 || image.colorMapSize !== 24 || image.colorMapType !== 1) {
                    console.error('Invalid color map data for indexed type');
                }
                break;

            case TGA_TYPE_RGB:
            case TGA_TYPE_GREY:
            case TGA_TYPE_RLE_RGB:
            case TGA_TYPE_RLE_GREY:
                if (image.colorMapType) {
                    console.error('Invalid color map data for color map type');
                }
                break;

            case TGA_TYPE_NO_DATA:
                console.error('No data');
                break;

            default:
                console.error('Unsupported image type: ' + image.type);
        }

        if (image.width <= 0 || image.height <= 0) {
            console.error('Invalid image size');
        }

        if (image.pixelSize !== 8 && image.pixelSize !== 16 && image.pixelSize !== 24 && image.pixelSize !== 32) {
            console.error('Invalid pixel size: ' + image.pixelSize);
        }
    }

    static _bumpMapToNormalMap(bumpMap, scale) {
        scale = scale / 256;

        // Copy and convert to grey scale
        const depth = [];
        const n = bumpMap.width * bumpMap.height;
        for (let i = 0; i < n; i++) {
            depth[i] = (bumpMap.data[i * 4] + bumpMap.data[i * 4 + 1] + bumpMap.data[i * 4 + 2]) / 3;
        }

        const dir = new THREE.Vector3();
        const dir2 = new THREE.Vector3();

        const result = new TGAImage();
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
