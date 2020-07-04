import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class PdaDoorTriggerGui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);
        this._initLayers(GUIS.pda_door_trigger, -0.01, 0.001);
        this.rotation.copy(this._rotation);
        this.position.copy(this._position);
    }

    _getScreenWidth() {
        return GUIS.pda_door_trigger.width;
    }

    _getScreenHeight() {
        return GUIS.pda_door_trigger.height;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.z += THREE.Math.degToRad(90);
        return rotation;
    }
}
