import {Group, Light} from 'three';

import {Area} from '../area/area';

export class GameMap extends Group {
    constructor(readonly areas: Area[], readonly lights: Light[]) {
        super();
        for (const area of areas) {
            this.add(area);
        }
        for (const light of lights) {
            this.add(light);
        }
    }
}