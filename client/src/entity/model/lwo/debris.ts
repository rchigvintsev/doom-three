import {Intersection, Scene, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {LwoModel} from './lwo-model';
import {TangibleEntity} from '../../tangible-entity';
import {ModelParameters} from '../model-parameters';
import {ContactEquation} from 'equations/ContactEquation';
import {CollisionModelBody} from '../../../physics/collision-model';
import {Weapon} from '../md5/weapon/weapon';
import {Sound} from '../../sound/sound';
import {PhysicsManager} from '../../../physics/physics-manager';

export class Debris extends LwoModel implements TangibleEntity {
    readonly tangibleEntity = true;

    onShow?: (debris: Debris) => void;
    onHide?: (debris: Debris) => void;

    private audioIndex?: number;

    constructor(parameters: DebrisParameters) {
        super(parameters);
        this.visible = false;

        if (parameters.collisionModel) {
            parameters.collisionModel.bodies[0].addEventListener('collide', (e: any) => this.onCollide(e));
        }
    }

    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        if (this.collisionModel) {
            this.collisionModel.register(physicsManager, scene);
        }
    }

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        if (this.collisionModel) {
            this.collisionModel.unregister(physicsManager, scene);
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

    private onCollide(event: {body: CollisionModelBody, target: CollisionModelBody, contact: ContactEquation}) {
        const relativeVelocity = event.contact.getImpactVelocityAlongNormal();
        if (Math.abs(relativeVelocity) > 1.0) {
            this.playBounceSound();
        }
    }

    private playBounceSound(delay?: number) {
        const sound = (<DebrisParameters>this.parameters).sounds.get('bounce');
        if (sound) {
            if (!sound.parent) {
                this.add(sound);
            }
            sound.play(delay, this.audioIndex);
        }
    }

    private doShow() {
        this.audioIndex = randomInt(0, 10);
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
    sounds: Map<string, Sound>;
}
