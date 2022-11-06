import {Audio, AudioListener, PositionalAudio} from 'three';

import {GameAssets} from '../../game-assets';
import {EntityFactory, EntityFactoryParameters} from '../entity-factory';

export class SoundFactory implements EntityFactory<Audio<AudioNode>[]> {
    constructor(private readonly parameters: SoundFactoryParameters) {
    }

    create(soundName: string): Audio<AudioNode>[] {
        const soundDef = this.soundDefs.get(soundName);
        if (!soundDef) {
            throw new Error(`Definition of sound "${soundName}" is not found`);
        }

        const sounds: Audio<AudioNode>[] = [];
        for (const soundSrc of soundDef.sources) {
            const audioBuffer = this.assets.sounds.get(soundSrc);
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
        let audio;
        if (soundDef.type === 'positional') {
            audio = new PositionalAudio(this.audioListener);
        } else {
            audio = new Audio(this.audioListener);
        }
        if (soundDef.volume != undefined) {
            audio.setVolume(soundDef.volume);
        }
        return audio;
    }

    private get assets(): GameAssets {
        return this.parameters.assets!;
    }
    
    private get soundDefs(): Map<string, any> {
        return this.parameters.soundDefs;
    }

    private get audioListener(): AudioListener {
        return this.parameters.audioListener;
    }
}

export class SoundFactoryParameters extends EntityFactoryParameters {
    soundDefs!: Map<string, any>;
    audioListener!: AudioListener;
}