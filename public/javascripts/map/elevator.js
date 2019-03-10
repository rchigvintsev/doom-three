import {GUIFactory} from './factory/gui-factory.js';
import {Settings} from '../settings.js';
import {LightFactory} from './factory/light-factory.js';

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
    constructor(name, geometry, materials, guiMaterials, assets, body) {
        super();

        this._name = name;
        this._body = body;
        this._gui = [];

        this.add(new THREE.SkinnedMesh(geometry, materials));

        if (!Settings.wireframeOnly) {
            const guiFactory = new GUIFactory(assets);
            for (let guiMaterial of guiMaterials) {
                const gui = guiFactory.createGui(guiMaterial.definition.guiClass, geometry, guiMaterial.index);
                this.add(gui);
                this._gui.push(gui);
            }

            const lightFactory = new LightFactory();
            for (let i = 0; i < _DEFINITION.lights.length; i++) {
                const lightDef = _DEFINITION.lights[i];
                const light = lightFactory.createLight(lightDef, false);
                this.add(light);
                if (Settings.showLightSphere) {
                    const lightSphere = lightFactory.createLightSphere(lightDef, false);
                    this.add(lightSphere);
                }
            }
        }
    }

    static get DEFINITION() {
        return _DEFINITION;
    }

    get name() {
        return this._name;
    }

    get body() {
        return this._body;
    }

    update(time) {
        for (const gui of this._gui)
            gui.update(time);
    }
}