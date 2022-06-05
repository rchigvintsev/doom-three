import {BufferGeometry, Material} from 'three';
import {Md5Model} from '../md5-model';

export class Fists extends Md5Model {
    private enabled = false;

    constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }

    enable() {
        if (!this.enabled) {
            const raiseAction = this.getRequiredAnimationAction('raise');
            const idleAction = this.getRequiredAnimationAction('idle');
            this.executeActionCrossFade(raiseAction, idleAction, 0.40);
            this.enabled = true;
        }
    }

    disable() {
        if (this.enabled) {
            const idleAction = this.getRequiredAnimationAction('idle');
            const lowerAction = this.getRequiredAnimationAction('lower');
            this.executeActionCrossFade(idleAction, lowerAction, 0.25);
            this.enabled = false;
        }
    }
}
