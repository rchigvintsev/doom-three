import {BufferGeometry, Float32BufferAttribute, Vector2, Vector3, Vector4} from 'three';

import {round} from 'mathjs';

import {Md5AnimationJoint} from '../animation/md5-animation';
import {BufferAttributes} from '../util/buffer-attributes';

export class Md5MeshGeometry extends BufferGeometry {
    constructor(readonly faces: Md5MeshFace[],
                readonly vertices: Md5MeshVertex[],
                readonly weights: Md5MeshWeight[]) {
        super();
    }

    bindPose(joints: Md5AnimationJoint[]) {
        const skinWeights: Vector4[] = [];
        const skinIndices: Vector4[] = [];

        const rotatedPosition = new Vector3();
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];
            for (let j = 0; j < vertex.weightCount; j++) {
                if (j === 0) {
                    const heavyBones = this.findTwoHeaviestWeights(vertex.weightCount, vertex.weightIndex);
                    skinWeights.push(new Vector4(round(heavyBones[0].bias, 3), round(heavyBones[1].bias, 3), 0, 0));
                    skinIndices.push(new Vector4(heavyBones[0].joint, heavyBones[1].joint, 0, 0));
                }

                const weight = this.weights[vertex.weightIndex + j];
                const joint = joints[weight.joint];
                rotatedPosition.copy(weight.position).applyQuaternion(joint.orientation);

                vertex.position.x += (joint.position.x + rotatedPosition.x) * weight.bias;
                vertex.position.y += (joint.position.y + rotatedPosition.y) * weight.bias;
                vertex.position.z += (joint.position.z + rotatedPosition.z) * weight.bias;
            }

            vertex.position.x = round(vertex.position.x, 3);
            vertex.position.y = round(vertex.position.y, 3);
            vertex.position.z = round(vertex.position.z, 3);
        }

        const positionAttrValue: Vector3[] = [];
        const uvAttrValue: Vector2[] = [];
        const skinWeightAttrValue: Vector4[] = [];
        const skinIndexAttrValue: Vector4[] = [];

        for (let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i];
            for (let j = 0; j < 3; j++) {
                const vertexIndex = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                const vertex = this.vertices[vertexIndex];
                positionAttrValue.push(vertex.position);
                uvAttrValue.push(vertex.uv);
                skinWeightAttrValue.push(skinWeights[vertexIndex]);
                skinIndexAttrValue.push(skinIndices[vertexIndex]);
            }
        }

        this.setFloat32Vector3Attribute('position', positionAttrValue);
        this.setFloat32Vector2Attribute('uv', uvAttrValue);
        this.setFloat32Vector4Attribute('skinWeight', skinWeightAttrValue);
        this.setFloat32Vector4Attribute('skinIndex', skinIndexAttrValue);

        this.computeVertexNormals();
    }

    computeVertexNormals() {
        const normals: Vector3[] = [];
        for (let i = 0; i < this.vertices.length; i++) {
            normals[i] = new Vector3();
        }

        const cb = new Vector3(), ab = new Vector3();
        for (let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i];
            const faceVertices: Vector3[] = [];
            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                faceVertices.push(this.vertices[vertexIdx].position);
            }

            cb.subVectors(faceVertices[2], faceVertices[1]);
            ab.subVectors(faceVertices[0], faceVertices[2]);
            cb.cross(ab);

            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                normals[vertexIdx].add(cb);
            }
        }

        for (let i = 0; i < normals.length; i++) {
            normals[i].normalize();
        }

        const normalAttrValues: Vector3[] = [];
        for (let i = 0; i < this.faces.length; i++) {
            const face = this.faces[i];
            for (let j = 0; j < 3; j++) {
                const vertexIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                normalAttrValues.push(normals[vertexIdx]);
            }
        }
        this.setFloat32Vector3Attribute('normal', normalAttrValues);
    }

    clone(): BufferGeometry {
        const clone = super.clone() as any;
        clone.faces = this.faces.map(face => face.clone());
        clone.vertices = this.vertices.map(vertex => vertex.clone());
        clone.weights = this.weights.map(weight => weight.clone());
        return clone;
    }

    private findTwoHeaviestWeights(weightCount: number, weightIndex: number): { joint: number, bias: number }[] {
        const result: { joint: number, bias: number }[] = [];

        let firstHighestWeight = 0, firstHighestJoint = 0;
        for (let i = 0; i < weightCount; i++) {
            const weight = this.weights[weightIndex + i];
            if (weight.bias > firstHighestWeight) {
                firstHighestWeight = weight.bias;
                firstHighestJoint = weight.joint;
            }
        }
        result[0] = {joint: firstHighestJoint, bias: firstHighestWeight};

        let secondHighestWeight = 0, secondHighestJoint = 0;
        if (weightCount > 1) {
            for (let i = 0; i < weightCount; i++) {
                const weight = this.weights[weightIndex + i];
                if (weight.bias > secondHighestWeight && weight.joint !== firstHighestJoint) {
                    secondHighestWeight = weight.bias;
                    secondHighestJoint = weight.joint;
                }
            }
        }
        result[1] = {joint: secondHighestJoint, bias: secondHighestWeight};

        if (weightCount > 2) {
            const sum = result[0].bias + result[1].bias;
            result[0] = {joint: result[0].joint, bias: result[0].bias / sum};
            result[1] = {joint: result[1].joint, bias: result[1].bias / sum};
        }

        return result;
    }

    private setFloat32Vector2Attribute(name: string, values: Vector2[]) {
        const attr = new Float32BufferAttribute(values.length * 2, 2);
        this.setAttribute(name, BufferAttributes.copyVector2sArray(attr, values));
    }

    private setFloat32Vector3Attribute(name: string, values: Vector3[]) {
        const attr = new Float32BufferAttribute(values.length * 3, 3);
        this.setAttribute(name, BufferAttributes.copyVector3sArray(attr, values));
    }

    private setFloat32Vector4Attribute(name: string, values: Vector4[]) {
        const attr = new Float32BufferAttribute(values.length * 4, 4);
        this.setAttribute(name, BufferAttributes.copyVector4sArray(attr, values));
    }
}

export class Md5MeshFace {
    constructor(readonly a: number, readonly b: number, readonly c: number, readonly materialIndex: number) {
    }

    clone(): Md5MeshFace {
        return new Md5MeshFace(this.a, this.b, this.c, this.materialIndex);
    }
}

export class Md5MeshVertex {
    readonly position = new Vector3();

    constructor(readonly uv: Vector2, readonly weightIndex: number, readonly weightCount: number) {
    }

    clone(): Md5MeshVertex {
        const clone = new Md5MeshVertex(this.uv.clone(), this.weightIndex, this.weightCount);
        clone.position.copy(this.position);
        return clone;
    }
}

export class Md5MeshWeight {
    constructor(readonly joint: number, readonly bias: number, readonly position: Vector3) {
    }

    clone(): Md5MeshWeight {
        return new Md5MeshWeight(this.joint, this.bias, this.position.clone());
    }
}