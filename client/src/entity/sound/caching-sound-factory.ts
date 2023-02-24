import {SoundFactory} from './sound-factory';
import {Sound} from './sound';
import {GameEntityFactory} from '../game-entity-factory';

export class CachingSoundFactory implements GameEntityFactory<Sound> {
    private readonly cache = new Map<string, Sound[]>();

    constructor(private readonly delegate: SoundFactory) {
    }

    create(soundName: string): Sound {
        let sound = this.findStoppedSound(soundName);
        if (!sound) {
            sound = this.delegate.create(soundName);
            console.debug(`Sound "${soundName}" is created`);
            this.cache.get(soundName)!.push(sound);
        }
        return sound;
    }

    private findStoppedSound(soundName: string): Sound | undefined {
        let sounds = this.cache.get(soundName);
        if (sounds == undefined) {
            this.cache.set(soundName, sounds = []);
        }

        for (const sound of sounds) {
            if (!sound.isPlaying()) {
                return sound;
            }
        }
    }
}
