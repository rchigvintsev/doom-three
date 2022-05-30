import {BufferGeometry, Material, Mesh} from 'three';
import {Entity} from '../entity';

export class Surface extends Mesh implements Entity {
    constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }

    update(_deltaTime: number): void {
        // Do nothing
    }
}