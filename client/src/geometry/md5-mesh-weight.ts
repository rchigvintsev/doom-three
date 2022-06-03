import {Vector3} from 'three';

export class Md5MeshWeight {
    constructor(readonly joint: number, readonly bias: number, readonly position: Vector3) {
    }
}