import {GameSystem} from '../game-system';
import {SoundFactory} from '../entity/sound/sound-factory';
import {Sound} from '../entity/sound/sound';

export class SoundSystem implements GameSystem {
    private readonly sounds = new Map<string, Sound[]>();

    constructor(private readonly soundFactory: SoundFactory) {
    }

    createSound(soundName: string): Sound {
        let sound = this.findStoppedSound(soundName);
        if (!sound) {
            sound = this.soundFactory.create(soundName);
            console.debug(`Sound "${soundName}" is created`);
            this.sounds.get(soundName)!.push(sound);
        }
        return sound;
    }

    update(_deltaTime: number) {
        // Do nothing
    }

    private findStoppedSound(soundName: string): Sound | undefined {
        let sounds = this.sounds.get(soundName);
        if (sounds == undefined) {
            this.sounds.set(soundName, sounds = []);
        }

        for (const sound of sounds) {
            if (!sound.isPlaying()) {
                return sound;
            }
        }
    }
}
