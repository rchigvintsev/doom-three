import {Audio, AudioListener, PositionalAudio} from 'three';

import {GameAssets} from '../../game-assets';
import {EntityFactory} from '../entity-factory';

export class SoundFactory implements EntityFactory<Audio<AudioNode>> {
    constructor(private readonly audioListener: AudioListener,
                private readonly soundDefs: Map<string, any>,
                private readonly assets: GameAssets) {
    }

    create(soundName: string): Audio<AudioNode> {
        const soundDef = this.soundDefs.get(soundName);
        if (!soundDef) {
            throw new Error(`Definition of sound "${soundName}" is not found`);
        }

        let sound;
        if (soundDef.type === 'positional') {
            sound = new PositionalAudio(this.audioListener);
        } else {
            sound = new Audio(this.audioListener);
        }

        const soundSrc = soundDef.sources[0];
        const audioBuffer = this.assets.sounds.get(soundSrc);
        if (!audioBuffer) {
            throw new Error(`Sound "${soundSrc}" is not found in game assets`);
        }
        sound.setBuffer(audioBuffer);
        return sound;
    }
}