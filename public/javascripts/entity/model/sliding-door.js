import {LwoModel} from './lwo-model.js';
import {GameWorld} from '../../game-world.js';

const MOVE_SPEED = 40 * GameWorld.WORLD_SCALE;

export class SlidingDoor extends LwoModel {
    constructor(geometry, materials) {
        super(geometry, materials);
        this._moveDirection = 0;
        this._time = 1;
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
        if (this._opened) {
            return;
        }

        const zAxis = new THREE.Vector3(0, 0, 1);
        const yAxis = new THREE.Vector3(0, 1, 0);
        // To get a movement direction we are going to rotate vector looking in Z-axis direction around Y-axis
        // by a specified number of degrees.
        const direction = zAxis.clone().applyAxisAngle(yAxis, THREE.Math.degToRad(this._moveDirection));
        const speedVector = new THREE.Vector3().setScalar(MOVE_SPEED).multiply(direction);
        const targetPosition = this.position.clone().add(speedVector);
        this._animation = new TWEEN.Tween({x: this.position.x, y: this.position.y, z: this.position.z})
            .to({x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}, this._time * 1000)
            .onUpdate(params => {
                this.position.set(params.x, params.y, params.z);
                this._body.position = this.position;
            }).onComplete(() => this._opened = true);
        this._animation.start();

        if (this._soundOpen) {
            this._soundOpen.play();
        }
    }

    update(time) {
        super.update(time);
        if (this._animation) {
            this._animation.update(time);
        }
    }

    onTrigger() {
        this.open();
    }

    get team() {
        return this._team;
    }

    set team(team) {
        this._team = team;
    }

    get moveDirection() {
        return this._moveDirection;
    }

    set moveDirection(moveDirection) {
        this._moveDirection = moveDirection;
    }

    get time() {
        return this._time;
    }

    set time(time) {
        this._time = time;
    }

    get sounds() {
        return this._sounds;
    }

    set sounds(sounds) {
        this._sounds = sounds;
    }
}
