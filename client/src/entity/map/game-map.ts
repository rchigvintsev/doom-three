import {Group, Light} from 'three';

import {Area} from '../area/area';
import {Entity} from '../entity';
import {Md5Model} from '../md5model/md5-model';

export class GameMap extends Group implements Entity {
    weapons: Md5Model[] = [];

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
            weapon.update(deltaTime);
        }
    }
}