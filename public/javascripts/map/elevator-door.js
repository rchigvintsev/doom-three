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
    constructor(geometry, materials, body) {
        super();
        this._body = body;
        this.add(new THREE.SkinnedMesh(geometry, materials));
    }

    static get DEFINITION() {
        return _DEFINITION;
    }

    get body() {
        return this._body;
    }

    update(time) {
        // Do nothing
    }
}