import {Object3D} from 'three';

import {Body, BodyType, Material, Quaternion, Shape, Vec3} from 'cannon-es';

export class CollisionModel {
    constructor(readonly bodies: CollisionModelBody[]) {
    }
}

export class CollisionModelBody extends Body {
    helper?: Object3D;

    constructor(options?: {
        collisionFilterGroup?: number;
        collisionFilterMask?: number;
        collisionResponse?: boolean;
        position?: Vec3;
        velocity?: Vec3;
        mass?: number;
        material?: Material;
        linearDamping?: number;
        type?: BodyType;
        allowSleep?: boolean;
        sleepSpeedLimit?: number;
        sleepTimeLimit?: number;
        quaternion?: Quaternion;
        angularVelocity?: Vec3;
        fixedRotation?: boolean;
        angularDamping?: number;
        linearFactor?: Vec3;
        angularFactor?: Vec3;
        shape?: Shape;
        isTrigger?: boolean;
    }) {
        super(options);
    }
}