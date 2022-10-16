import {Vector2} from 'three';

export class TgaImage {
    commentLength = 0;
    colorMapType = 0;
    type = 0;
    colorMapIndex = 0;
    colorMapLength = 0;
    colorMapSize = 0;
    origin = new Vector2();
    width = 0;
    height = 0;
    pixelSize = 0;
    attributes = 0;
    data: number[] = [];

    copy(other: TgaImage) {
        this.commentLength = other.commentLength;
        this.colorMapType = other.colorMapType;
        this.type = other.type;
        this.colorMapIndex = other.colorMapIndex;
        this.colorMapLength = other.colorMapLength;
        this.colorMapSize = other.colorMapSize;
        this.origin.copy(other.origin);
        this.width = other.width;
        this.height = other.height;
        this.pixelSize = other.pixelSize;
        this.attributes = other.attributes;
        this.data = [...other.data];
    }
}