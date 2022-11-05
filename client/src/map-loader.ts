import {AudioLoader, EventDispatcher, FileLoader, Mesh, Texture} from 'three';

import {Game} from './game';
import {GameConfig} from './game-config';
import {GameAssets} from './game-assets';
import {GameSystemType} from './game-system';
import {GameMap} from './entity/map/game-map';
import {TgaLoader} from './loader/tga-loader';
import {Md5MeshLoader} from './loader/md5-mesh-loader';
import {Md5AnimationLoader} from './loader/md5-animation-loader';
import {ProgressEvent} from './event/progress-event';
import {AreaFactory} from './entity/area/area-factory';
import {SurfaceFactory} from './entity/surface/surface-factory';
import {MaterialFactory} from './material/material-factory';
import {MapFactory} from './entity/map/map-factory';
import {LightFactory} from './entity/light/light-factory';
import {Md5ModelFactory} from './entity/model/md5/md5-model-factory';
import {SoundFactory} from './entity/sound/sound-factory';
import {Md5Animation} from './animation/md5-animation';
import {Weapon} from './entity/model/md5/weapon/weapon';
import {CollisionModelFactory} from './physics/collision-model-factory';
import {PlayerFactory} from './entity/player/player-factory';
import {Player} from './entity/player/player';
import {TgaImages} from "./util/tga-images";
import {PhysicsSystem} from './physics/physics-system';
import {ParticleFactory} from './entity/particle/particle-factory';
import {ParticleSystem} from './particles/particle-system';
import {Lwo2MeshLoader} from './loader/lwo2-mesh-loader';
import {DebrisSystem} from './debris/debris-system';
import {DebrisFactory} from './entity/model/lwo/debris-factory';

export class MapLoader extends EventDispatcher<ProgressEvent> {
    private readonly jsonLoader = new FileLoader();
    private readonly binaryFileLoader: FileLoader;
    private readonly tgaLoader = new TgaLoader();
    private readonly md5MeshLoader = new Md5MeshLoader();
    private readonly md5AnimationLoader = new Md5AnimationLoader();
    private readonly lwoMeshLoader = new Lwo2MeshLoader();
    private readonly soundLoader = new AudioLoader();

    constructor(private readonly game: Game) {
        super();
        this.binaryFileLoader = new FileLoader();
        this.binaryFileLoader.setResponseType('arraybuffer');
    }

    load(mapName: string): Promise<GameMap> {
        console.debug(`Loading of map "${mapName}"...`);

        const assets = new GameAssets();
        const context = new LoadingContext(assets);

        return Promise.all([
            this.loadMapMeta(context, mapName),
            this.loadMapDef(context, mapName),
            this.loadMaterialDefs(context),
            this.loadTableDefs(context),
            this.loadParticleDefs(context),
            this.loadSoundDefs(context),
            this.loadPlayerDef(context),
            this.loadWeaponDefs(context),
            this.loadDebrisDefs(context)
        ]).then(() => {
            const config = this.game.config;

            if (!config.renderOnlyWireframe) {
                this.collectTextureSources(context, context.mapMeta.materials);
            }
            this.collectModelSources(context, context.mapMeta);
            this.collectAnimationSources(context, context.mapMeta);
            this.collectSoundSources(context, context.mapMeta);

            this.collectSoundSources(context, context.playerDef);

            context.weaponDefs.forEach(weaponDef => {
                context.modelsToLoad.add(weaponDef.model);
                if (!config.renderOnlyWireframe) {
                    this.collectTextureSourcesFromWeaponDef(context, weaponDef);
                }
                this.collectAnimationSources(context, weaponDef);
                this.collectSoundSources(context, weaponDef);
            });

            context.debrisDefs.forEach(ammoDef => {
                context.modelsToLoad.add(ammoDef.model);
                if (!config.renderOnlyWireframe) {
                    this.collectTextureSources(context, ammoDef.materials);
                }
                this.collectSoundSources(context, ammoDef);
            });

            console.debug(`A total of ${context.total} assets need to be loaded for map "${mapName}"`);

            return Promise.all([
                this.loadTextures(context),
                this.loadModels(context),
                this.loadAnimations(context),
                this.loadSounds(context)
            ]).then(() => {
                const physicsSystem = <PhysicsSystem>this.game.systems.get(GameSystemType.PHYSICS);

                const evalScope = this.getExpressionEvaluationScope(config, context.tableDefs);
                const materialFactory = new MaterialFactory(context.materialDefs, assets, evalScope);
                const soundFactory = new SoundFactory({
                    config,
                    assets,
                    audioListener: this.game.audioListener,
                    soundDefs: context.soundDefs
                });
                const particleFactory = new ParticleFactory({
                    config,
                    particleDefs: context.particleDefs,
                    materialFactory
                });
                const collisionModelFactory = new CollisionModelFactory(config, physicsSystem);
                const debrisFactory = new DebrisFactory({
                    config,
                    assets,
                    debrisDefs: context.debrisDefs,
                    materialFactory,
                    collisionModelFactory
                });

                this.initParticleSystem(particleFactory);
                this.initDebrisSystem(debrisFactory);

                const weapons = this.createWeapons(context.weaponDefs, assets, materialFactory, soundFactory);
                const player = this.createPlayer(context.playerDef, weapons, soundFactory, collisionModelFactory);
                return this.createMap(context.mapDef, player, materialFactory, collisionModelFactory);
            });
        });
    }

