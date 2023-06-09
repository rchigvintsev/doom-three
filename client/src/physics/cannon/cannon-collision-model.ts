import {Quaternion, Ray, Scene, Vector3} from 'three';

import {Constraint, Vec3} from 'cannon-es';

import {Position} from '../../util/position';
import {PhysicsManager} from '../physics-manager';
import {Weapon} from '../../entity/model/md5/weapon/weapon';
import {CollisionModel} from '../collision-model';
import {CannonPhysicsBody} from './cannon-physics-body';
import {CollideEvent} from '../../event/collide-event';
import {PhysicsContact} from '../physics-contact';

export class CannonCollisionModel implements CollisionModel {
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
        const body = this.firstBody;
        return !!body && body.mass > 0;
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

        if (this.onUpdate) {
            this.onUpdate(this.position, this.quaternion);
        }
    }

    onAttack(_ray: Ray, hitPoint: Vector3, forceVector: Vector3, _weapon: Weapon) {
        if (this.hasMass()) {
            this.applyImpulse(forceVector, hitPoint);
        }
    }

    applyImpulse = (() => {
        const cannonImpulse = new Vec3();
        const cannonRelativePoint = new Vec3();

        return (impulse: Vector3, relativePoint?: Vector3) => {
            const body = this.firstBody;
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

    addCollideEventListener(listener: (e: CollideEvent) => void) {
        this.firstBody?.addEventListener(CollideEvent.TYPE, (e: any) => {
            const contactNormal = new Vector3(e.contact.ni.x, e.contact.ni.y, e.contact.ni.z);
            const contact = new PhysicsContact(e.contact.getImpactVelocityAlongNormal(), contactNormal);
            return listener(new CollideEvent(e.body, contact, e.target));
        });
    }

    onUpdate: (position: Position, quaternion: Quaternion) => void = () => {
        // Do nothing by default
    };

    private get firstBody(): CannonPhysicsBody | undefined {
        return this.bodies.length > 0 ? this.bodies[0] : undefined;
    }

    private onPositionChange() {
        const body = this.firstBody;
        if (body) {
            body.position.set(this.position.x, this.position.y, this.position.z);
            body.helper?.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    private onQuaternionChange() {
        const body = this.firstBody;
        if (body) {
            body.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
            body.helper?.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
        }
    }
}
