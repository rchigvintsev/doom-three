import {Quaternion, Ray, Scene, Vector3} from 'three';

import {Constraint, Vec3} from 'cannon-es';

import {Position} from '../../util/position';
import {PhysicsManager} from '../physics-manager';
import {CollisionModel} from '../collision-model';
import {CannonPhysicsBody} from './cannon-physics-body';
import {CollideEvent} from '../../event/collide-event';
import {PhysicsContact} from '../physics-contact';
import {Weapon} from '../../entity/model/md5/weapon/weapon';
import {PhysicsBody} from '../physics-body';

export class CannonCollisionModel implements CollisionModel {
    onHitCallback?: (body: PhysicsBody, weapon: Weapon) => void;
    onUpdateCallback?: (position: Position, quaternion: Quaternion) => void;

    readonly position = new Position();
    readonly quaternion = new Quaternion();

    constructor(readonly bodies: CannonPhysicsBody[], readonly constraints: Constraint[] = []) {
        this.position._onChange(() => this.onPositionChange());
        this.quaternion._onChange(() => this.onQuaternionChange());
    }

    getBody(name: string): CannonPhysicsBody | undefined {
        for (const body of this.bodies) {
            if (body.name === name) {
                return body;
            }
        }
    }

    hasMass(): boolean {
        return this.firstBody.mass > 0;
    }

    register(physicsManager: PhysicsManager, scene: Scene) {
        for (const body of this.bodies) {
            physicsManager.addBody(body);
            if (body.helper) {
                scene.add(body.helper);
            }
        }

        for (const constraint of this.constraints) {
            physicsManager.addConstraint(constraint);
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

        for (const constraint of this.constraints) {
            physicsManager.removeConstraint(constraint);
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

        if (this.onUpdateCallback) {
            this.onUpdateCallback(this.position, this.quaternion);
        }
    }

    onAttack(weapon: Weapon, force: Vector3, ray: Ray, hitPoint: Vector3) {
        if (this.hasMass()) {
            this.applyImpulse(force, hitPoint);
        }
        if (this.onHitCallback) {
            this.onHitCallback(this.firstBody, weapon);
        }
    }

    applyImpulse = (() => {
        const cannonImpulse = new Vec3();
        const cannonRelativePoint = new Vec3();

        return (impulse: Vector3, relativePoint?: Vector3) => {
            const body = this.firstBody;
            body.wakeUp();
            cannonImpulse.set(impulse.x, impulse.y, impulse.z);
            if (relativePoint) {
                cannonRelativePoint.set(relativePoint.x, relativePoint.y, relativePoint.z);
                body.applyImpulse(cannonImpulse, cannonRelativePoint);
            } else {
                body.applyImpulse(cannonImpulse);
            }
        };
    })();

    addCollideEventListener(listener: (e: CollideEvent) => void) {
        this.firstBody.addEventListener(CollideEvent.TYPE, (e: any) => {
            const contactNormal = new Vector3(e.contact.ni.x, e.contact.ni.y, e.contact.ni.z);
            const contact = new PhysicsContact(e.contact.getImpactVelocityAlongNormal(), contactNormal);
            return listener(new CollideEvent(e.body, contact, e.target));
        });
    }

    private get firstBody(): CannonPhysicsBody {
        return this.bodies[0];
    }

    private onPositionChange() {
        const body = this.firstBody;
        body.position.set(this.position.x, this.position.y, this.position.z);
        body.helper?.position.set(this.position.x, this.position.y, this.position.z);
    }

    private onQuaternionChange() {
        const body = this.firstBody;
        body.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
        body.helper?.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
    }
}
