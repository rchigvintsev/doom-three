import {LwoModel} from './lwo-model.js';
import {GameWorld} from '../../game-world.js';
import {EventBus} from '../../event/event-bus.js';

const STATE_OPENED = 1;
const STATE_OPENING = 2;
const STATE_CLOSED = 3;
const STATE_CLOSING = 4;

export class SlidingDoor extends LwoModel {
    constructor(options = {}) {
        super(options.geometry, options.materials);
        this._time = options.time || 1;
        this._locked = options.locked || false;
        this._team = options.team;
        this._sounds = options.sounds;
        this._lastLockedSoundPlayTime = 0;

        const zAxis = new THREE.Vector3(0, 0, 1);
        const yAxis = new THREE.Vector3(0, 1, 0);
        // To get a movement direction we are going to rotate vector looking in Z-axis direction around Y-axis
        // by a specified number of degrees.
        const direction = zAxis.clone().applyAxisAngle(yAxis, THREE.Math.degToRad(options.moveDirection || 0));
        this._speedVector = new THREE.Vector3()
            .setScalar(options.moveSpeed || 66 * GameWorld.WORLD_SCALE)
            .multiply(direction);

        if (this._team) {
            EventBus.subscribe(this._team + '.triggerEnter', this.onTriggerEnter);
            EventBus.subscribe(this._team + '.triggerExit', this.onTriggerExit);
        }
    }

    init() {
        super.init();
        this._state = STATE_CLOSED;
        if (this._sounds) {
            if (this._sounds['open']) {
                this._soundOpen = this._sounds['open'][0];
                this.add(this._soundOpen);
            }
            if (this._sounds['close']) {
                this._soundClose = this._sounds['close'][0];
                this.add(this._soundClose);
            }
            if (this._sounds['locked']) {
                this._soundLocked = this._sounds['locked'][0];
                this.add(this._soundLocked);
            }
        }
    }

    open() {
        if (this._state !== STATE_CLOSED) {
            return false;
        }

        if (this._locked) {
            if (this._playSound(this._soundLocked, this._lastLockedSoundPlayTime, 10000)) {
                this._lastLockedSoundPlayTime = Date.now();
            }
            return false;
        }

        this._state = STATE_OPENING;
        const targetPosition = this.position.clone().add(this._speedVector);
        this._slide(targetPosition, STATE_OPENED);
        this._playSound(this._soundOpen);
        return true;
    }

    close() {
        if (this._state !== STATE_OPENED) {
            return false;
        }

        this._state = STATE_CLOSING;
        const targetPosition = this.position.clone().sub(this._speedVector);
        this._slide(targetPosition, STATE_CLOSED);
        this._playSound(this._soundClose);
        return true;
    }

    update(time) {
        super.update(time);
        if (this._animation) {
            this._animation.update(time);
        }
        this._body.update();
    }

    onTriggerEnter = () => {
        if (this._closeTimeoutHandle) {
            clearTimeout(this._closeTimeoutHandle);
        }
        this.open();
    };

    onTriggerExit = () => {
        if (!this._locked) {
            this._closeTimeoutHandle = setTimeout(() => this.close(), 3000);
        }
    };

    get team() {
        return this._team;
    }

    _slide(targetPosition, finalState) {
        this._animation = new TWEEN.Tween({x: this.position.x, y: this.position.y, z: this.position.z})
            .to({x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}, this._time * 1000)
            .onUpdate(params => {
                this.position.set(params.x, params.y, params.z);
                this._body.position = this.position;
            }).onComplete(() => this._state = finalState);
        this._animation.start();
    }

    _playSound(sound, lastPlayTime, timeout) {
        if (sound && !sound.isPlaying) {
            let allowedToPlay = true;
            if (lastPlayTime && timeout) {
                allowedToPlay = (Date.now() - lastPlayTime) > timeout;
            }
            if (allowedToPlay) {
                sound.play();
                return true;
            }
        }
        return false;
    }
}
