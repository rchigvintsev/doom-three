import {PerspectiveCamera} from 'three';

import {EntityFactory} from '../entity-factory';
import {Player} from './player';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {Weapon} from '../md5model/weapon/weapon';
import {PlayerCollisionModel} from './player-collision-model';

export class PlayerFactory implements EntityFactory<Player> {
    constructor(private readonly camera: PerspectiveCamera,
                private readonly weapons: Map<string, Weapon>,
                private readonly collisionModelFactory: CollisionModelFactory) {
    }

    create(entityDef: any): Player {
        const collisionModel = new PlayerCollisionModel(this.collisionModelFactory.create(entityDef));
        return new Player(this.camera, this.weapons, collisionModel);
    }
}