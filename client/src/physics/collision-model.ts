import {Object3D, Quaternion, Scene, Vector3} from 'three';

import {Body, BodyType, Material, Quaternion as Quat, Shape, Vec3} from 'cannon-es';

import {PhysicsSystem} from './physics-system';
import {Weapon} from '../entity/model/md5/weapon/weapon';

export class CollisionModel {
    onUpdate?: (position: Vector3, quaternion: Quaternion) => void;

    private _position = new Vector3();
    private _quaternion = new Quaternion();

    private readonly hitPoint = new Vec3();
    private readonly forceVector = new Vec3();

    constructor(readonly bodies: CollisionModelBody[]) {
    }

    set position(position: Vector3) {
        const body = this.getFirstBody();
        if (body) {
            body.position.set(position.x, position.y, position.z);
        }
    }

    set quaternion(quaternion: Quaternion) {
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

    update(_deltaTime: number) {
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const position = body.position;
            const quaternion = body.quaternion;

            if (i === 0) {
                this._position.set(position.x, position.y, position.z);
                this._quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }

            if (body.helper) {
                body.helper.position.set(position.x, position.y, position.z);
                body.helper.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }
        }

        if (this.onUpdate) {
            this.onUpdate(this._position, this._quaternion);
        }
    }

    hasMass(): boolean {
        const body = this.getFirstBody();
        return !!body && body.mass > 0;
    }

    onAttack(hitPoint: Vector3, forceVector: Vector3, _weapon: Weapon) {
        if (this.hasMass()) {
            this.hitPoint.set(hitPoint.x, hitPoint.y, hitPoint.z);
            this.forceVector.set(forceVector.x, forceVector.y, forceVector.z);
            const body = this.getFirstBody();
            if (body) {
                body.wakeUp();
                body.applyForce(this.forceVector, this.hitPoint);
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
}
