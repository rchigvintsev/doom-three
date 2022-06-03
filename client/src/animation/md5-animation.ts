import {Quaternion, Vector3} from 'three';

// noinspection JSBitwiseOperatorUsage
export class Md5Animation {
    readonly length: number;

    constructor(readonly name: string,
                readonly fps: number,
                readonly baseFrames: Md5AnimationBaseFrame[],
                readonly frames: number[][],
                readonly hierarchy: Md5AnimationBone[]) {
        this.length = ((this.frames.length - 1) * this.frameTime) / 1000;

        for (let i = 0; i < this.hierarchy.length; i++) {
            const bone = this.hierarchy[i];
            for (let j = 0; j < this.frames.length; j++) {
                bone.keys.push(this.createBoneKey(j, i));
            }
        }
    }

    get frameTime(): number {
        return 1000 / this.fps;
    }

    getFrame(frameIndex: number, poseBinding = false): Md5AnimationJoint[] {
        const frame = this.frames[frameIndex];
        const joints: Md5AnimationJoint[] = [];
        for (let i = 0; i < this.baseFrames.length; i++) {
            const baseJoint = this.baseFrames[i];
            const offset = this.hierarchy[i].index;
            const flags = this.hierarchy[i].flags;

            const position = new Vector3().copy(baseJoint.position);
            const orientation = new Quaternion().copy(baseJoint.orientation);

            let j = 0;

            if (flags & 1) {
                position.x = frame[offset + j];
                j++;
            }
            if (flags & 2) {
                position.y = frame[offset + j];
                j++;
            }
            if (flags & 4) {
                position.z = frame[offset + j];
                j++;
            }
            if (flags & 8) {
                orientation.x = frame[offset + j];
                j++;
            }
            if (flags & 16) {
                orientation.y = frame[offset + j];
                j++;
            }
            if (flags & 32) {
                orientation.z = frame[offset + j];
                j++;
            }

            orientation.w = -Math.sqrt(Math.abs(1.0 - orientation.x * orientation.x - orientation.y * orientation.y
                - orientation.z * orientation.z));

            const parentIndex = this.hierarchy[i].parent;
            if (parentIndex >= 0 && poseBinding) {
                const parentJoint = joints[parentIndex];
                position.applyQuaternion(parentJoint.orientation);
                position.add(parentJoint.position);
                orientation.multiplyQuaternions(parentJoint.orientation, orientation);
            }

            joints.push(new Md5AnimationJoint(position, orientation));
        }

        return joints;
    }

    private createBoneKey(frameIndex: number, boneIndex: number) {
        const frame = this.getFrame(frameIndex);
        const position = frame[boneIndex].position;
        const orientation = frame[boneIndex].orientation;
        const time = (this.frameTime * frameIndex) / 1000;
        const scale = frameIndex === 0 || frameIndex === this.frames.length - 1 ? [1, 1, 1] : undefined;
        return new Md5AnimationBoneKey(position, orientation, time, scale);
    }
}

export class Md5AnimationJoint {
    constructor(readonly position: Vector3, readonly orientation: Quaternion) {
    }
}

export class Md5AnimationBone {
    readonly keys: Md5AnimationBoneKey[] = [];

    constructor(readonly name: string,
                readonly parent: number,
                readonly flags: number,
                readonly index: number) {
    }
}

export class Md5AnimationBoneKey {
    readonly pos: number[];
    readonly rot: number[];

    constructor(position: Vector3, orientation: Quaternion, readonly time: number, readonly scl?: number[]) {
        this.pos = [position.x, position.y, position.z];
        this.rot = [orientation.x, orientation.y, orientation.z, orientation.w];
    }
}

export class Md5AnimationBaseFrame {
    constructor(readonly position: Vector3, readonly orientation: Quaternion) {
    }
}