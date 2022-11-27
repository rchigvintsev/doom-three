import {Audio, AudioListener, PositionalAudio} from 'three';
import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameAssets} from '../../game-assets';

export class SoundFactory implements EntityFactory<Audio<AudioNode>[]> {
    constructor(private readonly parameters: SoundFactoryParameters) {
    }

    create(soundName: string): Audio<AudioNode>[] {
        const soundDef = this.parameters.assets.soundDefs.get(soundName);
        if (!soundDef) {
            throw new Error(`Definition of sound "${soundName}" is not found`);
        }

        const sounds: Audio<AudioNode>[] = [];
        for (const soundSrc of soundDef.sources) {
            const audioBuffer = this.parameters.assets.sounds.get(soundSrc);
            if (!audioBuffer) {
                throw new Error(`Sound "${soundSrc}" is not found in game assets`);
            }
            const sound = this.createSound(soundDef);
            sound.setBuffer(audioBuffer);
            sounds.push(sound);
        }
        return sounds;
    }

    private createSound(soundDef: any): Audio<AudioNode> {
        const audioListener = this.parameters.audioListener;
        let audio;
        if (soundDef.type === 'positional') {
            audio = new PositionalAudio(audioListener);
        } else {
            audio = new Audio(audioListener);
        }
        if (soundDef.volume != undefined) {
            audio.setVolume(soundDef.volume);
        }
        return audio;
    }
}

export interface SoundFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    audioListener: AudioListener;
}