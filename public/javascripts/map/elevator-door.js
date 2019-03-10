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
                        offset: [20, -2, -64]
                    }
                ]
            }
        ]
    }
});

export class ElevatorDoor extends THREE.Group {
    constructor(builder) {
        super();
        this._name = builder._name;
        this._body = builder._body;
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

    update(time) {
        if (this._animation)
            this._animation.update(time);
    }

    onTrigger() {
        const scope = this;
        // TODO: Take into account move direction.
        // TODO: Move physics body too.
        // TODO: Moving is a bit twitchy. Perhaps I should revise update calling mechanism.
        this._animation = new TWEEN.Tween({position: this.position.x})
            .to({position: this.position.x + 0.4}, this._time * 1000)
            .onUpdate(function (params) {
                console.log(params.position);
                scope.position.x = params.position;
            });
        this._animation.start();
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