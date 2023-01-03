import {Game} from './game';
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
import {HudFactory} from './entity/hud/hud-factory';
import {Hud} from './entity/hud/hud';
import {AssetLoader} from './asset-loader';
import {SpriteTextFactory} from './entity/text/sprite-text-factory';
import {DecalFactory} from './entity/decal/decal-factory';
import {DecalSystem} from './decal/decal-system';
import {SoundSystem} from './sound/sound-system';

export class MapLoader {
    constructor(private readonly game: Game, private readonly assetLoader: AssetLoader) {
    }

    load(mapName: string): Promise<GameMap> {
        console.debug(`Loading of map "${mapName}"...`);

        return this.assetLoader.load(mapName).then(assets => {
            const config = this.game.config;
            const physicsSystem = <PhysicsSystem>this.game.systems.get(GameSystemType.PHYSICS);

            const evalScope = this.getExpressionEvaluationScope(assets.tableDefs);
            const materialFactory = new MaterialFactory({assets, evalScope});
            const collisionModelFactory = new CollisionModelFactory({config, physicsSystem});
            const soundFactory = new SoundFactory({config, assets, audioListener: this.game.audioListener});
            const particleFactory = new ParticleFactory({config, assets, materialFactory});
            const debrisFactory = new DebrisFactory({
                config,
                assets,
                materialFactory,
                soundFactory,
                collisionModelFactory
            });
            const decalFactory = new DecalFactory({config, assets, materialFactory});

            this.initParticleSystem(particleFactory);
            this.initDebrisSystem(debrisFactory);
            this.initDecalSystem(decalFactory);
            this.initSoundSystem(soundFactory);

            const weapons = this.createWeapons(assets, materialFactory);
            const player = this.createPlayer(assets, weapons, soundFactory, collisionModelFactory);
            const hud = this.createHud(assets, player, materialFactory);

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

    private initDecalSystem(decalFactory: DecalFactory) {
        this.game.systems.set(GameSystemType.DECAL, new DecalSystem(this.game.config, this.game.scene, decalFactory));
    }

    private initSoundSystem(soundFactory: SoundFactory) {
        this.game.systems.set(GameSystemType.SOUND, new SoundSystem(soundFactory));
    }

    private createWeapons(assets: GameAssets, materialFactory: MaterialFactory):
        Map<string, Weapon> {
        const modelFactory = new Md5ModelFactory({
            config: this.game.config,
            assets,
            materialFactory,
            particleSystem: <ParticleSystem>this.game.systems.get(GameSystemType.PARTICLE),
            debrisSystem: <DebrisSystem>this.game.systems.get(GameSystemType.DEBRIS),
            decalSystem: <DecalSystem>this.game.systems.get(GameSystemType.DECAL),
            soundSystem: <SoundSystem>this.game.systems.get(GameSystemType.SOUND)
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

    private createHud(assets: GameAssets, player: Player, materialFactory: MaterialFactory) {
        const spriteTextFactory = new SpriteTextFactory({config: this.game.config, assets, materialFactory});
        const hudFactory = new HudFactory({
            config: this.game.config,
            assets,
            player,
            materialFactory,
            spriteTextFactory
        });
        return hudFactory.create(assets.hudDef);
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

    private getExpressionEvaluationScope(tables: Map<string, any>): any {
        const evalScope: any = {};
        tables.forEach((table, name) => {
            /*
             * Based on the code from DeclTable.cpp file that can be found in DOOM 3 GitHub repository
             * (https://github.com/id-Software/DOOM-3).
             */
            evalScope[name] = (deltaTime: number) => {
                deltaTime *= table.values.length;
                let index = Math.floor(deltaTime);
                const frac = deltaTime - index;
                index %= table.values.length;
                if (!table.snap) {
                    const val = table.values[index] * (1.0 - frac);
                    if (index < table.values.length - 1) {
                        return val + table.values[index + 1] * frac;
                    }
                    return val + table.values[0] * frac;
                }
                return table.values[index];
            };
        });
        return evalScope;
    }
}
