import {Group} from 'three';

import {Surface} from '../surface/surface';

export class Area extends Group {
    constructor(readonly surfaces: Surface[]) {
        super();
        for (const surface of surfaces) {
            this.add(surface);
        }
    }
}