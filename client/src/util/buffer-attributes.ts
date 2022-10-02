import {BufferAttribute, Vector2, Vector3, Vector4} from 'three';

export class BufferAttributes {
    static copyVector2sArray(attribute: BufferAttribute, vectors: Vector2[]): BufferAttribute {
        const array = (<number[]>attribute.array);
        let offset = 0;
        for (let i = 0; i < vectors.length; i++) {
            const vector = vectors[i];
            if (attribute.normalized) {
                array[offset++] = BufferAttributes.normalize(vector.x, array);
                array[offset++] = BufferAttributes.normalize(vector.y, array);
            } else {
                array[offset++] = vector.x;
                array[offset++] = vector.y;
            }
        }
        return attribute;
    }

    static copyVector3sArray(attribute: BufferAttribute, vectors: Vector3[]): BufferAttribute {
        const array = (<number[]>attribute.array);
        let offset = 0;
        for (let i = 0; i < vectors.length; i++) {
            const vector = vectors[i];
            if (attribute.normalized) {
                array[offset++] = BufferAttributes.normalize(vector.x, array);
                array[offset++] = BufferAttributes.normalize(vector.y, array);
                array[offset++] = BufferAttributes.normalize(vector.z, array);
            } else {
                array[offset++] = vector.x;
                array[offset++] = vector.y;
                array[offset++] = vector.z;
            }
        }
        return attribute;
    }

    static copyVector4sArray(attribute: BufferAttribute, vectors: Vector4[]): BufferAttribute {
        const array = (<number[]>attribute.array);
        let offset = 0;
        for (let i = 0; i < vectors.length; i++) {
            const vector = vectors[i];
            if (attribute.normalized) {
                array[offset++] = BufferAttributes.normalize(vector.x, array);
                array[offset++] = BufferAttributes.normalize(vector.y, array);
                array[offset++] = BufferAttributes.normalize(vector.z, array);
                array[offset++] = BufferAttributes.normalize(vector.w, array);
            } else {
                array[offset++] = vector.x;
                array[offset++] = vector.y;
                array[offset++] = vector.z;
                array[offset++] = vector.w;
            }
        }
        return attribute;
    }

    private static normalize(value: number, array: number[]): number {
        switch (array.constructor) {
            case Float32Array:
                return value;
            case Uint16Array:
                return Math.round(value * 65535.0);
            case Uint8Array:
                return Math.round(value * 255.0);
            case Int16Array:
                return Math.round(value * 32767.0);
            case Int8Array:
                return Math.round(value * 127.0);
            default:
                throw new Error('Invalid component type');
        }
    }
}