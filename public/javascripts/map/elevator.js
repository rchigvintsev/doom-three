import {GUIFactory} from './factory/gui-factory.js';

export class Elevator extends THREE.Group {
    constructor(geometry, materials, guiMaterials, assets) {
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
    }

    update(time) {
        for (const gui of this._gui)
            gui.update(time);
    }
}