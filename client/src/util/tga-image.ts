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
}