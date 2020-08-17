import {UpdatableMaterialMixin} from './updatable-material-mixin.js';

export class UpdatableShaderMaterial extends UpdatableMaterialMixin(THREE.ShaderMaterial) {
    constructor(parameters) {
        super(parameters);
    }

    update(time) {
        this._updateColor(time);
        this._updateOpacity(time);
        this._updateTransformMatrices(time);
        this._updateRotation(time);
    }

    set colorValue(colorValue) {
        let color = this.uniforms['diffuse'].value;
        if (Array.isArray(colorValue)) {
            color.setRGB(colorValue[0], colorValue[1], colorValue[2]);
        } else {
            color.setHex(colorValue);
        }
    }

    set opacityValue(opacity) {
        this.uniforms['opacity'].value = opacity;
    }

    set rotateExpressions(rotateExpressions) {
        this._rotateExpressions = rotateExpressions;
    }

    _updateTransformMatrices(time) {
        if (this.map && !this.map.matrixAutoUpdate) {
            const scale = this._getScale(time);
            const center = this._getCenter();
            const rotation = this._getRotation(time);
            const translation = this._getTranslation(scale, time);

            const transformMatrix = this.uniforms['uvTransform'].value;
            transformMatrix.identity()
                .scale(scale.x, scale.y)
                .translate(-center.x, -center.y)
                .rotate(rotation)
                .translate(center.x, center.y)
                .translate(translation.x, translation.y);
        }
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
