import {Group, Light} from 'three';

import {Area} from '../area/area';
import {Entity} from '../entity';
import {PhysicsWorld} from '../../physics/physics-world';

export class GameMap extends Group implements Entity {
    constructor(readonly areas: Area[], readonly lights: Light[]) {
        super();
        for (const area of areas) {
            this.add(area);
        }
        for (const light of lights) {
            this.add(light);
        }
    }

    registerCollisionModels(physicsWorld: PhysicsWorld): void {
        this.areas.forEach(area => area.registerCollisionModels(physicsWorld));
    }

    update(deltaTime: number): void {
        for (const area of this.areas) {
            area.update(deltaTime);
        }
    }
}