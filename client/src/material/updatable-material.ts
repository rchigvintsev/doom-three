export interface UpdatableMaterial {
    setParameters(params: Map<string, any>): void;

    update(deltaTime?: number): void;
}

export function isUpdatableMaterial(material: any): material is UpdatableMaterial {
    return !!material.update;
}