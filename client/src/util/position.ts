import {Vector3} from 'three';

export class Position {
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(x = 0, y = 0, z = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        this._onChangeCallback();
    }

    get y(): number {
        return this._y;
    }

    set y(value) {
        this._y = value;
        this._onChangeCallback();
    }

    get z(): number {
        return this._z;
    }

    set z(value) {
        this._z = value;
        this._onChangeCallback();
    }

    set(x: number, y: number, z: number): this {
        this._x = x;
        this._y = y;
        this._z = z;
        this._onChangeCallback();
        return this;
    }

    clone(): Position {
        return new Position(this._x, this._y, this._z);
    }

    copy(other: Position): this {
        this._x = other._x;
        this._y = other._y;
        this._z = other._z;
        this._onChangeCallback();
        return this;
    }

    equals(other: Position): boolean {
        return other._x === this._x && this._y === this._y && other._z === this._z;
    }

    setFromVector3(v: Vector3): this {
        return this.set(v.x, v.y, v.z);
    }

    toVector3(v: Vector3 = new Vector3()): Vector3 {
        v.x = this._x;
        v.y = this._y;
        v.z = this._z;
        return v;
    }

    setFromArray(array: number[]): this {
        return this.set(array[0], array[1], array[2]);
    }

    toArray(array: number[] = [], offset = 0): number[] {
        array[offset] = this._x;
        array[offset + 1] = this._y;
        array[offset + 2] = this._z;
        return array;
    }

    multiplyScalar(value: number): this {
        this._x *= value;
        this._y *= value;
        this._z *= value;
        return this;
    }

    _onChange(callback: () => void): this {
        this._onChangeCallback = callback;
        return this;
    }

    private _onChangeCallback() {
        // Do nothing by default
    }
}
