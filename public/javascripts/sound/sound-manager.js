import {Sound} from './sound.js';
import {MouseState} from '../control/mouse-state.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.SoundManager = function () {
        this._initialized = false;
        $(document.getElementById('game_canvas')).mousedown($.proxy(this.onMouseDown, this));
    };

    DT.SoundManager.prototype = {
        constructor: DT.SoundManager,

        createSound: function (soundName, audioData) {
            return new Sound(soundName, audioData, this);
        },

        playSound: function (sound, delay) {
            if (!this._initialized)
                return;
            if (delay == undefined)
                delay = 0;
            var bufferSource = this._audioContext.createBufferSource();
            bufferSource.buffer = sound.buffer;
            bufferSource.connect(this._gainNode);
            if (!bufferSource.start)
                bufferSource.start = bufferSource.noteOn;
            bufferSource.onended = function () { sound.playing = false; };
            bufferSource.start(this._audioContext.currentTime + delay);
            sound.playing = true;
        },

        onMouseDown: function (e) {
            if (e.which === MouseState.MouseButton.RIGHT) {
                $(e.target).off(e);

                this._audioContext = AudioContext != undefined ? new AudioContext() : new webkitAudioContext();

                if (!this._audioContext.createGain)
                    this._audioContext.createGain = this._audioContext.createGainNode;

                this._gainNode = this._audioContext.createGain();
                var compressor = this._audioContext.createDynamicsCompressor();
                this._gainNode.connect(compressor);
                compressor.connect(this._audioContext.destination);

                this._initialized = true;
                this.dispatchEvent({type: 'init'});
            }
        },

        get audioContext() {
            return this._audioContext;
        }
    };

    Object.assign(DT.SoundManager.prototype, THREE.EventDispatcher.prototype);
})(DOOM_THREE);

export const SoundManager = DOOM_THREE.SoundManager;
