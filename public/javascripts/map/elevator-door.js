import {GameWorld} from '../game-world.js';

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
    constructor(builder) {
        super();
        this._name = builder._name;
        this._body = builder._body;
        this._opened = false;
        this._moveDirection = builder._moveDirection;
        this._time = builder._time;
        this.add(new THREE.SkinnedMesh(builder._geometry, builder._materials));
    }

    static get DEFINITION() {
        return _DEFINITION;
    }

    static newBuilder(geometry, materials) {
        return new ElevatorDoorBuilder(geometry, materials);
    }

    get name() {
        return this._name;
    }

    get body() {
        return this._body;
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
    }

    update(time) {
        if (this._animation)
            this._animation.update(time);
    }

    onTrigger() {
        this.open();
    }
}

class ElevatorDoorBuilder {
    constructor(geometry, materials) {
        this._geometry = geometry;
        this._materials = materials;
    }

    withName(name) {
        this._name = name;
        return this;
    }

    withBody(body) {
        this._body = body;
        return this;
    }

    withMoveDirection(moveDirection) {
        this._moveDirection = moveDirection;
        return this;
    }

    withTime(time) {
        this._time = time;
        return this;
    }

    build() {
        return new ElevatorDoor(this);
    }
}