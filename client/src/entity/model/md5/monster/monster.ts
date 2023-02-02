import {Audio} from 'three';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';

export abstract class Monster extends Md5Model {
    private playingSound?: Audio<AudioNode>;

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    protected isIdle(): boolean {
        return this.currentState === MonsterState.IDLE;
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
}

export class MonsterState extends Md5ModelState {
    static readonly IDLE = 'idle';
    static readonly WALKING = 'walking';
}
