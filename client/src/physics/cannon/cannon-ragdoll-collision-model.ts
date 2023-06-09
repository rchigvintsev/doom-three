import {Ray, Vector3} from 'three';

import {Constraint, Ray as CannonRay, RaycastResult, Vec3} from 'cannon-es';

import {CannonCollisionModel} from './cannon-collision-model';
import {CannonPhysicsBody} from './cannon-physics-body';
import {Weapon} from '../../entity/model/md5/weapon/weapon';

export class CannonRagdollCollisionModel extends CannonCollisionModel {
    constructor(bodies: CannonPhysicsBody[], constraints: Constraint[] = [], private readonly worldScale: number) {
        super(bodies, constraints);
    }

    onAttack = (() => {
        const cannonRay = new CannonRay(new Vec3(), new Vec3());
        const raycastResult = new RaycastResult();

        return (ray: Ray, _hitPoint: Vector3, _forceVector: Vector3, weapon: Weapon) => {
            this.updateRay(ray, cannonRay);
            raycastResult.reset();
            cannonRay.intersectBodies(this.bodies, raycastResult);
            if (raycastResult.body) {
                const hitBody = raycastResult.body as CannonPhysicsBody;
                console.log(`Body "${hitBody.name}" is hit using weapon "${weapon.name}"`);
            }
        };
    })();

    private updateRay(source: Ray, target: CannonRay) {
        const origin = source.origin;
        const direction = source.direction;

        target.from.set(origin.x, origin.y, origin.z);
        target.to.set(origin.x + direction.x / this.worldScale, origin.y + direction.y / this.worldScale,
            origin.z + direction.z / this.worldScale);
    }
}
