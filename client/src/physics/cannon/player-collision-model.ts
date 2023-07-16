import {Quaternion, Ray, Scene, Vector3} from 'three';

import {Vec3} from 'cannon-es';

import {CollisionModel} from '../collision-model';
import {isNamedShape} from './named-shape';
import {NamedSphere} from './named-sphere';
import {PhysicsManager} from '../physics-manager';
import {CannonPhysicsBody} from './cannon-physics-body';
import {Position} from '../../util/position';
import {PhysicsBody} from '../physics-body';
import {CollideEvent} from '../../event/collide-event';
import {Weapon} from '../../entity/model/md5/weapon/weapon';

export class PlayerCollisionModel implements CollisionModel {
    private readonly originOffset = new Vec3();
    private readonly headOffset = new Vec3();
    private readonly contactNormal = new Vec3();
    private readonly upAxis = new Vec3(0, 1, 0);

    private readonly _headPosition = new Vector3();

    constructor(private readonly delegate: CollisionModel) {
        const body = this.firstBody;
        for (let i = 0; i < body.shapes.length; i++) {
            const shape = body.shapes[i];
            if (isNamedShape(shape)) {
                const shapeName = shape.name;
                if (shapeName === 'head') {
                    this.headOffset.copy(body.shapeOffsets[i]);
                } else if (shapeName === 'bottomBody') {
                    this.originOffset.y = (<NamedSphere>shape).radius;
                }
            }
        }
    }

    get position(): Position {
        return this.delegate.position;
    }

    get quaternion(): Quaternion {
        return this.delegate.quaternion;
    }

    get bodies(): PhysicsBody[] {
        return this.delegate.bodies;
    }

    onAttack(weapon: Weapon, force: Vector3, ray: Ray, hitPoint: Vector3) {
        this.delegate.onAttack(weapon, force, ray, hitPoint);
    }

    onHitCallback(body: PhysicsBody, weapon: Weapon) {
        if (this.delegate.onHitCallback) {
            this.delegate.onHitCallback(body, weapon);
        }
    }

    onUpdateCallback(position: Position, quaternion: Quaternion) {
        if (this.delegate.onUpdateCallback) {
            this.delegate.onUpdateCallback(position, quaternion);
        }
    }

    bodyByName(name: string): PhysicsBody | undefined {
        return this.delegate.bodyByName(name);
    }

    hasMass(): boolean {
        return this.delegate.hasMass();
    }

    register(physicsManager: PhysicsManager, _scene: Scene) {
        for (const body of this.delegate.bodies) {
            physicsManager.addBody(body);
        }
    }

    unregister(physicsManager: PhysicsManager, _scene: Scene) {
        for (const body of this.delegate.bodies) {
            physicsManager.removeBody(body);
        }
    }

    update(deltaTime: number) {
        this.delegate.update(deltaTime);
    }

    applyImpulse(impulse: Vector3, relativePoint?: Vector3) {
        this.delegate.applyImpulse(impulse, relativePoint);
    }

    addCollideEventListener(listener: (e: CollideEvent) => void) {
        this.delegate.addCollideEventListener(listener);
    }

    move(velocity: Vector3) {
        const body = this.firstBody;
        body.velocity.x = velocity.x;
        body.velocity.z = velocity.z;
    }

    jump(speed: number) {
        this.firstBody.velocity.y = speed;
    }

    hasGroundContacts() {
        const body = this.firstBody;
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
        this.firstBody.position = new Vec3(origin.x, origin.y, origin.z).vadd(this.originOffset);
    }

    get headPosition(): Vector3 {
        const bodyPosition = this.firstBody.position;
        const x = bodyPosition.x + this.headOffset.x;
        const y = bodyPosition.y + this.headOffset.y;
        const z = bodyPosition.z + this.headOffset.z;
        this._headPosition.set(x, y, z);
        return this._headPosition;
    }

    private get firstBody(): CannonPhysicsBody {
        return this.delegate.bodies[0] as CannonPhysicsBody;
    }
}