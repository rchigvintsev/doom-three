import {Game} from './game';
import {GameConfig} from './game-config';
import {GameAssets} from './game-assets';
import {GameSystemType} from './game-system';
import {GameMap} from './entity/map/game-map';
import {AreaFactory} from './entity/area/area-factory';
import {SurfaceFactory} from './entity/surface/surface-factory';
import {MaterialFactory} from './material/material-factory';
import {MapFactory} from './entity/map/map-factory';
import {LightFactory} from './entity/light/light-factory';
import {Md5ModelFactory} from './entity/model/md5/md5-model-factory';
import {SoundFactory} from './entity/sound/sound-factory';
import {Weapon} from './entity/model/md5/weapon/weapon';
import {CollisionModelFactory} from './physics/collision-model-factory';
import {PlayerFactory} from './entity/player/player-factory';
import {Player} from './entity/player/player';
import {PhysicsSystem} from './physics/physics-system';
import {ParticleFactory} from './entity/particle/particle-factory';
import {ParticleSystem} from './particles/particle-system';
import {DebrisSystem} from './debris/debris-system';
import {DebrisFactory} from './entity/model/lwo/debris-factory';
import {HudFactory} from './entity/player/hud/hud-factory';
import {Hud} from './entity/player/hud/hud';
import {AssetLoader} from './asset-loader';

export class MapLoader {
    constructor(private readonly game: Game, private readonly assetLoader: AssetLoader) {
    }

    load(mapName: string): Promise<GameMap> {
        console.debug(`Loading of map "${mapName}"...`);

        return this.assetLoader.load(mapName).then(assets => {
            const config = this.game.config;
            const physicsSystem = <PhysicsSystem>this.game.systems.get(GameSystemType.PHYSICS);

            const evalScope = this.getExpressionEvaluationScope(config, assets.tableDefs);
            const materialFactory = new MaterialFactory({assets, evalScope});
            const collisionModelFactory = new CollisionModelFactory({config, physicsSystem});
            const soundFactory = new SoundFactory({config, assets, audioListener: this.game.audioListener});
            const particleFactory = new ParticleFactory({config, assets, materialFactory});
            const debrisFactory = new DebrisFactory({
                config: config,
                assets,
                materialFactory,
                soundFactory,
                collisionModelFactory
            });

            this.initParticleSystem(particleFactory);
            this.initDebrisSystem(debrisFactory);

            const weapons = this.createWeapons(assets, materialFactory, soundFactory);
            const player = this.createPlayer(assets, weapons, soundFactory, collisionModelFactory);
            const hud = this.createHud(assets, materialFactory);

            return this.createMap(assets, player, hud, materialFactory, collisionModelFactory);
        });
    }

    private initParticleSystem(particleFactory: ParticleFactory) {
        this.game.systems.set(GameSystemType.PARTICLE, new ParticleSystem(this.game.scene, particleFactory));
    }

    private initDebrisSystem(debrisFactory: DebrisFactory) {
        const physicsSystem = <PhysicsSystem>this.game.systems.get(GameSystemType.PHYSICS);
        this.game.systems.set(GameSystemType.DEBRIS, new DebrisSystem(this.game.scene, debrisFactory, physicsSystem));
    }

    private createWeapons(assets: GameAssets, materialFactory: MaterialFactory, soundFactory: SoundFactory):
        Map<string, Weapon> {
        const modelFactory = new Md5ModelFactory({
            config: this.game.config,
            assets,
            materialFactory,
            soundFactory,
            particleSystem: <ParticleSystem>this.game.systems.get(GameSystemType.PARTICLE),
            debrisSystem: <DebrisSystem>this.game.systems.get(GameSystemType.DEBRIS)
        });
        const weapons = new Map<string, Weapon>();
        assets.weaponDefs.forEach((weaponDef, weaponName) =>
            weapons.set(weaponName, <Weapon>modelFactory.create(weaponDef)));
        return weapons;
    }

    private createPlayer(assets: GameAssets,
                         weapons: Map<string, Weapon>,
                         soundFactory: SoundFactory,
                         collisionModelFactory: CollisionModelFactory): Player {
        return new PlayerFactory({
            config: this.game.config,
            camera: this.game.camera,
            weapons,
            soundFactory,
            collisionModelFactory
        }).create(assets.playerDef);
    }

    private createHud(assets: GameAssets, materialFactory: MaterialFactory) {
        return new HudFactory({config: this.game.config, materialFactory}).create(assets.hudDef);
    }

    private createMap(assets: GameAssets,
                      player: Player,
                      hud: Hud,
                      materialFactory: MaterialFactory,
                      collisionModelFactory: CollisionModelFactory): GameMap {
        const config = this.game.config;

        const surfaceFactory = new SurfaceFactory({config, materialFactory, collisionModelFactory});
        const lightFactory = new LightFactory({config});
        const areaFactory = new AreaFactory({config, surfaceFactory, lightFactory});
        const mapFactory = new MapFactory({config, player, hud, areaFactory, lightFactory});

        const map = mapFactory.create(assets.mapDef);
        const physicsSystem = <PhysicsSystem>this.game.systems.get(GameSystemType.PHYSICS);
        map.registerCollisionModels(physicsSystem, this.game.scene);
        return map;
    }

    private getExpressionEvaluationScope(config: GameConfig, tables: Map<string, any>): any {
        if (config.renderOnlyWireframe) {
            return undefined;
        }

        const evalScope: any = {};
        tables.forEach((table, name) => {
            evalScope[name] = (deltaTime: number) => {
                const val = deltaTime % table.values.length;
                if (!table.snap) {
                    const floor = Math.floor(val);
                    const ceil = Math.min(Math.ceil(val), table.values.length);
                    const floorVal = table.values[floor];
                    const ceilVal = table.values[ceil];
                    return floorVal + (val - floor) * 100 * ((ceilVal - floorVal) / 100);
                }
                return table.values[Math.floor(val)];
            };
        });
        return evalScope;
    }
}
