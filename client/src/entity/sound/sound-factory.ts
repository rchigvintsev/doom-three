import {Audio, AudioListener, PositionalAudio} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {GameAssets} from '../../game-assets';
import {Sound} from './sound';
import {TYPES} from '../../types';
import {GameConfig} from '../../game-config';

@injectable()
export class SoundFactory implements GameEntityFactory<Sound> {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.Assets) private readonly assets: GameAssets,
                @inject(TYPES.AudioListener) private readonly audioListener: AudioListener) {
    }

    create(soundName: string): Sound {
        const soundDef = this.assets.soundDefs.get(soundName);
        if (!soundDef) {
            throw new Error(`Definition of sound "${soundName}" is not found`);
        }

        const audios: Audio<AudioNode>[] = [];
        for (const soundSrc of soundDef.sources) {
            const audioBuffer = this.assets.sounds.get(soundSrc);
            if (!audioBuffer) {
                throw new Error(`Sound "${soundSrc}" is not found in game assets`);
            }
            const audio = this.createAudio(soundDef);
            audio.setBuffer(audioBuffer);
            audios.push(audio);
        }
        const sound = new Sound(soundName, audios);
        if (soundDef.volume != undefined) {
            sound.volume = soundDef.volume;
        }
        sound.init();
        return sound;
    }

    private createAudio(soundDef: any): Audio<AudioNode> {
        if (soundDef.type === 'positional') {
            return new PositionalAudio(this.audioListener);
        }
        return new Audio(this.audioListener);
    }
}
