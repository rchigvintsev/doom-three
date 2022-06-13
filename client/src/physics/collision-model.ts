import {Object3D, Scene} from 'three';

import {Body, BodyType, Material, Quaternion, Shape, Vec3} from 'cannon-es';
import {PhysicsWorld} from './physics-world';

export class CollisionModel {
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