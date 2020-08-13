export class UpdatableShaderMaterial extends THREE.ShaderMaterial {
    constructor(parameters) {
        super(parameters);
    }

    update(time) {
        this._updateRotation(time);
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
