import {Object3D, Quaternion, Scene, Vector3} from 'three';

import {Body, BodyType, Material, Quaternion as Quat, Shape, Vec3} from 'cannon-es';

import {Weapon} from '../entity/model/md5/weapon/weapon';
import {PhysicsManager} from './physics-manager';
import {Position} from '../util/position';

export class CollisionModel {
    readonly position = new Position();
    readonly quaternion = new Quaternion();

    onUpdate?: (position: Position, quaternion: Quaternion) => void;

    constructor(readonly bodies: CollisionModelBody[]) {
        this.position._onChange(() => this.onPositionChange());
        this.quaternion._onChange(() => this.onQuaternionChange());
    }

    register(physicsManager: PhysicsManager, scene: Scene) {
        for (const body of this.bodies) {
            physicsManager.addBody(body);
            if (body.helper) {
                scene.add(body.helper);
            }
        }
    }

    unregister(physicsManager: PhysicsManager, scene: Scene) {
        for (const body of this.bodies) {
            physicsManager.removeBody(body);
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
            this.applyImpulse(forceVector, hitPoint);
        }
    }

    applyImpulse = (() => {
        const cannonImpulse = new Vec3();
        const cannonRelativePoint = new Vec3();

        return (impulse: Vector3, relativePoint?: Vector3) => {
            const body = this.getFirstBody();
            if (body) {
                body.wakeUp();
                cannonImpulse.set(impulse.x, impulse.y, impulse.z);
                if (relativePoint) {
                    cannonRelativePoint.set(relativePoint.x, relativePoint.y, relativePoint.z);
                    body.applyImpulse(cannonImpulse, cannonRelativePoint);
                } else {
                    body.applyImpulse(cannonImpulse);
                }
            }
        };
    })();

    private getFirstBody(): CollisionModelBody | undefined {
        return this.bodies.length > 0 ? this.bodies[0] : undefined;
    }

    private onPositionChange() {
        for (const body of this.bodies) {
            body.position.set(this.position.x, this.position.y, this.position.z);
            body.helper?.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    private onQuaternionChange() {
        for (const body of this.bodies) {
            body.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
            body.helper?.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
        }
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
