import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class HealthStationGui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder, GUIS.health_station);
    }

    _getInitialZOffset() {
        return -0.1;
    }

    _determineRotation(position, quaternion, normal) {
        const rotation = super._determineRotation(position, quaternion, normal);
        rotation.z += THREE.Math.degToRad(-90);
        return rotation;
    }
}
