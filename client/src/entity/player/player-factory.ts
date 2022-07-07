import {Audio, PerspectiveCamera} from 'three';

import {EntityFactory} from '../entity-factory';
import {Player} from './player';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {Weapon} from '../md5model/weapon/weapon';
import {PlayerCollisionModel} from './player-collision-model';
import {GameConfig} from '../../game-config';
import {SoundFactory} from '../sound/sound-factory';

export class PlayerFactory implements EntityFactory<Player> {
    constructor(private readonly config: GameConfig,
                private readonly camera: PerspectiveCamera,
                private readonly weapons: Map<string, Weapon>,
                private readonly soundFactory: SoundFactory,
                private readonly collisionModelFactory: CollisionModelFactory) {
    }

    create(playerDef: any): Player {
        const sounds = this.createSounds(playerDef);
        const collisionModel = new PlayerCollisionModel(this.collisionModelFactory.create(playerDef));
        const player = new Player(this.camera, this.weapons, sounds, collisionModel, this.config);
        player.enableFists();
        return player;
    }

    private createSounds(playerDef: any): Map<string, Audio<AudioNode>[]> {
        const sounds = new Map<string, Audio<AudioNode>[]>();
        if (playerDef.sounds) {
            for (const soundName of Object.keys(playerDef.sounds)) {
                sounds.set(soundName, this.soundFactory.create(playerDef.sounds[soundName]));
            }
        }
        return sounds;
    }
}