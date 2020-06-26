import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class Malfunction2Gui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);
        this._initLayers(GUIS.malfunction2, 0.0, -0.001);
        this.rotation.copy(this._rotation);
        this.position.copy(this._position);
    }

    _getScreenWidth() {
        return GUIS.malfunction2.width;
    }

    _getScreenHeight() {
        return GUIS.malfunction2.height;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.x += THREE.Math.degToRad(-180);
        return rotation;
    }
}
