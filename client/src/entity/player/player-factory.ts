import {Audio, PerspectiveCamera} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {Player} from './player';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {Weapon} from '../model/md5/weapon/weapon';
import {PlayerCollisionModel} from '../../physics/player/player-collision-model';
import {GameConfig} from '../../game-config';
import {SoundFactory} from '../sound/sound-factory';

export class PlayerFactory implements EntityFactory<Player> {
    constructor(private readonly parameters: PlayerFactoryParameters) {
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

    private get config(): GameConfig {
        return this.parameters.config;
    }

    private get camera(): PerspectiveCamera {
        return this.parameters.camera;
    }

    private get weapons(): Map<string, Weapon> {
        return this.parameters.weapons;
    }

    private get soundFactory(): SoundFactory {
        return this.parameters.soundFactory;
    }

    private get collisionModelFactory(): CollisionModelFactory {
        return this.parameters.collisionModelFactory;
    }
}

export class PlayerFactoryParameters extends EntityFactoryParameters {
    camera!: PerspectiveCamera;
    weapons!: Map<string, Weapon>;
    soundFactory!: SoundFactory;
    collisionModelFactory!: CollisionModelFactory;
}