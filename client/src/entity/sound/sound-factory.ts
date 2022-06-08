import {Audio, AudioListener, PositionalAudio} from 'three';

import {GameAssets} from '../../game-assets';
import {EntityFactory} from '../entity-factory';

export class SoundFactory implements EntityFactory<Audio<AudioNode>[]> {
    constructor(private readonly audioListener: AudioListener,
                private readonly soundDefs: Map<string, any>,
                private readonly assets: GameAssets) {
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
        if (soundDef.type === 'positional') {
            return new PositionalAudio(this.audioListener);
        }
        return new Audio(this.audioListener);
    }
}