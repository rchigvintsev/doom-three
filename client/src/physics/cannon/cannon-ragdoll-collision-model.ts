import {Ray, Vector3} from 'three';

import {Constraint, Ray as CannonRay, RaycastResult, Vec3} from 'cannon-es';

import {CannonCollisionModel, CannonCollisionModelParameters} from './cannon-collision-model';
import {CannonPhysicsBody} from './cannon-physics-body';
import {Weapon} from '../../entity/model/md5/weapon/weapon';
import {PhysicsManager} from '../physics-manager';
import {RagdollCollisionModel} from '../ragdoll-collision-model';
import {Game} from '../../game';

export class CannonRagdollCollisionModel extends CannonCollisionModel implements RagdollCollisionModel {
    readonly ragdollCollisionModel = true;

    private _dead = false;

    constructor(parameters: CannonRagdollCollisionModelParameters) {
        super(parameters);
    }

    get bodies(): CannonPhysicsBody[] {
        if (!this.dead) {
            return super.bodies;
        }
        return this.deadStateBodies;
    }

    get deadStateBodies(): CannonPhysicsBody[] {
        return (<CannonRagdollCollisionModelParameters>this.parameters).deadStateBodies;
    }

    get dead() {
        return this._dead;
    }

    kill() {
        if (!this.dead) {
            for (const body of this.bodies) {
                if (body.name) {
                    const deadStateBody = this.findBodyByName(body.name, this.deadStateBodies);
                    if (deadStateBody) {
                        deadStateBody.setPosition(body.getPosition());
                        deadStateBody.setQuaternion(body.getQuaternion());
                        this.physicsManager.addBody(deadStateBody);

                        if (body.helper) {
                            deadStateBody.helper = body.helper;
                            deadStateBody.helper.body = deadStateBody;
                            body.helper = undefined; // Otherwise helper will be removed from scene on unregister call
                        }
                    }
                }
            }

            for (const constraint of this.deadStateConstraints) {
                this.physicsManager.addConstraint(constraint);
            }
            this.unregister(this.physicsManager);
            this._dead = true;
        }
    }

    onAttack = (() => {
        const cannonRay = new CannonRay(new Vec3(), new Vec3());
        const raycastResult = new RaycastResult();

        return (weapon: Weapon, force: Vector3, ray: Ray, hitPoint: Vector3) => {
            this.updateRay(ray, cannonRay);
            raycastResult.reset();
            cannonRay.intersectBodies(this.bodies, raycastResult);
            if (raycastResult.body) {
                const hitBody = raycastResult.body as CannonPhysicsBody;
                console.log(`Body "${hitBody.name}" is hit using weapon "${weapon.name}"`);
                this.applyImpulse(hitBody, force, hitPoint);
                if (this.onHitCallback) {
                    this.onHitCallback(hitBody, weapon);
                }
            }
        };
    })();

    private get physicsManager(): PhysicsManager {
        return (<CannonRagdollCollisionModelParameters>this.parameters).physicsManager;
    }

    private get deadStateConstraints(): Constraint[] {
        return (<CannonRagdollCollisionModelParameters>this.parameters).deadStateConstraints;
    }

    private updateRay(source: Ray, target: CannonRay) {
        const origin = source.origin;
        const direction = source.direction;
        const worldScale = Game.getContext().config.worldScale;

        target.from.set(origin.x, origin.y, origin.z);
        target.to.set(origin.x + direction.x / worldScale, origin.y + direction.y / worldScale,
            origin.z + direction.z / worldScale);
    }
}

export interface CannonRagdollCollisionModelParameters extends CannonCollisionModelParameters {
    physicsManager: PhysicsManager;
    deadStateBodies: CannonPhysicsBody[];
    deadStateConstraints: Constraint[];
}