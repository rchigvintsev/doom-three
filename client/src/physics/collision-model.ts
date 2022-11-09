import {Object3D, Quaternion, Scene, Vector3} from 'three';

import {Body, BodyType, Material, Quaternion as Quat, Shape, Vec3} from 'cannon-es';

import {PhysicsSystem} from './physics-system';
import {Weapon} from '../entity/model/md5/weapon/weapon';

export class CollisionModel {
    onUpdate?: (position: Vector3, quaternion: Quaternion) => void;

    private position = new Vector3();
    private quaternion = new Quaternion();

    private readonly hitPoint = new Vec3();
    private readonly forceVector = new Vec3();

    constructor(readonly bodies: CollisionModelBody[]) {
    }

    setPosition(position: Vector3) {
        this.position.copy(position);
        const body = this.getFirstBody();
        if (body) {
            body.position.set(position.x, position.y, position.z);
        }
    }

    setQuaternion(quaternion: Quaternion) {
        this.quaternion.copy(quaternion);
        const body = this.getFirstBody();
        if (body) {
            body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        }
    }

    register(physicsSystem: PhysicsSystem, scene: Scene) {
        for (const body of this.bodies) {
            physicsSystem.addBody(body);
            if (body.helper) {
                scene.add(body.helper);
            }
        }
    }

    unregister(physicsSystem: PhysicsSystem, scene: Scene) {
        for (const body of this.bodies) {
            physicsSystem.removeBody(body);
            body.reset();
            if (body.helper) {
                scene.remove(body.helper);
            }
        }
    }

    update(_deltaTime: number) {
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const position = body.position;
            const quaternion = body.quaternion;

            if (i === 0) {
                this.position.set(position.x, position.y, position.z);
                this.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }

            if (body.helper) {
                body.helper.position.set(position.x, position.y, position.z);
                body.helper.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }
        }

        if (this.onUpdate) {
            this.onUpdate(this.position, this.quaternion);
        }
    }

    hasMass(): boolean {
        const body = this.getFirstBody();
        return !!body && body.mass > 0;
    }

    onAttack(hitPoint: Vector3, forceVector: Vector3, _weapon: Weapon) {
        if (this.hasMass()) {
            this.applyForce(forceVector, hitPoint);
        }
    }

    applyForce(forceVector: Vector3, relativePoint?: Vector3) {
        const body = this.getFirstBody();
        if (body) {
            body.wakeUp();
            this.forceVector.set(forceVector.x, forceVector.y, forceVector.z);
            if (relativePoint) {
                this.hitPoint.set(relativePoint.x, relativePoint.y, relativePoint.z);
                body.applyForce(this.forceVector, this.hitPoint);
            } else {
                body.applyForce(this.forceVector);
            }
        }
    }

    private getFirstBody(): CollisionModelBody | undefined {
        return this.bodies.length > 0 ? this.bodies[0] : undefined;
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
        quaternion?: Quat
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
