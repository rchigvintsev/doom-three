import {Material, Mesh} from 'three';

import {Entity} from '../entity';
import {DecalGeometry} from 'three/examples/jsm/geometries/DecalGeometry';

export class Decal extends Mesh implements Entity {
    onShow?: (decal: Decal) => void;
    onHide?: (decal: Decal) => void;

    constructor(private readonly parameters: DecalParameters) {
        super(parameters.geometry, parameters.material);
        this.visible = false;
    }

    init() {
        // Do nothing
    }

    update(_deltaTime: number) {
        // Do nothing
    }

    show(delay = 0) {
        if (delay > 0) {
            setTimeout(() => this.doShow(), delay);
        } else {
            this.doShow();
        }
    }

    hide(delay = 0) {
        if (delay > 0) {
            setTimeout(() => this.doHide(), delay);
        } else {
            this.doHide();
        }
    }

    private doShow() {
        this.visible = true;
        this.hide(this.parameters.time);
        if (this.onShow) {
            this.onShow(this);
        }
    }

    private doHide() {
        this.visible = false;
        if (this.onHide) {
            this.onHide(this);
        }
    }
}

export interface DecalParameters {
    geometry: DecalGeometry;
    material: Material;
    time: number;
}
