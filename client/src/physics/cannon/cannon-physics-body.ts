import {Object3D} from 'three';

import {Body, BodyType, Material, Quaternion, Shape, Vec3} from 'cannon-es';

import {PhysicsBody} from '../physics-body';

export class CannonPhysicsBody extends Body implements PhysicsBody {
    readonly name: string | undefined;

    helper: Object3D | undefined;

    constructor(options?: {
        name?: string;
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
        this.name = options?.name;
    }

    reset() {
        this.angularFactor.set(1, 1, 1);
        this.angularVelocity.setZero();
        this.force.setZero();
        this.initAngularVelocity.setZero();
        this.initPosition.setZero();
        this.initQuaternion.set(0, 0, 0, 0);
        this.initVelocity.setZero();
        this.interpolatedPosition.setZero();
        this.interpolatedQuaternion.set(0, 0, 0, 0);
        this.invInertiaSolve.setZero();
        this.invInertiaWorldSolve.setZero();
        this.invMassSolve = 0;
        this.linearFactor.set(1, 1, 1);
        this.position.setZero();
        this.previousPosition.setZero();
        this.quaternion.set(0, 0, 0, 0);
        this.previousQuaternion.set(0, 0, 0, 0);
        this.sleepState = 0;
        this.timeLastSleepy = 0;
        this.torque.setZero();
        this.velocity.setZero();
        this.vlambda.setZero();
        this.wlambda.setZero();
    }
}
