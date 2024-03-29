import {Group, Light, Scene} from 'three';

import {Surface} from '../surface/surface';
import {TangibleEntity} from '../tangible-entity';
import {PhysicsManager} from '../../physics/physics-manager';

export class Area extends Group implements TangibleEntity {
    readonly tangibleEntity = true;

    constructor(private readonly surfaces: Surface[], private readonly lights: Light[]) {
        super();
        for (const surface of surfaces) {
            this.add(surface);
        }
        for (const light of lights) {
            this.add(light);
        }
    }

    init() {
        // Do nothing
    }

    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.surfaces.forEach(surface => surface.registerCollisionModels(physicsManager, scene));
    }

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.surfaces.forEach(surface => surface.unregisterCollisionModels(physicsManager, scene));
    }

    update(deltaTime: number) {
        for (const surface of this.surfaces) {
            surface.update(deltaTime);
        }
    }
}