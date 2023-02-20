import {Audio, AudioListener, PositionalAudio} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameAssets} from '../../game-assets';
import {Sound} from './sound';

export class SoundFactory implements EntityFactory<Sound> {
    constructor(private readonly parameters: SoundFactoryParameters) {
    }

    create(soundName: string): Sound {
        const soundDef = this.parameters.assets.soundDefs.get(soundName);
        if (!soundDef) {
            throw new Error(`Definition of sound "${soundName}" is not found`);
        }

        const audios: Audio<AudioNode>[] = [];
        for (const soundSrc of soundDef.sources) {
            const audioBuffer = this.parameters.assets.sounds.get(soundSrc);
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
        const audioListener = this.parameters.audioListener;
        if (soundDef.type === 'positional') {
            return new PositionalAudio(audioListener);
        }
        return new Audio(audioListener);
    }
}

export interface SoundFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    audioListener: AudioListener;
}