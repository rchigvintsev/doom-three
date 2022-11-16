import {Audio, Scene, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {LwoModel} from './lwo-model';
import {TangibleEntity} from '../../tangible-entity';
import {ModelParameters} from '../model-parameters';
import {ContactEquation} from 'equations/ContactEquation';
import {CollisionModelBody} from '../../../physics/collision-model';
import {PhysicsSystem} from '../../../physics/physics-system';
import {Weapon} from '../md5/weapon/weapon';

export class Debris extends LwoModel implements TangibleEntity {
    onShow?: (debris: Debris) => void;
    onHide?: (debris: Debris) => void;

    private readonly bounceSound: Audio<AudioNode>;

    constructor(parameters: DebrisParameters) {
        super(parameters);
        this.visible = false;

        const bounceSounds = this.getRequiredSounds(parameters, 'bounce');
        this.bounceSound = bounceSounds[randomInt(0, bounceSounds.length)];
        this.add(this.bounceSound);

        if (parameters.collisionModel) {
            parameters.collisionModel.bodies[0].addEventListener('collide', (e: any) => this.onCollide(e));
        }
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        if (this.collisionModel) {
            this.collisionModel.register(physicsSystem, scene);
        }
    }

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        if (this.collisionModel) {
            this.collisionModel.unregister(physicsSystem, scene);
        }
    }

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon) {
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

    private doShow() {
        this.visible = true;
        this.hide((<DebrisParameters>this.parameters).time);
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

export class DebrisParameters extends ModelParameters {
    time!: number;
    sounds?: Map<string, Audio<AudioNode>[]>;
}
