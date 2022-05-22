import {Object3D} from 'three';

export interface EntityFactory<T extends Object3D> {
    create(entityDef: any): T;
}