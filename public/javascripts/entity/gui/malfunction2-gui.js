import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class Malfunction2Gui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder, GUIS.malfunction2);
    }

    _determineRotation(position, quaternion, normal) {
        const rotation = super._determineRotation(position, quaternion, normal);
        rotation.z += THREE.Math.degToRad(180);
        return rotation;
    }
}
