import {Scene, Vector3} from 'three';

import {Vec3} from 'cannon-es';

import {CollisionModel} from '../../physics/collision-model';
import {isNamedShape} from '../../physics/cannon/named-shape';
import {NamedSphere} from '../../physics/cannon/named-sphere';
import {PhysicsWorld} from '../../physics/physics-world';

export class PlayerCollisionModel extends CollisionModel {
    private readonly originOffset = new Vec3();
    private readonly headOffset = new Vec3();
    private readonly contactNormal = new Vec3();
    private readonly upAxis = new Vec3(0, 1, 0);

    private readonly _headPosition = new Vector3();

    constructor(private readonly delegate: CollisionModel) {
        super([]);

        const body = this.delegate.bodies[0];
        for (let i = 0; i < body.shapes.length; i++) {
            const shape = body.shapes[i];
            if (isNamedShape(shape)) {
                const shapeName = shape.name;
                if (shapeName === 'head') {
                    this.headOffset.copy(body.shapeOffsets[i]);
                } else if (shapeName === 'bottom-body') {
                    this.originOffset.y = (<NamedSphere>shape).radius;
                }
            }
        }
    }

    register(physicsWorld: PhysicsWorld, scene: Scene) {
        for (const body of this.delegate.bodies) {
            physicsWorld.addBody(body);
            if (body.helper) {
                scene.add(body.helper);
            }
        }
    }

    update(deltaTime: number) {
        this.delegate.update(deltaTime);
    }

    move(velocity: Vector3) {
        const body = this.delegate.bodies[0];
        body.velocity.x = velocity.x;
        body.velocity.z = velocity.z;
    }

    jump(speed: number) {
        const body = this.delegate.bodies[0];
        body.velocity.y = speed;
    }

    hasGroundContacts() {
        const body = this.delegate.bodies[0];
        const world = body.world;
        if (world) {
            for (const contact of world.contacts) {
                if (contact.bi.id === body.id || contact.bj.id === body.id) {
                    if (contact.bi.id === body.id) {
                        contact.ni.negate(this.contactNormal); // Flip contact normal
                    } else {
                        this.contactNormal.copy(contact.ni); // Keep contact normal as it is
                    }
                    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat
                    // in the up direction.
                    if (this.contactNormal.dot(this.upAxis) > 0.5) { // Use "good" threshold value between 0 and 1 here
                        return true;
                    }
                }
            }
        }
        return false;
    }

    set origin(origin: Vector3) {
        this.delegate.bodies[0].position = new Vec3(origin.x, origin.y, origin.z).vadd(this.originOffset);
    }

    get headPosition(): Vector3 {
        const bodyPosition = this.delegate.bodies[0].position;
        const x = bodyPosition.x + this.headOffset.x;
        const y = bodyPosition.y + this.headOffset.y;
        const z = bodyPosition.z + this.headOffset.z;
        this._headPosition.set(x, y, z);
        return this._headPosition;
    }
}