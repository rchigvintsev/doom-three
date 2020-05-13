import {Arrays} from '../util/arrays.js';

export class TGAImage {
    constructor() {
        this._origin = new THREE.Vector2();
        this._data = [];
    }

    copy(other) {
        this.origin.copy(other.origin);

        this._data = [];
        Arrays.copy(other.data, this.data);

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