    private loadMapMeta(context: LoadingContext, mapName: string): Promise<any> {
        return this.loadJson(`assets/maps/${mapName}.meta.json`).then(mapMeta => {
            context.mapMeta = mapMeta;
            return mapMeta;
        });
    }

    private loadMapDef(context: LoadingContext, mapName: string): Promise<any> {
        return this.loadJson(`assets/maps/${mapName}.json`).then(mapDef => {
            context.mapDef = mapDef;
            return mapDef;
        });
    }

    private loadMaterialDefs(context: LoadingContext): Promise<Map<string, any>> {
        return this.loadJson('assets/materials.json').then((materialDefs: any[]) => {
            materialDefs.forEach(materialDef => context.materialDefs.set(materialDef.name, materialDef));
            return context.materialDefs;
        });
    }

    private loadTableDefs(context: LoadingContext): Promise<Map<string, any>> {
        return this.loadJson('assets/tables.json').then((tableDefs: any[]) => {
            tableDefs.forEach(tableDef => context.tableDefs.set(tableDef.name, tableDef));
            return context.tableDefs;
        });
    }

    private loadParticleDefs(context: LoadingContext): Promise<Map<string, any>> {
        return this.loadJson('assets/particles.json').then((particleDefs: any[]) => {
            particleDefs.forEach(particleDef => context.particleDefs.set(particleDef.name, particleDef));
            return context.particleDefs;
        });
    }

    private loadSoundDefs(context: LoadingContext): Promise<Map<string, any>> {
        return this.loadJson('assets/sounds.json').then((soundDefs: any[]) => {
            soundDefs.forEach(soundDef => context.soundDefs.set(soundDef.name, soundDef));
            return context.soundDefs;
        });
    }

    private loadPlayerDef(context: LoadingContext): Promise<any> {
        return this.loadJson('assets/player.json').then(playerDef => {
            context.playerDef = playerDef;
            return playerDef;
        });
    }

    private loadWeaponDefs(context: LoadingContext): Promise<Map<string, any>> {
        return this.loadJson('assets/weapons.json').then((weaponDefs: any[]) => {
            weaponDefs.forEach(weaponDef => context.weaponDefs.set(weaponDef.name, weaponDef));
            return context.weaponDefs;
        });
    }

    private loadDebrisDefs(context: LoadingContext): Promise<Map<string, any>> {
        return this.loadJson('assets/debris.json').then((debrisDefs: any[]) => {
            debrisDefs.forEach(debrisDef => context.debrisDefs.set(debrisDef.name, debrisDef));
            return context.debrisDefs;
        });
    }

    private loadJson(url: string): Promise<any> {
        return this.jsonLoader.loadAsync(url)
            .then(response => JSON.parse(<string>response))
            .catch(reason => {
                console.error(`Failed to load JSON file "${url}"`, reason);
                return Promise.reject(reason);
            });
    }

    private collectTextureSourcesFromWeaponDef(context: LoadingContext, weaponDef: any) {
        const materials = [...weaponDef.materials];
        if (weaponDef.muzzleSmoke) {
            const particleDef = context.particleDefs.get(weaponDef.muzzleSmoke);
            if (!particleDef) {
                console.error(`Definition of particle "${weaponDef.muzzleSmoke}" is not found`);
            } else {
                materials.push(particleDef.material);
            }
        }
        this.collectTextureSources(context, materials);
    }

    private collectTextureSources(context: LoadingContext, materials: string[]) {
        materials.forEach(materialName => {
            const materialDef = context.materialDefs.get(materialName);
            if (materialDef) {
                for (const mapName of ['diffuseMap', 'specularMap', 'normalMap', 'alphaMap']) {
                    if (materialDef[mapName]) {
                        const source = new TextureSource(materialDef[mapName], this.tgaLoader, this.binaryFileLoader);
                        context.texturesToLoad.set(source.name, source);
                    }
                }
                if (materialDef.maps) { // Shader material
                    for (const mapDef of materialDef.maps) {
                        const source = new TextureSource(mapDef, this.tgaLoader, this.binaryFileLoader);
                        context.texturesToLoad.set(source.name, source);
                    }
                }
            } else {
                console.error(`Definition of material "${materialName}" is not found`);
            }
        });
    }

