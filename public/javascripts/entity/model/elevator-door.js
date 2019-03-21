import {GameWorld} from '../../game-world.js';

const _DEFINITION = Object.freeze({
    cm: {
        bodies: [
            {
                mass: 0,
                material: 'default',
                shapes: [
                    {
                        type: 'box',
                        width: 40,
                        height: 10,
                        depth: 128,
                        offset: [-20, -2, -64]
                    }
                ]
            }
        ]
    }
});

const MOVE_SPEED = 40 * GameWorld.WORLD_SCALE;

export class ElevatorDoor extends THREE.Group {
    constructor(geometry, materials) {
        super();
        this._geometry = geometry;
        this._materials = materials;
        this._moveDirection = 0;
        this._time = 1;
    }

    static get DEFINITION() {
        return _DEFINITION;
    }

    init() {
        this.add(new THREE.SkinnedMesh(this._geometry, this._materials));
        this._opened = false;
        if (this._sounds && this._sounds['open']) {
            this._soundOpen = this._sounds['open'][0];
            this.add(this._soundOpen);
        }
    }

    open() {
        if (this._opened)
            return;
        const scope = this;
        // TODO: Moving is a bit twitchy. Perhaps I should revise update calling mechanism.
        const zAxis = new THREE.Vector3(0, 0, 1);
        const yAxis = new THREE.Vector3(0, 1, 0);
        // To get a movement direction we are going to rotate vector looking in Z-axis direction around Y-axis
        // by a specified number of degrees.
        const direction = zAxis.clone().applyAxisAngle(yAxis, THREE.Math.degToRad(this._moveDirection));
        const speedVector = new THREE.Vector3().setScalar(MOVE_SPEED).multiply(direction);
        const targetPosition = this.position.clone().add(speedVector);
        this._animation = new TWEEN.Tween({x: this.position.x, y: this.position.y, z: this.position.z})
            .to({x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}, this._time * 1000)
            .onUpdate(function (params) {
                scope.position.set(params.x, params.y, params.z);
                scope._body.position = scope.position;
            }).onComplete(function () {
                scope._opened = true;
            });
        this._animation.start();

        if (this._soundOpen)
            this._soundOpen.play();
    }

    update(time) {
        if (this._animation)
            this._animation.update(time);
    }

    onTrigger() {
        this.open();
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    get team() {
        return this._team;
    }

    set team(team) {
        this._team = team;
    }

    get body() {
        return this._body;
    }

    set body(body) {
        this._body = body;
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