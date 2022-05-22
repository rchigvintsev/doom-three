import {Quaternion, Vector3} from 'three';

export class Md5Animation {
    constructor(readonly name: string,
                readonly frameRate: number,
                readonly hierarchy: Md5AnimationHierarchyElement[],
                readonly baseFrames: Md5AnimationBaseFrame[],
                readonly frames: number[][]) {
    }

    get frameTime(): number {
        return 1000 / this.frameRate;
    }
}

export class Md5AnimationHierarchyElement {
    constructor(readonly name: string,
                readonly parent: number,
                readonly flags: number,
                readonly index: number) {
    }
}

export class Md5AnimationBaseFrame {
    constructor(readonly position: Vector3, readonly orientation: Quaternion) {
    }
}
