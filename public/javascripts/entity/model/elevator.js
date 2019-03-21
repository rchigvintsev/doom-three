const _DEFINITION = Object.freeze({
    lights: [
        {type: 'point', color: 0xffffff, distance: 120, position: [0, -65, -88]},
        {type: 'point', color: 0xffffff, distance: 100, position: [0, -65, -44]},
        {type: 'point', color: 0xffffff, distance: 30, position: [0, -65, -125]}
    ],
    cm: {
        bodies: [
            {
                mass: 0,
                material: 'floor',
                shapes: [
                    {
                        type: 'box',
                        width: 125,
                        height: 135,
                        depth: 10,
                        offset: [0, -67.5, 5]
                    }
                ]
            },
            {
                mass: 0,
                material: 'default',
                shapes: [
                    { // Ceiling
                        type: 'box',
                        width: 125,
                        height: 135,
                        depth: 10,
                        offset: [0, -67.5, -155]
                    },
                    { // Rear wall
                        type: 'box',
                        width: 125,
                        height: 150,
                        depth: 10,
                        offset: [0, -130, -75],
                        rotation: [90, 0, 0]
                    },
                    { // Left wall
                        type: 'box',
                        width: 121,
                        height: 150,
                        depth: 10,
                        offset: [57.5, -64.5, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Right wall
                        type: 'box',
                        width: 121,
                        height: 150,
                        depth: 10,
                        offset: [-57.5, -64.5, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Left front wall
                        type: 'box',
                        width: 10,
                        height: 150,
                        depth: 13,
                        offset: [46, -9, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Right front wall
                        type: 'box',
                        width: 10,
                        height: 150,
                        depth: 13,
                        offset: [-46, -9, -75],
                        rotation: [90, 90, 0]
                    }
                ]
            }
        ]
    }
});

export class Elevator extends THREE.Group {
    constructor(geometry, materials) {
        super();
        this._geometry = geometry;
        this._materials = materials;
        this._gui = [];
    }

    static get DEFINITION() {
        return _DEFINITION;
    }

    init() {
        this.add(new THREE.SkinnedMesh(this._geometry, this._materials));
    }

    addGui(gui) {
        this.add(gui);
        this._gui.push(gui);
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    get body() {
        return this._body;
    }

    set body(body) {
        this._body = body;
    }

    update(time) {
        for (const gui of this._gui)
            gui.update(time);
    }
}