import {ShaderMaterial} from 'three';
import {ShaderMaterialParameters} from 'three/src/materials/ShaderMaterial';

import {EvalFunction} from 'mathjs';

import {UpdatableMaterial} from './updatable-material';

export class UpdatableShaderMaterial extends ShaderMaterial implements UpdatableMaterial {
    private _rotationExpressions: EvalFunction[] = [];

    constructor(parameters?: ShaderMaterialParameters) {
        super(parameters);
    }

    update(_deltaTime: number) {
        const evalScope = {time: performance.now() * 0.01};
        this.updateRotation(evalScope);
    }

    set rotationExpressions(expressions: EvalFunction[]) {
        this._rotationExpressions = expressions;
    }

    private updateRotation(evalScope: { time: number }) {
        for (let i = 0; i < this._rotationExpressions.length; i++) {
            const rotationUniform = this.uniforms['u_rotation' + (i + 1)];
            if (rotationUniform) {
                const expression = this._rotationExpressions[i];
                rotationUniform.value = expression.evaluate(evalScope);
            }
        }
    }
}
