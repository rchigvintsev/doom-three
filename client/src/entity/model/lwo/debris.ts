import {Audio, Intersection, Scene, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {LwoModel} from './lwo-model';
import {TangibleEntity} from '../../tangible-entity';
import {ModelParameters} from '../model-parameters';
import {ContactEquation} from 'equations/ContactEquation';
import {CollisionModelBody} from '../../../physics/collision-model';
import {PhysicsSystem} from '../../../physics/physics-system';
import {Weapon} from '../md5/weapon/weapon';

export class Debris extends LwoModel implements TangibleEntity {
    readonly tangibleEntity = true;

    onShow?: (debris: Debris) => void;
    onHide?: (debris: Debris) => void;

    private bounceSound?: Audio<AudioNode>;

    constructor(parameters: DebrisParameters) {
        super(parameters);
        this.visible = false;

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

    onAttack(_intersection: Intersection, _forceVector: Vector3, _weapon: Weapon) {
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

    private initBounceSound() {
        const bounceSounds = this.getRequiredSounds(<DebrisParameters>this.parameters, 'bounce');
        this.bounceSound = bounceSounds[randomInt(0, bounceSounds.length)];
        if (!this.bounceSound.parent) {
            this.add(this.bounceSound);
        }
    }

    private playBounceSound(delay?: number) {
        if (this.bounceSound) {
            if (!this.bounceSound.isPlaying) {
                this.bounceSound.play(delay);
            } else {
                this.bounceSound.stop().play(delay);
            }
        }
    }

    private doShow() {
        this.initBounceSound();
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

export interface DebrisParameters extends ModelParameters {
    time: number;
    sounds?: Map<string, Audio<AudioNode>[]>;
}
