import {EvalFunction} from 'mathjs';
import {MaterialKind} from './material-kind';

export interface UpdatableMaterial {
    kind: MaterialKind;
    evalScope?: any;
    transparent: boolean;
    opacity: number;
    opacityExpression?: EvalFunction;

    setParameters(params: Map<string, any>): void;

    update(deltaTime?: number): void;
}

export interface UpdatableMaterialExtraParameters {
    kind: MaterialKind;
    evalScope?: any;
}

export function isUpdatableMaterial(material: any): material is UpdatableMaterial {
    return material && material.updatableMaterial;
}

export function updateOpacity(material: UpdatableMaterial) {
    if (material.opacityExpression) {
        material.evalScope.time = performance.now();
        material.opacity = material.opacityExpression.evaluate(material.evalScope);
    }
}
