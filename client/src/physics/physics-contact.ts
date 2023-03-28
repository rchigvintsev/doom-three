import {Vector3} from 'three';

export class PhysicsContact {
    constructor(readonly impactVelocityAlongNormal: number, readonly normal: Vector3) {
    }
}
