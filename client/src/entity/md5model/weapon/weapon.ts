import {Audio, BufferGeometry, Material} from 'three';

import {Md5Model} from '../md5-model';

export abstract class Weapon extends Md5Model {
    protected enabled = false;

    constructor(geometry: BufferGeometry, materials: Material | Material[], sounds: Map<string, Audio<AudioNode>[]>) {
        super(geometry, materials, sounds);
    }

    abstract enable(): void;

    abstract disable(): void;

    abstract attack(): void;
}