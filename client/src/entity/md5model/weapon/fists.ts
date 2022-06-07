import {Audio, BufferGeometry, Material} from 'three';

import {Md5Model} from '../md5-model';

export class Fists extends Md5Model {
    private enabled = false;

    constructor(geometry: BufferGeometry, materials: Material | Material[], sounds: Map<string, Audio<AudioNode>>) {
        super(geometry, materials, sounds);
    }

    enable() {
        if (!this.enabled) {
            const raiseAction = this.getRequiredAnimationAction('raise');
            const idleAction = this.getRequiredAnimationAction('idle');
            this.executeActionCrossFade(raiseAction, idleAction, 0.40);
            this.playRaiseSound();
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

    private playRaiseSound() {
        const raiseSound = this.getRequiredSound('raise');
        if (!raiseSound.isPlaying) {
            raiseSound.play(0.1);
        }
    }
}
