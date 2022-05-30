import {BufferGeometry, Material} from 'three';

import {Weapon} from './weapon';

export class Fists extends Weapon {
    constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }
}
