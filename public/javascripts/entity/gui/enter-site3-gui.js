import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class EnterSite3Gui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder, GUIS.enter_site3);
        this.position.setY(this.position.y + 0.3);
    }

    _determineRotation(position, quaternion, normal) {
        const rotation = super._determineRotation(position, quaternion, normal);
        rotation.x += THREE.Math.degToRad(-180);
        return rotation;
    }
}
