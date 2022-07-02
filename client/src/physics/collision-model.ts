import {Object3D, Quaternion, Scene, Vector3} from 'three';

import {Body, BodyType, Material, Quaternion as Quat, Shape, Vec3} from 'cannon-es';

import {PhysicsWorld} from './physics-world';
import {Weapon} from "../entity/md5model/weapon/weapon";

export class CollisionModel {
    private readonly _position = new Vector3();
    private readonly _quaternion = new Quaternion();

    private readonly hitPoint = new Vec3();
    private readonly forceVector = new Vec3();

    constructor(readonly bodies: CollisionModelBody[]) {
    }

    register(physicsWorld: PhysicsWorld, scene: Scene) {
        for (const body of this.bodies) {
            physicsWorld.addBody(body);
            if (body.helper) {
                scene.add(body.helper);
            }
        }
    }

    update(_deltaTime: number) {
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            if (body.helper) {
                const position = body.position;
                body.helper.position.set(position.x, position.y, position.z);

                const quaternion = body.quaternion;
                body.helper.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }
        }
    }

    hasMass(): boolean {
        if (this.bodies.length > 0) {
            const body = this.bodies[0];
            return body.mass > 0;
        }
        return false;
    }

    get position(): Vector3 {
        if (this.bodies.length > 0) {
            const body = this.bodies[0];
            this._position.set(body.position.x, body.position.y, body.position.z);
        }
        return this._position;
    }

    get quaternion(): Quaternion {
        if (this.bodies.length > 0) {
            const body = this.bodies[0];
            this._quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
        }
        return this._quaternion;
    }

    onAttack(hitPoint: Vector3, forceVector: Vector3, _weapon: Weapon) {
        if (this.hasMass()) {
            this.hitPoint.set(hitPoint.x, hitPoint.y, hitPoint.z);
            this.forceVector.set(forceVector.x, forceVector.y, forceVector.z);
            const body = this.bodies[0];
            body.wakeUp();
            body.applyForce(this.forceVector, this.hitPoint);
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
}