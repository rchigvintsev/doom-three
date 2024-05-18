import {Intersection, Quaternion, Ray, Vector3} from 'three';

import {Constraint, Vec3} from 'cannon-es';

import {Position} from '../../util/position';
import {PhysicsManager} from '../physics-manager';
import {CollisionModel} from '../collision-model';
import {CannonPhysicsBody} from './cannon-physics-body';
import {CollideEvent} from '../../event/collide-event';
import {PhysicsContact} from '../physics-contact';
import {Weapon} from '../../entity/model/md5/weapon/weapon';
import {PhysicsBody} from '../physics-body';
import {Game} from '../../game';

export class CannonCollisionModel implements CollisionModel {
    onHitCallback?: (body: PhysicsBody, weapon: Weapon, ray: Ray, intersection: Intersection) => void;
    onUpdateCallback?: (position: Position, quaternion: Quaternion) => void;

    readonly position = new Position();
    readonly quaternion = new Quaternion();

    constructor(protected readonly parameters: CannonCollisionModelParameters) {
        this.position._onChange(() => this.onPositionChange());
        this.quaternion._onChange(() => this.onQuaternionChange());
    }

    get bodies(): CannonPhysicsBody[] {
        return this.parameters.bodies;
    }

    bodyByName(name: string): CannonPhysicsBody | undefined {
        return this.findBodyByName(name, this.bodies);
    }

    hasMass(): boolean {
        return this.firstBody.mass > 0;
    }

    register(physicsManager: PhysicsManager) {
        for (const body of this.parameters.bodies) {
            physicsManager.addBody(body);
            if (body.helper) {
                Game.getContext().scene.add(body.helper);
            }
        }

        for (const constraint of this.parameters.constraints) {
            physicsManager.addConstraint(constraint);
        }
    }

    unregister(physicsManager: PhysicsManager) {
        for (const body of this.parameters.bodies) {
            physicsManager.removeBody(body);
            body.reset();
            if (body.helper) {
                Game.getContext().scene.remove(body.helper);
            }
        }

        for (const constraint of this.parameters.constraints) {
            physicsManager.removeConstraint(constraint);
        }
    }

    update(_deltaTime: number) {
        this.updateBodies(this.bodies);
        if (this.onUpdateCallback) {
            this.onUpdateCallback(this.position, this.quaternion);
        }
    }

    onAttack(weapon: Weapon, force: Vector3, ray: Ray, intersection: Intersection) {
        if (this.hasMass()) {
            this.applyImpulse(this.firstBody, force, intersection.point);
        }
        if (this.onHitCallback) {
            this.onHitCallback(this.firstBody, weapon, ray, intersection);
        }
    }

    applyImpulse = (() => {
        const cannonImpulse = new Vec3();
        const cannonRelativePoint = new Vec3();

        return (body: CannonPhysicsBody, impulse: Vector3, relativePoint?: Vector3) => {
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

    wakeUp(): void {
        for (const body of this.bodies) {
            body.wakeUp();
        }
    }

    protected get firstBody(): CannonPhysicsBody {
        return this.bodies[0];
    }

    protected updateBodies(bodies: CannonPhysicsBody[]) {
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            body.update();
            if (i === 0) {
                this.position.setFromVector3(body.getPosition());
                this.quaternion.copy(body.getQuaternion());
            }
        }
    }

    protected findBodyByName(name: string, bodies: CannonPhysicsBody[]): CannonPhysicsBody | undefined {
        return bodies.find(body => body.name === name);
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

export interface CannonCollisionModelParameters {
    bodies: CannonPhysicsBody[];
    constraints: Constraint[];
}
