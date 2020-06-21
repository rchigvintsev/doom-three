import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class HealthStationGui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);
        this._initLayers(GUIS.health_station, -0.10);
        this.rotation.copy(this._rotation);
        this.position.copy(this._position);
    }

    update(time) {
        super.update(time);
        if (this._scrollingText) {
            this._scrollingText.update(time);
        }
    }

    _getScreenWidth() {
        return GUIS.health_station.width;
    }

    _getScreenHeight() {
        return GUIS.health_station.height;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.z += THREE.Math.degToRad(-90);
        return rotation;
    }
}
