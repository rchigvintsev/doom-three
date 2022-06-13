import {Group, Light, Scene} from 'three';

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

    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene) {
        this.surfaces.forEach(surface => surface.registerCollisionModels(physicsWorld, scene));
    }

    update(deltaTime: number) {
        for (const surface of this.surfaces) {
            surface.update(deltaTime);
        }
    }
}