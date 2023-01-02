import {Color} from 'three';

export interface StylableMaterial {
    applyStyle(style: MaterialStyle): void;
}

export function isStylableMaterial(material: any): material is StylableMaterial {
    return material && material.stylableMaterial;
}

export class MaterialStyle {
    constructor(readonly name: string, readonly color: Color) {
    }
}
