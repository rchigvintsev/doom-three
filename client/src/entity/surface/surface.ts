import {BufferGeometry, Material, Mesh} from 'three';

export class Surface extends Mesh {
    constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }
}