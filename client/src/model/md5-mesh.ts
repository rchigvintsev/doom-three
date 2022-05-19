import {Quaternion, Vector2, Vector3} from 'three';

export class Md5Mesh {
    readonly skinWeights: number[] = [];
    readonly skinIndices: number[] = [];

    constructor(readonly joints: Md5MeshJoint[], readonly meshes: Md5ChildMesh[]) {
    }
}

export class Md5MeshJoint {
    constructor(readonly name: number | null,
                readonly parent: number | null,
                readonly position: Vector3,
                readonly orientation: Quaternion) {
    }
}

export class Md5ChildMesh {
    vertices: Md5MeshVertex[] = [];
    faces: number[] = [];
    weights: Md5MeshWeight[] = [];
    shader?: string;

    get elementsNumber(): number {
        return this.faces.length;
    }
}

export class Md5MeshVertex {
    constructor(public position: Vector3,
                readonly normal: Vector3,
                readonly tangent: Vector3,
                readonly uv: Vector2,
                readonly weight: Md5VertexWeight) {
    }
}

export class Md5VertexWeight {
    constructor(readonly index: number, readonly count: number) {
    }
}

export class Md5MeshWeight {
    constructor(readonly joint: number,
                readonly bias: number,
                readonly position?: Vector3,
                readonly normal?: Vector3,
                readonly tangent?: Vector3) {
    }
}
