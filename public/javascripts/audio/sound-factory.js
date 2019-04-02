import {AssetLoader} from '../asset-loader.js';
import {SOUNDS} from './sounds.js';
import {AudioListener} from './audio-listener.js';
import {Sound} from './sound.js';
import {EntityFactory} from '../entity/entity-factory.js';

export class SoundFactory extends EntityFactory {
    constructor(assetLoader, audioListener) {
        super(assetLoader);
        if (!audioListener)
            audioListener = AudioListener.getListener();
        this._audioListener = audioListener;
    }

    createSounds(entityDef) {
        if (!entityDef.sounds)
            return null;

        const scope = this;
        const result = {};
        Object.keys(entityDef.sounds).forEach(function (key) {
            const soundName = entityDef.sounds[key];
            const soundDef = SOUNDS[soundName];
            if (soundDef) {
                const sounds = [];
                for (let i = 0; i < soundDef.sources.length; i++) {
                    const soundSrc = soundDef.sources[i];
                    const audioBuffer = scope._assetLoader.assets[AssetLoader.AssetType.SOUNDS][soundSrc];
                    if (audioBuffer) {
                        let sound;
                        if (soundDef.type === 'positional')
                            // TODO: Provide custom positional audio to be able to specify delay.
                            sound = new THREE.PositionalAudio(scope._audioListener);
                        else
                            sound = new Sound(scope._audioListener);
                        sound.setBuffer(audioBuffer);
                        sounds.push(sound);
                    } else
                        console.error('Sound "' + soundSrc + '" is not found');
                }
                if (sounds.length > 0)
                    result[key] = sounds;
            } else
                console.error('Sound definition "' + soundName + '" is not found');
        });
        return result;
    }
}