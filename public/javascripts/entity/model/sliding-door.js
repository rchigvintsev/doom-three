import {LwoModel} from './lwo-model.js';
import {GameWorld} from '../../game-world.js';
import {EventBus} from '../../event/event-bus.js';

export class SlidingDoor extends LwoModel {
    constructor(options = {}) {
        super(options.geometry, options.materials);
        this._time = options.time || 1;
        this._locked = options.locked || false;
        this._team = options.team;
        this._sounds = options.sounds;

        const zAxis = new THREE.Vector3(0, 0, 1);
        const yAxis = new THREE.Vector3(0, 1, 0);
        // To get a movement direction we are going to rotate vector looking in Z-axis direction around Y-axis
        // by a specified number of degrees.
        const direction = zAxis.clone().applyAxisAngle(yAxis, THREE.Math.degToRad(options.moveDirection || 0));
        this._speedVector = new THREE.Vector3()
            .setScalar(options.moveSpeed || 66 * GameWorld.WORLD_SCALE)
            .multiply(direction);

        if (this._team) {
            EventBus.subscribe(this._team + '.ontrigger', this.onTrigger)
        }
    }

    init() {
        super.init();
        this._opened = false;
        if (this._sounds && this._sounds['open']) {
            this._soundOpen = this._sounds['open'][0];
            this.add(this._soundOpen);
        }
    }

    open() {
        if (this._opened || this._locked) {
            return;
        }

        const targetPosition = this.position.clone().add(this._speedVector);
        this._animation = new TWEEN.Tween({x: this.position.x, y: this.position.y, z: this.position.z})
            .to({x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}, this._time * 1000)
            .onUpdate(params => {
                this.position.set(params.x, params.y, params.z);
                this._body.position = this.position;
            }).onComplete(() => this._opened = true);
        this._animation.start();

        if (this._soundOpen && !this._soundOpen.isPlaying) {
            this._soundOpen.play();
        }
    }

    update(time) {
        super.update(time);
        if (this._animation) {
            this._animation.update(time);
        }
    }

    onTrigger = () => {
        this.open();
    };

    get team() {
        return this._team;
    }
}
