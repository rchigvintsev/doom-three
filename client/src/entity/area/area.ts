import {Group, Light, Scene, Vector3} from 'three';

import {Surface} from '../surface/surface';
import {Entity} from '../entity';
import {PhysicsWorld} from '../../physics/physics-world';
import {Weapon} from '../md5model/weapon/weapon';

export class Area extends Group implements Entity {
    constructor(private readonly surfaces: Surface[], private readonly lights: Light[]) {
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

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing
    }
}