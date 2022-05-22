import {Group} from 'three';

import {Area} from '../area/area';

export class GameMap extends Group {
    constructor(readonly areas: Area[]) {
        super();
        for (const area of areas) {
            this.add(area);
        }
    }
}