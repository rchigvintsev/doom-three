import {Group, Light, Mesh} from 'three';

import {Area} from '../area/area';
import {Entity} from '../entity';

export class GameMap extends Group implements Entity {
    weapons: Mesh[] = [];

    constructor(readonly areas: Area[], readonly lights: Light[]) {
        super();
        for (const area of areas) {
            this.add(area);
        }
        for (const light of lights) {
            this.add(light);
        }
    }

    update(deltaTime: number): void {
        for (const area of this.areas) {
            area.update(deltaTime);
        }
        for (const weapon of this.weapons) {
            const animationMixer = weapon.userData['animationMixer'];
            if (animationMixer) {
                animationMixer.update(deltaTime);
            }
        }
    }
}