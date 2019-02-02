var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.Sound = function (name, audioData, soundManager) {
        this._name = name;
        this._audioData = audioData;
        this._soundManager = soundManager;
        soundManager.addEventListener('init', $.proxy(this.onInit, this));
        this._playing = false;
        this._initialized = false;
    };

    DT.Sound.prototype = {
        constructor: DT.Sound,

        get name() {
            return this._name;
        },

        get buffer() {
            return this._buffer;
        },

        get playing() {
            return this._playing;
        },

        set playing(value) {
            if (this._initialized)
                this._playing = value;
        },

        play: function (delay) {
            if (this._initialized)
                this._soundManager.playSound(this, delay);
        },

        onInit: function() {
            var scope = this;
            this._soundManager.audioContext.decodeAudioData(this._audioData, function (buffer) {
                scope._buffer = buffer;
                scope._initialized = true;
            });
        }
    }
})(DOOM_THREE);

export const Sound = DOOM_THREE.Sound;
