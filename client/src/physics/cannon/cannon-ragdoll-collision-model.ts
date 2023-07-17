import {Ray, Vector3} from 'three';

import {Constraint, Ray as CannonRay, RaycastResult, Vec3} from 'cannon-es';

import {CannonCollisionModel, CannonCollisionModelParameters} from './cannon-collision-model';
import {CannonPhysicsBody} from './cannon-physics-body';
import {Weapon} from '../../entity/model/md5/weapon/weapon';
import {PhysicsManager} from '../physics-manager';
import {RagdollCollisionModel} from '../ragdoll-collision-model';

export class CannonRagdollCollisionModel extends CannonCollisionModel implements RagdollCollisionModel {
    private _dead = false;

    constructor(parameters: CannonRagdollCollisionModelParameters) {
        super(parameters);
    }

    get dead() {
        return this._dead;
    }

    kill() {
        if (!this._dead) {
            this._dead = true;
            for (const body of this.bodies) {
                if (body.helper) {
                    body.helper.visible = false;
                }

                if (body.name) {
                    const deadStateBody = this.bodyByName(body.name);
                    if (deadStateBody) {
                        deadStateBody.setPosition(body.getPosition());
                        deadStateBody.setQuaternion(body.getQuaternion());
                        this.physicsManager.addBody(deadStateBody);
                        if (deadStateBody.helper) {
                            deadStateBody.helper.visible = true;
                        }
                    }
                }

                this.physicsManager.removeBody(body);
            }

            for (const constraint of this.deadStateConstraints) {
                this.physicsManager.addConstraint(constraint);
            }
        }
    }

    bodyByName(name: string): CannonPhysicsBody | undefined {
        if (this._dead) {
            return this.findBodyByName(name, this.deadStateBodies);
        }
        return super.bodyByName(name);
    }

    update(deltaTime: number) {
        if (this._dead) {
            this.updateBodies(this.deadStateBodies);
            if (this.onUpdateCallback) {
                this.onUpdateCallback(this.position, this.quaternion);
            }
        } else {
            super.update(deltaTime);
        }
    }

    onAttack = (() => {
        const cannonRay = new CannonRay(new Vec3(), new Vec3());
        const raycastResult = new RaycastResult();

        return (weapon: Weapon, _force: Vector3, ray: Ray, _hitPoint: Vector3) => {
            this.updateRay(ray, cannonRay);
            raycastResult.reset();
            cannonRay.intersectBodies(this._dead ? this.deadStateBodies : this.bodies, raycastResult);
            if (raycastResult.body) {
                const hitBody = raycastResult.body as CannonPhysicsBody;
                console.log(`Body "${hitBody.name}" is hit using weapon "${weapon.name}"`);
                if (this.onHitCallback) {
                    this.onHitCallback(hitBody, weapon);
                }
            }
        };
    })();

    protected get firstBody(): CannonPhysicsBody {
        return this._dead ? this.deadStateBodies[0] : this.bodies[0];
    }

    private get physicsManager(): PhysicsManager {
        return (<CannonRagdollCollisionModelParameters>this.parameters).physicsManager;
    }

    private get deadStateBodies(): CannonPhysicsBody[] {
        return (<CannonRagdollCollisionModelParameters>this.parameters).deadStateBodies;
    }

    private get deadStateConstraints(): Constraint[] {
        return (<CannonRagdollCollisionModelParameters>this.parameters).deadStateConstraints;
    }

    private get worldScale(): number {
        return (<CannonRagdollCollisionModelParameters>this.parameters).worldScale;
    }

    private updateRay(source: Ray, target: CannonRay) {
        const origin = source.origin;
        const direction = source.direction;

        target.from.set(origin.x, origin.y, origin.z);
        target.to.set(origin.x + direction.x / this.worldScale, origin.y + direction.y / this.worldScale,
            origin.z + direction.z / this.worldScale);
    }
}

export interface CannonRagdollCollisionModelParameters extends CannonCollisionModelParameters {
    physicsManager: PhysicsManager;
    deadStateBodies: CannonPhysicsBody[];
    deadStateConstraints: Constraint[];
    worldScale: number;
}