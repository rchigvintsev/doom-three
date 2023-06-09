import {PerspectiveCamera} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {Player} from './player';
import {CollisionModelFactory} from '../../physics/collision-model-factory';
import {Weapon} from '../model/md5/weapon/weapon';
import {PlayerCollisionModel} from '../../physics/cannon/player-collision-model';
import {SoundFactory} from '../sound/sound-factory';
import {Sound} from '../sound/sound';
import {GameConfig} from '../../game-config';
import {TYPES} from '../../types';

@injectable()
export class PlayerFactory implements GameEntityFactory<Player> {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.SoundFactory) private readonly soundFactory: SoundFactory,
                @inject(TYPES.CollisionModelFactory) private readonly collisionModelFactory: CollisionModelFactory) {
    }

    create(parameters: {playerDef: any, camera: PerspectiveCamera, weapons: Map<string, Weapon>}): Player {
        const player = new Player({
            config: this.config,
            camera: parameters.camera,
            weapons: parameters.weapons,
            sounds: this.createSounds(parameters.playerDef),
            collisionModel: this.createCollisionModel(parameters.playerDef)
        });
        player.init();
        player.enableFists();
        return player;
    }

    private createSounds(playerDef: any): Map<string, Sound> {
        const sounds = new Map<string, Sound>();
        if (playerDef.sounds) {
            for (const soundName of Object.keys(playerDef.sounds)) {
                sounds.set(soundName, this.soundFactory.create(playerDef.sounds[soundName]));
            }
        }
        return sounds;
    }

    private createCollisionModel(playerDef: any) {
        return new PlayerCollisionModel(this.collisionModelFactory.create(playerDef.collisionModel));
    }
}