    private collectModelSources(context: LoadingContext, entityDef: any) {
        if (entityDef.models) {
            entityDef.models.forEach((modelName: string) => context.modelsToLoad.add(modelName));
        }
    }

    private collectAnimationSources(context: LoadingContext, entityDef: any) {
        if (entityDef.animations) {
            (<string[]>entityDef.animations).forEach(animationName => context.animationsToLoad.add(animationName));
        }
    }

    private collectSoundSources(context: LoadingContext, entityDef: any) {
        if (entityDef.sounds) {
            Object.keys(entityDef.sounds).forEach(key => {
                const soundName = entityDef.sounds[key];
                const soundDef = context.soundDefs.get(soundName);
                if (soundDef) {
                    soundDef.sources.forEach((source: string) => context.soundsToLoad.add(source));
                } else {
                    console.error(`Definition of sound "${soundName}" is not found`);
                }
            });
        }
    }

    private loadTextures(context: LoadingContext): Promise<Texture[]> {
        const texturePromises: Promise<any>[] = [];
        context.texturesToLoad.forEach(textureSource => {
            texturePromises.push(textureSource.loadAsync().then(texture => {
                context.onTextureLoad(textureSource.name, texture);
                this.publishProgress(context);
            }));
        });
        return Promise.all(texturePromises);
    }

    private loadModels(context: LoadingContext): Promise<Mesh[]> {
        const modelPromises: Promise<Mesh>[] = [];
        for (const modelName of context.modelsToLoad) {
            let modelLoader;
            if (modelName.toLowerCase().endsWith('.md5mesh')) {
                modelLoader = this.md5MeshLoader;
            } else if (modelName.toLowerCase().endsWith('.lwo')) {
                modelLoader = this.lwoMeshLoader;
            } else {
                throw new Error(`Model "${modelName}" has unsupported type`);
            }

            modelPromises.push(modelLoader.loadAsync(`assets/${modelName}`).then(mesh => {
                console.debug(`Model "${modelName}" is loaded`);
                context.onModelMeshLoad(modelName, mesh);
                this.publishProgress(context);
                return mesh;
            }).catch(reason => {
                console.error(`Failed to load model "${modelName}"`, reason);
                return Promise.reject(reason);
            }));
        }
        return Promise.all(modelPromises);
    }

    private loadAnimations(context: LoadingContext): Promise<Md5Animation[]> {
        const animationPromises: Promise<Md5Animation>[] = [];
        for (const animationName of context.animationsToLoad) {
            if (animationName.toLowerCase().endsWith('.md5anim')) {
                animationPromises.push(this.md5AnimationLoader.loadAsync(`assets/${animationName}`).then(animation => {
                    console.debug(`Animation "${animationName}" is loaded`);
                    context.onModelAnimationLoad(animationName, animation);
                    this.publishProgress(context);
                    return animation;
                }).catch(reason => {
                    console.error(`Failed to load animation "${animationName}"`, reason);
                    return Promise.reject(reason);
                }));
            } else {
                throw new Error(`Animation "${animationName}" has unsupported type`);
            }
        }
        return Promise.all(animationPromises);
    }

    private loadSounds(context: LoadingContext): Promise<AudioBuffer[]> {
        const soundPromises: Promise<AudioBuffer>[] = [];
        for (const soundName of context.soundsToLoad) {
            soundPromises.push(this.soundLoader.loadAsync(`assets/${soundName}`).then(sound => {
                console.debug(`Sound "${soundName}" is loaded`);
                context.onSoundLoad(soundName, sound);
                this.publishProgress(context);
                return sound;
            }).catch(reason => {
                console.error(`Failed to load sound "${soundName}"`, reason);
                return Promise.reject(reason);
            }));
        }
        return Promise.all(soundPromises);
    }

    private publishProgress(context: LoadingContext) {
        this.dispatchEvent(new ProgressEvent(context.total, context.loaded));
    }

    private initParticleSystem(particleFactory: ParticleFactory) {
        this.game.systems.set(GameSystemType.PARTICLE, new ParticleSystem(this.game.scene, particleFactory));
    }

    private initDebrisSystem(debrisFactory: DebrisFactory) {
        const physicsSystem = <PhysicsSystem>this.game.systems.get(GameSystemType.PHYSICS);
        this.game.systems.set(GameSystemType.DEBRIS, new DebrisSystem(this.game.scene, debrisFactory, physicsSystem));
    }

