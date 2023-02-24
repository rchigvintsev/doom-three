import {Audio, Object3D} from 'three';

import {GameEntity} from '../game-entity';
import {randomInt} from 'mathjs';

export class Sound extends Object3D implements GameEntity {
    private playingAudioCounter = 0;

    constructor(name: string, private readonly audios: Audio<AudioNode>[]) {
        super();
        this.name = name;
        this.audios.forEach(audio => audio.onEnded = () => this.onEnded(audio));
    }

    init() {
        // Do nothing
    }

    update(_deltaTime: number) {
        // Do nothing
    }

    set volume(volume: number) {
        this.audios.forEach(audio => audio.setVolume(volume));
    }

    isPlaying(): boolean {
        return this.playingAudioCounter > 0;
    }

    play(delay?: number, audioIndex?: number): boolean {
        let audio;
        if (audioIndex == undefined) {
            audio = this.pickRandomAudio();
        } else {
            audio = this.audios[audioIndex % this.audios.length];
        }

        if (this.parent && this.parent != audio.parent) {
            this.parent.add(audio);
        }
        if (audio.isPlaying) {
            audio.stop();
            this.playingAudioCounter--;
        }
        audio.play(delay);
        this.playingAudioCounter++;
        return true;
    }

    stop(): this {
        if (this.isPlaying()) {
            this.audios.forEach(audio => {
                if (audio.isPlaying) {
                    audio.stop();
                }
            });
            this.playingAudioCounter = 0;
        }
        return this;
    }

    private onEnded(audio: Audio<AudioNode>) {
        audio.isPlaying = false;
        this.playingAudioCounter--;
        if (this.playingAudioCounter < 0) {
            this.playingAudioCounter = 0;
        }
    }

    private pickRandomAudio(): Audio<AudioNode> {
        return this.audios[randomInt(0, this.audios.length)];
    }
}