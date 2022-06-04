import {BufferGeometry, Material} from 'three';
import {Md5Model} from '../md5-model';

export class Fists extends Md5Model {
    constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }
}
