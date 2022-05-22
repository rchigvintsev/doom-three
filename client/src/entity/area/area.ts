import {Group, Light} from 'three';

import {Surface} from '../surface/surface';

export class Area extends Group {
    constructor(readonly surfaces: Surface[], readonly lights: Light[]) {
        super();
        for (const surface of surfaces) {
            this.add(surface);
        }
        for (const light of lights) {
            this.add(light);
        }
    }
}