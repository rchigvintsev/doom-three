import {inject, injectable} from 'inversify';
import {GameMap} from './entity/map/game-map';
import {GameMapFactory} from './entity/map/game-map-factory';
import {Weapon} from './entity/model/md5/weapon/weapon';
import {PlayerFactory} from './entity/player/player-factory';
import {Player} from './entity/player/player';
import {HudFactory} from './entity/hud/hud-factory';
import {WeaponFactory} from './entity/model/md5/weapon/weapon-factory';
import {TYPES} from './types';
import {PhysicsManager} from './physics/physics-manager';
import {Hud} from './entity/hud/hud';
import {Game} from './game';

@injectable()
export class GameLoader {
    constructor(@inject(TYPES.WeaponFactory) private readonly weaponFactory: WeaponFactory,
                @inject(TYPES.PlayerFactory) private readonly playerFactory: PlayerFactory,
                @inject(TYPES.HudFactory) private readonly hudFactory: HudFactory,
                @inject(TYPES.MapFactory) private readonly mapFactory: GameMapFactory,
                @inject(TYPES.PhysicsManager) private readonly physicsManager: PhysicsManager) {
    }

    load(): {map: GameMap, player: Player, hud: Hud} {
        const weapons = this.createWeapons();
        const player = this.createPlayer(weapons);
        const hud = this.createHud(player);
        const map = this.createMap(player);
        map.registerCollisionModels(this.physicsManager);
        return {map, player, hud};
    }

    private createWeapons(): Map<string, Weapon> {
        const weapons = new Map<string, Weapon>();
        Game.getContext().assets.weaponDefs.forEach((weaponDef, weaponName) =>
            weapons.set(weaponName, this.weaponFactory.create(weaponDef)));
        return weapons;
    }

    private createPlayer(weapons: Map<string, Weapon>): Player {
        return this.playerFactory.create({playerDef: Game.getContext().assets.playerDef, weapons});
    }

    private createHud(player: Player): Hud {
        return this.hudFactory.create({hudDef: Game.getContext().assets.hudDef, player});
    }

    private createMap(player: Player): GameMap {
        return this.mapFactory.create({mapDef: Game.getContext().assets.mapDef, player});
    }
}
