import {EvalFunction} from 'mathjs';

export interface UpdatableMaterial {
    evalScope?: any;
    transparent: boolean;
    opacity: number;
    opacityExpression?: EvalFunction;

    setParameters(params: Map<string, any>): void;

    update(deltaTime?: number): void;
}

export function isUpdatableMaterial(material: any): material is UpdatableMaterial {
    return !!material.update;
}

export function updateOpacity(material: UpdatableMaterial) {
    if (material.opacityExpression) {
        material.evalScope.time = performance.now() * 2;
        material.opacity = material.opacityExpression.evaluate(material.evalScope);
    }
}