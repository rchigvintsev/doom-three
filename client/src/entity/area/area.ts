import {Group, Light} from 'three';

import {Surface} from '../surface/surface';
import {Entity} from '../entity';
import {PhysicsWorld} from '../../physics/physics-world';

export class Area extends Group implements Entity {
    constructor(readonly surfaces: Surface[], readonly lights: Light[]) {
        super();
        for (const surface of surfaces) {
            this.add(surface);
        }
        for (const light of lights) {
            this.add(light);
        }
    }

    registerCollisionModels(physicsWorld: PhysicsWorld): void {
        this.surfaces.forEach(surface => surface.registerCollisionModels(physicsWorld));
    }

    update(deltaTime: number): void {
        for (const surface of this.surfaces) {
            surface.update(deltaTime);
        }
    }
}