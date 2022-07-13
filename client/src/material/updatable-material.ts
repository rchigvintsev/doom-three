export interface UpdatableMaterial {
    update(deltaTime: number): void;
}

export function isUpdatableMaterial(material: any): material is UpdatableMaterial {
    return !!material.update;
}