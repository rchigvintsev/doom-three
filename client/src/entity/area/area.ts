import {Group, Intersection, Light, Scene, Vector3} from 'three';

import {Surface} from '../surface/surface';
import {Weapon} from '../model/md5/weapon/weapon';
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

    onAttack(_intersection: Intersection, _forceVector: Vector3, _weapon: Weapon) {
        // Do nothing
    }
}