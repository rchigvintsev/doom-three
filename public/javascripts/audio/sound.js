export class Sound extends THREE.Audio {
    constructor(listener) {
        super(listener);
        this._playing = false;
    }

    play(delay) {
        if (this._playing)
            return;
        this._playing = true;

        if (!delay) {
            super.play();
            return;
        }

        const scope = this;
        const superPlay = super.play;
        setTimeout(function () {
            superPlay.call(scope);
        }, delay);
    }

    onEnded() {
        super.onEnded();
        this._playing = false;
    }

    get playing() {
        return this._playing;
    }
}