import {Group, Light, Scene} from 'three';

import {Area} from '../area/area';
import {Entity} from '../entity';
import {PhysicsWorld} from '../../physics/physics-world';
import {Player} from '../player/player';

export class GameMap extends Group implements Entity {
    constructor(readonly player: Player, private readonly areas: Area[], private readonly lights: Light[]) {
        super();

        for (const area of areas) {
            this.add(area);
        }

        for (const light of lights) {
            this.add(light);
        }

        this.add(this.player);
        this.player.weapons.forEach(weapon => {
            if (weapon.skeletonHelper) {
                this.add(weapon.skeletonHelper);
            }
        });
    }

    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene) {
        this.areas.forEach(area => area.registerCollisionModels(physicsWorld, scene));
        this.player.registerCollisionModels(physicsWorld, scene);
    }

    update(deltaTime: number) {
        for (const area of this.areas) {
            area.update(deltaTime);
        }
        this.player.update(deltaTime);
    }
}