import {Material, Mesh, MeshBasicMaterial} from 'three';
import {DecalGeometry} from 'three/examples/jsm/geometries/DecalGeometry';

import {Tween} from '@tweenjs/tween.js';

import {Entity} from '../entity';

export class Decal extends Mesh implements Entity {
    onShow?: (decal: Decal) => void;
    onHide?: (decal: Decal) => void;

    private readonly fadeOutTween: Tween<{lightness: number}>;

    constructor(private readonly parameters: DecalParameters) {
        super(parameters.geometry, parameters.material);
        this.visible = false;

        const fadeOutTime = this.parameters.time * this.parameters.fadeOut;
        this.fadeOutTween = new Tween({lightness: 1})
            .to({lightness: 0}, fadeOutTime)
            .delay(this.parameters.time - fadeOutTime)
            .onUpdate(o => (<MeshBasicMaterial>this.material).color.setHSL(0, 0, o.lightness))
            .onComplete(() => this.doHide());
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
        this.fadeOutTween.start();
        if (this.onShow) {
            this.onShow(this);
        }
    }

    private doHide() {
        this.visible = false;
        this.fadeOutTween.stop();
        if (this.onHide) {
            this.onHide(this);
        }
    }
}

export interface DecalParameters {
    geometry: DecalGeometry;
    material: Material;
    time: number;
    fadeOut: number;
}
