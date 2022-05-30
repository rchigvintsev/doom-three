import {BufferGeometry, Material, SkeletonHelper, SkinnedMesh} from 'three';

import {Entity} from '../entity';

export abstract class Weapon extends SkinnedMesh implements Entity {
    skeletonHelper?: SkeletonHelper;

    protected constructor(geometry: BufferGeometry, materials: Material | Material[]) {
        super(geometry, materials);
    }

    update(_deltaTime: number): void {
        // Do nothing
    }
}
