import {TgaImage} from './tga-image';

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

export class Images {
    static parseTga(data: ArrayBuffer, negate=false): TgaImage {
        const buffer = new Uint8Array(data);
        if (buffer.length < TGA_HEADER_LENGTH) {
            throw new Error('Not enough data to contain header');
        }

        const image = new TgaImage();
        let offset = Images.parseTgaHeader(buffer, image);
        Images.checkTga(image);

        if (image.commentLength + TGA_HEADER_LENGTH > buffer.length) {
            throw new Error('No data');
        }

        offset += image.commentLength;

        const useRle = image.type === TGA_TYPE_RLE_INDEXED
            || image.type === TGA_TYPE_RLE_RGB
            || image.type === TGA_TYPE_RLE_GREY;
        const usePal = image.type === TGA_TYPE_INDEXED || image.type === TGA_TYPE_RLE_INDEXED;
        const useGrey = image.type === TGA_TYPE_GREY || image.type === TGA_TYPE_RLE_GREY;

        const pixelSize = image.pixelSize >> 3;
        const pixelNumber = image.width * image.height * pixelSize;

        let palettes: (Uint8Array | null) = null;
        if (usePal) {
            const begin = offset;
            const end = offset + image.colorMapLength * (image.colorMapSize >> 3);
            palettes = buffer.subarray(begin, end);
            offset = end;
        }

        let pixelData: Uint8Array;
        if (useRle) {
            pixelData = new Uint8Array(pixelNumber);
            const pixels = new Uint8Array(pixelSize);

            let count;
            let shift = 0;
            while (shift < pixelNumber) {
                const b = buffer[offset++];
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
                rowTo = window.innerHeight;
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
                let red = 0, green = 0, blue = 0, alpha = 0;

                if (useGrey) {
                    const color = pixelData[i];

                    red = color;
                    green = color;
                    blue = color;

                    switch (image.pixelSize) {
                        case 8:
                            alpha = 255;
                            i += 1;
                            break;
                        case 16:
                            alpha = pixelData[i + 1];
                            i += 2;
                            break;
                        default:
                            throw new Error('Format is not supported');
                    }
                } else {
                    switch (image.pixelSize) {
                        case 8: {
                            const color = pixelData[i];
                            if (palettes) {
                                red = palettes[(color * 3) + 2];
                                blue = palettes[(color * 3) + 2];
                                green = palettes[(color * 3) + 1];
                            }
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
                        case 24:
                            red = pixelData[i + 2];
                            green = pixelData[i + 1];
                            blue = pixelData[i];
                            alpha = 255;
                            i += 3;
                            break;
                        case 32:
                            red = pixelData[i + 2];
                            green = pixelData[i + 1];
                            blue = pixelData[i];
                            alpha = pixelData[i + 3];
                            i += 4;
                            break;
                        default:
                            throw new Error('Format is not supported');
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

    static flip(image: ImageData) {
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

    private static parseTgaHeader(buffer: Uint8Array, image: TgaImage): number {
        let offset = 0;

        image.commentLength = buffer[offset++];
        image.colorMapType = buffer[offset++];
        image.type = buffer[offset++];
        image.colorMapIndex = Images.readShort(buffer, offset);
        offset += 2;
        image.colorMapLength = Images.readShort(buffer, offset);
        offset += 2;
        image.colorMapSize = buffer[offset++];
        image.origin.set(Images.readShort(buffer, offset), Images.readShort(buffer, offset + 2));
        offset += 4;
        image.width = Images.readShort(buffer, offset);
        offset += 2;
        image.height = Images.readShort(buffer, offset);
        offset += 2;
        image.pixelSize = buffer[offset++];
        image.attributes = buffer[offset++];

        return TGA_HEADER_LENGTH;
    }

    private static checkTga(image: TgaImage) {
        switch (image.type) {
            case TGA_TYPE_INDEXED:
            case TGA_TYPE_RLE_INDEXED:
                if (image.colorMapLength > 256 || image.colorMapSize !== 24 || image.colorMapType !== 1) {
                    throw new Error('Invalid color map data for indexed type');
                }
                break;

            case TGA_TYPE_RGB:
            case TGA_TYPE_GREY:
            case TGA_TYPE_RLE_RGB:
            case TGA_TYPE_RLE_GREY:
                if (image.colorMapType) {
                    throw new Error('Invalid color map data for color map type');
                }
                break;

            case TGA_TYPE_NO_DATA:
                throw new Error('No data');

            default:
                throw new Error(`Unsupported image type:${image.type}`);
        }

        if (image.width <= 0 || image.height <= 0) {
            throw new Error('Invalid image size');
        }

        if (image.pixelSize !== 8 && image.pixelSize !== 16 && image.pixelSize !== 24 && image.pixelSize !== 32) {
            throw new Error(`Invalid pixel size: ${image.pixelSize}`);
        }
    }

    private static readShort(buffer: Uint8Array, offset: number): number {
        return buffer[offset] | buffer[offset + 1] << 8;
    }
}
