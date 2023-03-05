import {PerspectiveCamera, Scene} from 'three';

import {inject, injectable} from 'inversify';

import {GameAssets} from './game-assets';
import {GameMap} from './entity/map/game-map';
import {GameMapFactory} from './entity/map/game-map-factory';
import {Weapon} from './entity/model/md5/weapon/weapon';
import {PlayerFactory} from './entity/player/player-factory';
import {Player} from './entity/player/player';
import {HudFactory} from './entity/hud/hud-factory';
import {WeaponFactory} from './entity/model/md5/weapon/weapon-factory';
import {GameConfig} from './game-config';
import {TYPES} from './types';
import {PhysicsManager} from './physics/physics-manager';
import {Hud} from './entity/hud/hud';

@injectable()
export class GameLoader {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.Assets) private readonly assets: GameAssets,
                @inject(TYPES.Scene) private readonly scene: Scene,
                @inject(TYPES.WeaponFactory) private readonly weaponFactory: WeaponFactory,
                @inject(TYPES.PlayerFactory) private readonly playerFactory: PlayerFactory,
                @inject(TYPES.HudFactory) private readonly hudFactory: HudFactory,
                @inject(TYPES.MapFactory) private readonly mapFactory: GameMapFactory,
                @inject(TYPES.PhysicsManager) private readonly physicsManager: PhysicsManager) {
    }

    load(camera: PerspectiveCamera): {map: GameMap, player: Player, hud: Hud} {
        const weapons = this.createWeapons();
        const player = this.createPlayer(camera, weapons);
        const hud = this.createHud(player);
        const map = this.createMap(player);
        map.registerCollisionModels(this.physicsManager, this.scene);
        return {map, player, hud};
    }

    private createWeapons(): Map<string, Weapon> {
        const weapons = new Map<string, Weapon>();
        this.assets.weaponDefs.forEach((weaponDef, weaponName) =>
            weapons.set(weaponName, this.weaponFactory.create(weaponDef)));
        return weapons;
    }

    private createPlayer(camera: PerspectiveCamera, weapons: Map<string, Weapon>): Player {
        return this.playerFactory.create({playerDef: this.assets.playerDef, camera, weapons});
    }

    private createHud(player: Player): Hud {
        return this.hudFactory.create({hudDef: this.assets.hudDef, player});
    }

    private createMap(player: Player): GameMap {
        return this.mapFactory.create({mapDef: this.assets.mapDef, player});
    }
}
