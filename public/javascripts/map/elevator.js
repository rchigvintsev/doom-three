import {GUIFactory} from './factory/gui-factory.js';

const _DEFINITION = Object.freeze({
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
                        width: 125,
                        height: 150,
                        depth: 10,
                        offset: [57.5, -62.5, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Right wall
                        type: 'box',
                        width: 125,
                        height: 150,
                        depth: 10,
                        offset: [-57.5, -62.5, -75],
                        rotation: [90, 90, 0]
                    }
                ]
            }
        ]
    }
});

export class Elevator extends THREE.Group {
    constructor(geometry, materials, guiMaterials, assets, body) {
        super();
        this.add(new THREE.SkinnedMesh(geometry, materials));

        this._gui = [];

        if (guiMaterials) { // GUI is not enabled when only wireframe should be rendered
            const guiFactory = new GUIFactory(assets);
            for (let guiMaterial of guiMaterials) {
                const gui = guiFactory.createGui(guiMaterial.definition.guiClass, geometry, guiMaterial.index);
                this.add(gui);
                this._gui.push(gui);
            }
        }

        this._body = body;
    }

    static get DEFINITION() {
        return _DEFINITION;
    }

    get body() {
        return this._body;
    }

    update(time) {
        for (const gui of this._gui)
            gui.update(time);
    }
}