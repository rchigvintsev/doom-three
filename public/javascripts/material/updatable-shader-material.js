import {UpdatableMaterialMixin} from './updatable-material-mixin.js';

export class UpdatableShaderMaterial extends UpdatableMaterialMixin(THREE.ShaderMaterial) {
    constructor(parameters) {
        super(parameters);
    }

    update(time) {
        this._updateRotation(time);
        this._updateColor(time);
    }

    set colorValue(colorValue) {
        let color = this.uniforms['diffuse'].value;
        if (Array.isArray(colorValue)) {
            color.setRGB(colorValue[0], colorValue[1], colorValue[2]);
        } else {
            color.setHex(colorValue);
        }
    }

    set rotateExpressions(rotateExpressions) {
        this._rotateExpressions = rotateExpressions;
    }

    _updateRotation(time) {
        if (this._rotateExpressions) {
            for (let i = 0; i < this._rotateExpressions.length; i++) {
                const rotationUniform = this.uniforms['u_rotation' + (i + 1)];
                if (rotationUniform) {
                    const rotateExpression = this._rotateExpressions[i];
                    rotationUniform.value = rotateExpression.eval({time: time * 0.01});
                }
            }
        }
    }
}
