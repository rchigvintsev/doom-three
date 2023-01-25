import {Audio} from 'three';

import {randomInt} from 'mathjs';

import {GameSystem} from '../game-system';
import {SoundFactory} from '../entity/sound/sound-factory';

export class SoundSystem implements GameSystem {
    private readonly sounds = new Map<string, Audio<AudioNode>[]>();
    private readonly availableSounds = new Map<string, Audio<AudioNode>[]>();

    constructor(private readonly soundFactory: SoundFactory) {
    }

    createSound(soundName: string): Audio<AudioNode> {
        let sound = this.getAvailableSound(soundName);
        if (!sound) {
            const sounds = this.createSounds(soundName);
            this.setSounds(soundName, ...sounds);
            console.debug(`Sounds "${soundName}" are created`);
            sound = this.pickRandomSound(sounds);
            if (sounds.length > 0) {
                this.setAvailableSounds(soundName, ...sounds);
            }
        }
        return sound;
    }

    update(_deltaTime: number) {
        // Do nothing
    }

    findSounds(...soundNames: string[]): Audio<AudioNode>[] {
        const result = [];
        for (const soundName of soundNames) {
            const sounds = this.sounds.get(soundName);
            if (sounds) {
                result.push(...sounds);
            }
        }
        return result;
    }

    private getAvailableSound(soundName: string): Audio<AudioNode> | undefined {
        const sounds = this.availableSounds.get(soundName);
        if (sounds != undefined && sounds.length > 0) {
            return this.pickRandomSound(sounds);
        }
        return undefined;
    }

    private createSounds(soundName: string): Audio<AudioNode>[] {
        const sounds = this.soundFactory.create(soundName);
        for (const sound of sounds) {
            sound.onEnded = () => {
                sound.isPlaying = false;
                if (sound.parent) {
                    sound.parent.remove(sound);
                }
                this.setAvailableSounds(soundName, sound);
            };
        }
        return sounds;
    }

    private setSounds(soundName: string, ...sounds: Audio<AudioNode>[]) {
        let soundsByName = this.sounds.get(soundName);
        if (soundsByName == undefined) {
            this.sounds.set(soundName, soundsByName = []);
        }
        soundsByName.push(...sounds);
    }

    private setAvailableSounds(soundName: string, ...sounds: Audio<AudioNode>[]) {
        let soundsByName = this.availableSounds.get(soundName);
        if (soundsByName == undefined) {
            this.availableSounds.set(soundName, soundsByName = []);
        }
        soundsByName.push(...sounds);
    }

    private pickRandomSound(sounds: Audio<AudioNode>[]): Audio<AudioNode> {
        const idx = randomInt(0, sounds.length);
        return sounds.splice(idx, 1)[0];
    }
}
