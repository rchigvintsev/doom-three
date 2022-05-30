import {Group, Light} from 'three';

import {Surface} from '../surface/surface';
import {Entity} from '../entity';

export class Area extends Group implements Entity {
    constructor(readonly surfaces: Surface[], readonly lights: Light[]) {
        super();
        for (const surface of surfaces) {
            this.add(surface);
        }
        for (const light of lights) {
            this.add(light);
        }
    }

    update(deltaTime: number): void {
        for (const surface of this.surfaces) {
            surface.update(deltaTime);
        }
    }
}