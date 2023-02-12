import {Audio, Euler, MathUtils, Vector3} from 'three';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';
import {Game} from '../../../../game';

export abstract class Monster extends Md5Model {
    protected readonly direction = new Vector3();
    protected readonly positionOffset = new Vector3();

    private playingSound?: Audio<AudioNode>;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        this.updateDirection();
        if (this.isIdle()) {
            this.resetSkeletonPosition();
        }
    }

    protected isIdle(): boolean {
        return this.currentState === MonsterState.IDLE;
    }

    protected isWalking(): boolean {
        return this.currentState === MonsterState.WALKING;
    }

    protected isPlayingSound(): boolean {
        return !!this.playingSound;
    }

    protected playSound(soundName: string, delay?: number, onEnded?: () => void): Audio<AudioNode> {
        const sound = super.playSound(soundName, delay, () => {
            this.playingSound = undefined;
            if (onEnded) {
                onEnded();
            }
        });
        if (!sound.parent) {
            this.add(sound);
        }
        this.playingSound = sound;
        return sound;
    }


    protected playSoundOnce(soundName: string, delay?: number, onEnded?: () => void): Audio<AudioNode> {
        if (this.playingSound) {
            return this.playingSound;
        }

        const sound = super.playSoundOnce(soundName, delay, () => {
            this.playingSound = undefined;
            if (onEnded) {
                onEnded();
            }
        });
        if (!sound.parent) {
            this.add(sound);
        }
        this.playingSound = sound;
        return sound;
    }

    private updateDirection = (() => {
        const directionRotation = new Euler();

        return () => {
            directionRotation.set(this.rotation.x, this.rotation.y, this.rotation.z - MathUtils.degToRad(90));
            this.getWorldDirection(this.direction).applyEuler(directionRotation);
        };
    })();

    private resetSkeletonPosition() {
        this.skeleton.bones[0].position.x = 0;
        this.skeleton.bones[0].position.z = 0;
    }
}

export class MonsterState extends Md5ModelState {
    static readonly IDLE = 'idle';
    static readonly WALKING = 'walking';
}
