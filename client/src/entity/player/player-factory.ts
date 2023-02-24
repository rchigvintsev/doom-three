import {PerspectiveCamera} from 'three';

import {GameEntityFactory, GameEntityFactoryParameters} from '../game-entity-factory';
import {Player} from './player';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {Weapon} from '../model/md5/weapon/weapon';
import {PlayerCollisionModel} from '../../physics/player/player-collision-model';
import {SoundFactory} from '../sound/sound-factory';
import {Sound} from '../sound/sound';

export class PlayerFactory implements GameEntityFactory<Player> {
    constructor(private readonly parameters: PlayerFactoryParameters) {
    }

    create(playerDef: any): Player {
        const player = new Player({
            camera: this.parameters.camera,
            weapons: this.parameters.weapons,
            sounds: this.createSounds(playerDef),
            collisionModel: this.createCollisionModel(playerDef),
            config: this.parameters.config
        });
        player.init();
        player.enableFists();
        return player;
    }

    private createSounds(playerDef: any): Map<string, Sound> {
        const sounds = new Map<string, Sound>();
        if (playerDef.sounds) {
            for (const soundName of Object.keys(playerDef.sounds)) {
                sounds.set(soundName, this.parameters.soundFactory.create(playerDef.sounds[soundName]));
            }
        }
        return sounds;
    }

    private createCollisionModel(playerDef: any) {
        return new PlayerCollisionModel(this.parameters.collisionModelFactory.create(playerDef));
    }
}

export interface PlayerFactoryParameters extends GameEntityFactoryParameters {
    camera: PerspectiveCamera;
    weapons: Map<string, Weapon>;
    soundFactory: SoundFactory;
    collisionModelFactory: CollisionModelFactory;
}
