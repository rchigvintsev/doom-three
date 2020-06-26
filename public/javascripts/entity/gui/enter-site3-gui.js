import {AbstractGui} from './abstract-gui.js';
import {GUIS} from './guis.js';

export class EnterSite3Gui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);
        this._initLayers(GUIS.enter_site3)
        this.rotation.copy(this._rotation);
        this.position.copy(this._position.setY(this._position.y + 0.3));
    }

    update(time) {
        for (let material of this._materials) {
            if (material.update) {
                material.update(time);
            }
        }
        for (let animation of this._animations)
            animation.update(time);
    }

    _getScreenWidth() {
        return GUIS.enter_site3.width;
    }

    _getScreenHeight() {
        return GUIS.enter_site3.height;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.x += THREE.Math.degToRad(-180);
        return rotation;
    }
}
