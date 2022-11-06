import {Audio} from 'three';

import {randomInt} from 'mathjs';

import {LwoModel} from './lwo-model';
import {ModelParameters} from '../model-parameters';
import {ContactEquation} from 'equations/ContactEquation';
import {CollisionModelBody} from '../../../physics/collision-model';

export class Debris extends LwoModel {
    onHide?: () => void;

    private readonly bounceSound: Audio<AudioNode>;

    constructor(parameters: DebrisParameters) {
        super(parameters);

        const bounceSounds = this.getRequiredSounds(parameters, 'bounce');
        this.bounceSound = bounceSounds[randomInt(0, bounceSounds.length)];
        this.add(this.bounceSound);

        if (parameters.collisionModel) {
            parameters.collisionModel.bodies[0].addEventListener('collide', (e: any) => this.onCollide(e));
        }
    }

    private getRequiredSounds(parameters: DebrisParameters, soundName: string): Audio<AudioNode>[] {
        const sounds = parameters.sounds?.get(soundName);
        if (!sounds) {
            throw new Error(`Sounds "${soundName}" are not found in debris model "${this.name}"`);
        }
        return sounds;
    }

    private onCollide(event: {body: CollisionModelBody, target: CollisionModelBody, contact: ContactEquation}) {
        const relativeVelocity = event.contact.getImpactVelocityAlongNormal();
        if (Math.abs(relativeVelocity) > 1.0) {
            this.playBounceSound();
        }
    }

    private playBounceSound(delay?: number) {
        if (!this.bounceSound.isPlaying) {
            this.bounceSound.play(delay);
        } else {
            this.bounceSound.stop().play(delay);
        }
    }
}

export class DebrisParameters extends ModelParameters {
    sounds?: Map<string, Audio<AudioNode>[]>;
}
