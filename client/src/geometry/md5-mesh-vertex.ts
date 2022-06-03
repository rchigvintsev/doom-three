import {Vector2, Vector3} from 'three';

export class Md5MeshVertex {
    readonly position = new Vector3();

    constructor(readonly uv: Vector2, readonly weightIndex: number, readonly weightCount: number) {
    }
}