import {Group, Light, Scene, Vector3} from 'three';

import {Surface} from '../surface/surface';
import {Entity} from '../entity';
import {PhysicsSystem} from '../../physics/physics-system';
import {Weapon} from '../model/md5/weapon/weapon';

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

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.surfaces.forEach(surface => surface.registerCollisionModels(physicsSystem, scene));
    }

    update(deltaTime: number) {
        for (const surface of this.surfaces) {
            surface.update(deltaTime);
        }
    }

    onAttacked(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing
    }
}