    private createWeapons(weaponDefs: Map<string, any>,
                          assets: GameAssets,
                          materialFactory: MaterialFactory,
                          soundFactory: SoundFactory): Map<string, Weapon> {
        const modelFactory = new Md5ModelFactory({
            config: this.game.config,
            assets,
            materialFactory,
            soundFactory,
            particleSystem: <ParticleSystem>this.game.systems.get(GameSystemType.PARTICLE),
            debrisSystem: <DebrisSystem>this.game.systems.get(GameSystemType.DEBRIS)
        });
        const weapons = new Map<string, Weapon>();
        weaponDefs.forEach((weaponDef, weaponName) =>
            weapons.set(weaponName, <Weapon>modelFactory.create(weaponDef)));
        return weapons;
    }

    private createPlayer(playerDef: any,
                         weapons: Map<string, Weapon>,
                         soundFactory: SoundFactory,
                         collisionModelFactory: CollisionModelFactory): Player {
        return new PlayerFactory({
            config: this.game.config,
            camera: this.game.camera,
            weapons,
            soundFactory,
            collisionModelFactory
        }).create(playerDef);
    }

    private createMap(mapDef: any,
                      player: Player,
                      materialFactory: MaterialFactory,
                      collisionModelFactory: CollisionModelFactory): GameMap {
        const config = this.game.config;

        const surfaceFactory = new SurfaceFactory({config, materialFactory, collisionModelFactory});
        const lightFactory = new LightFactory({config});
        const areaFactory = new AreaFactory({config, surfaceFactory, lightFactory});
        const mapFactory = new MapFactory({config, player, areaFactory, lightFactory});

        const map = mapFactory.create(mapDef);
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

class LoadingContext {
    readonly texturesToLoad = new Map<string, TextureSource>();
    readonly modelsToLoad = new Set<string>();
    readonly animationsToLoad = new Set<string>();
    readonly soundsToLoad = new Set<string>();

    mapMeta: any;
    mapDef: any;
    playerDef: any;

    readonly materialDefs = new Map<string, any>();
    readonly tableDefs = new Map<string, any>();
    readonly particleDefs = new Map<string, any>();
    readonly soundDefs = new Map<string, any>();
    readonly weaponDefs = new Map<string, any>();
    readonly debrisDefs = new Map<string, any>();

    loaded = 0;

    constructor(private readonly assets: GameAssets) {
    }

    get total(): number {
        return this.texturesToLoad.size + this.modelsToLoad.size + this.animationsToLoad.size + this.soundsToLoad.size;
    }

    onTextureLoad(textureName: string, texture: Texture) {
        this.assets.textures.set(textureName, texture);
        this.loaded++;
    }

    onModelAnimationLoad(animationName: string, animation: Md5Animation) {
        this.assets.modelAnimations.set(animationName, animation);
        this.loaded++;
    }

    onModelMeshLoad(modelName: string, mesh: Mesh) {
        this.assets.modelMeshes.set(modelName, mesh);
        this.loaded++;
    }

    onSoundLoad(soundName: string, sound: AudioBuffer) {
        this.assets.sounds.set(soundName, sound);
        this.loaded++;
    }
}

class TextureSource {
    readonly name: string;

    constructor(readonly textureDef: any, readonly tgaLoader: TgaLoader, readonly binaryFileLoader: FileLoader) {
        this.name = typeof textureDef === 'string' ? textureDef : textureDef.name;
    }

    loadAsync(): Promise<Texture> {
        if (typeof this.textureDef === 'string') {
            return this.loadTexture(this.textureDef);
        }

        const addNormals = this.textureDef.addNormals;
        if (addNormals) {
            return Promise.all([
                this.loadTextureBuffer(addNormals.normalMap),
                this.loadTextureBuffer(addNormals.bumpMap)
            ]).then(results => {
                const canvas = TgaImages.addNormals(results[0], results[1], addNormals.scale);
                const texture = new Texture();
                texture.image = canvas;
                return texture;
            });
        }

        return this.loadTexture(this.name);
    }

    private loadTexture(textureName: string): Promise<Texture> {
        return this.tgaLoader.loadAsync(`assets/${textureName}.tga`).then(texture => {
            console.debug(`Texture "${textureName}" is loaded`);
            return texture;
        }).catch(reason => {
            console.error(`Failed to load texture "${textureName}"`, reason);
            return Promise.reject(reason);
        });
    }

    private loadTextureBuffer(textureName: string): Promise<ArrayBuffer> {
        return this.binaryFileLoader.loadAsync(`assets/${textureName}.tga`).then(texture => {
            console.debug(`Texture "${textureName}" is loaded`);
            return texture as ArrayBuffer;
        }).catch(reason => {
            console.error(`Failed to load texture "${textureName}"`, reason);
            return Promise.reject(reason);
        });
    }
}