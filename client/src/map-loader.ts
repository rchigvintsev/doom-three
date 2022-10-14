import {AudioLoader, EventDispatcher, FileLoader, Mesh, Texture} from 'three';

import {TgaLoader} from './loader/tga-loader';
import {Md5MeshLoader} from './loader/md5-mesh-loader';
import {Md5AnimationLoader} from './loader/md5-animation-loader';
import {ProgressEvent} from './event/progress-event';
import {GameAssets} from './game-assets';
import {AreaFactory} from './entity/area/area-factory';
import {SurfaceFactory} from './entity/surface/surface-factory';
import {MaterialFactory} from './material/material-factory';
import {GameMap} from './entity/map/game-map';
import {MapFactory} from './entity/map/map-factory';
import {LightFactory} from './entity/light/light-factory';
import {Md5ModelFactory} from './entity/md5model/md5-model-factory';
import {SoundFactory} from './entity/sound/sound-factory';
import {Md5Animation} from './animation/md5-animation';
import {Weapon} from './entity/md5model/weapon/weapon';
import {CollisionModelFactory} from './physics/collision-model-factory';
import {Game} from './game';
import {PlayerFactory} from './entity/player/player-factory';
import {Player} from './entity/player/player';
import {TgaImages} from "./util/tga-images";
import {GameConfig} from './game-config';

export class MapLoader extends EventDispatcher<ProgressEvent> {
    private readonly jsonLoader = new FileLoader();
    private readonly binaryFileLoader: FileLoader;
    private readonly tgaLoader = new TgaLoader();
    private readonly md5MeshLoader = new Md5MeshLoader();
    private readonly md5AnimationLoader = new Md5AnimationLoader();
    private readonly soundLoader = new AudioLoader();

    constructor(private readonly game: Game) {
        super();
        this.binaryFileLoader = new FileLoader();
        this.binaryFileLoader.setResponseType('arraybuffer');
    }

    load(mapName: string): Promise<GameMap> {
        console.debug(`Loading of map "${mapName}"...`);

        return Promise.all([
            this.loadMapMeta(mapName),
            this.loadMapDef(mapName),
            this.loadMaterialDefs(),
            this.loadTableDefs(),
            this.loadSoundDefs(),
            this.loadPlayerDef(),
            this.loadWeaponDefs(),
        ]).then(result => {
            const mapMeta = result[0];
            const mapDef = result[1];
            const materialDefs = result[2];
            const tableDefs = result[3];
            const soundDefs = result[4];
            const playerDef = result[5];
            const weaponDefs = result[6];

            const assets = new GameAssets();
            const context = new LoadingContext(assets);

            const config = this.game.config;

            this.getSoundSources(playerDef, soundDefs).forEach(source => context.soundsToLoad.add(source));

            weaponDefs.forEach(weaponDef => {
                context.modelsToLoad.add(weaponDef.model);
                if (!config.renderOnlyWireframe) {
                    this.getTextureSources(weaponDef, materialDefs)
                        .forEach((source, name) => context.texturesToLoad.set(name, source));
                }
                this.getAnimationSources(weaponDef).forEach(animation => context.animationsToLoad.add(animation));
                this.getSoundSources(weaponDef, soundDefs).forEach(source => context.soundsToLoad.add(source));
            });

            if (!config.renderOnlyWireframe) {
                this.getTextureSources(mapMeta, materialDefs)
                    .forEach((source, name) => context.texturesToLoad.set(name, source));
            }
            this.getModelSources(mapMeta).forEach(source => context.modelsToLoad.add(source));
            this.getAnimationSources(mapMeta).forEach(source => context.animationsToLoad.add(source));
            this.getSoundSources(mapMeta, soundDefs).forEach(source => context.soundsToLoad.add(source));

            console.debug(`A total of ${context.total} assets need to be loaded for map "${mapName}"`);

            return Promise.all([
                this.loadTextures(context),
                this.loadModels(context),
                this.loadAnimations(context),
                this.loadSounds(context)
            ]).then(() => {
                const evalScope = this.getExpressionEvaluationScope(config, tableDefs);
                const materialFactory = new MaterialFactory(materialDefs, assets, evalScope);
                const soundFactory = new SoundFactory(this.game.audioListener, soundDefs, assets);
                const collisionModelFactory = new CollisionModelFactory(config, this.game.physicsWorld);

                const weapons = this.createWeapons(weaponDefs, assets, materialFactory, soundFactory);
                const player = this.createPlayer(playerDef, weapons, soundFactory, collisionModelFactory);
                return this.createMap(mapDef, player, materialFactory, collisionModelFactory);
            });
        });
    }

    private loadMapMeta(mapName: string): Promise<any> {
        return this.loadJson(`assets/maps/${mapName}.meta.json`);
    }

    private loadMapDef(mapName: string): Promise<any> {
        return this.loadJson(`assets/maps/${mapName}.json`);
    }

    private loadMaterialDefs(): Promise<Map<string, any>> {
        return this.loadJson('assets/materials.json').then((materialDefs: any[]) => {
            const result = new Map<string, any>();
            materialDefs.forEach(materialDef => result.set(materialDef.name, materialDef));
            return result;
        });
    }

    private loadTableDefs(): Promise<Map<string, any>> {
        return this.loadJson('assets/tables.json').then((tableDefs: any[]) => {
            const result = new Map<string, any>();
            for (const table of tableDefs) {
                result.set(table.name, table);
            }
            return result;
        });
    }

    private loadSoundDefs(): Promise<Map<string, any>> {
        return this.loadJson('assets/sounds.json').then((soundDefs: any[]) => {
            const result = new Map<string, any>();
            soundDefs.forEach(soundDef => result.set(soundDef.name, soundDef));
            return result;
        });
    }

    private loadPlayerDef(): Promise<any> {
        return this.loadJson('assets/player.json');
    }

    private loadWeaponDefs(): Promise<Map<string, any>> {
        return this.loadJson('assets/weapons.json').then((weaponDefs: any[]) => {
            const result = new Map<string, any>();
            weaponDefs.forEach(weaponDef => result.set(weaponDef.name, weaponDef));
            return result;
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
            if (modelName.toLowerCase().endsWith('.md5mesh')) {
                modelPromises.push(this.md5MeshLoader.loadAsync(`assets/${modelName}`).then(mesh => {
                    console.debug(`Model "${modelName}" is loaded`);
                    context.onModelMeshLoad(modelName, mesh);
                    this.publishProgress(context);
                    return mesh;
                }).catch(reason => {
                    console.error(`Failed to load model "${modelName}"`, reason);
                    return Promise.reject(reason);
                }));
            } else {
                throw new Error(`Model "${modelName}" has unsupported type`);
            }
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

    private getTextureSources(entityDef: any, materialDefs: Map<string, any>): Map<string, TextureSource> {
        const result = new Map<string, TextureSource>();
        (<string[]>entityDef.materials).forEach(materialName => {
            const materialDef = materialDefs.get(materialName);
            if (materialDef) {
                for (const mapName of ['diffuseMap', 'specularMap', 'normalMap', 'alphaMap']) {
                    if (materialDef[mapName]) {
                        const source = new TextureSource(materialDef[mapName], this.tgaLoader, this.binaryFileLoader);
                        result.set(source.name, source);
                    }
                }
                if (materialDef.maps) { // Shader material
                    for (const mapDef of materialDef.maps) {
                        const source = new TextureSource(mapDef, this.tgaLoader, this.binaryFileLoader);
                        result.set(source.name, source);
                    }
                }
            } else {
                console.error(`Definition of material "${materialName}" is not found`);
            }
        });
        return result;
    }

    private getModelSources(entityDef: any): Set<string> {
        const result = new Set<string>();
        if (entityDef.models) {
            entityDef.models.forEach((modelName: string) => result.add(modelName));
        }
        return result;
    }

    private getAnimationSources(entityDef: any): Set<string> {
        const result = new Set<string>();
        if (entityDef.animations) {
            (<string[]>entityDef.animations).forEach(animationName => result.add(animationName));
        }
        return result;
    }

    private getSoundSources(entityDef: any, soundDefs: Map<string, any>): Set<string> {
        const result = new Set<string>();
        if (entityDef.sounds) {
            Object.keys(entityDef.sounds).forEach(key => {
                const soundName = entityDef.sounds[key];
                const soundDef = soundDefs.get(soundName);
                if (soundDef) {
                    soundDef.sources.forEach((source: string) => result.add(source));
                } else {
                    console.error(`Definition of sound "${soundName}" is not found`);
                }
            });
        }
        return result;
    }

    private publishProgress(context: LoadingContext) {
        this.dispatchEvent(new ProgressEvent(context.total, context.loaded));
    }

    private createWeapons(weaponDefs: Map<string, any>,
                          assets: GameAssets,
                          materialFactory: MaterialFactory,
                          soundFactory: SoundFactory): Map<string, Weapon> {
        const config = this.game.config;
        const modelFactory = new Md5ModelFactory(config, assets, materialFactory, soundFactory);
        const weapons = new Map<string, Weapon>();
        weaponDefs.forEach((weaponDef, weaponName) =>
            weapons.set(weaponName, <Weapon>modelFactory.create(weaponDef)));
        return weapons;
    }

    private createPlayer(playerDef: any,
                         weapons: Map<string, Weapon>,
                         soundFactory: SoundFactory,
                         collisionModelFactory: CollisionModelFactory): Player {
        const playerFactory = new PlayerFactory(this.game.config, this.game.camera, weapons, soundFactory,
            collisionModelFactory);
        return playerFactory.create(playerDef);
    }

    private createMap(mapDef: any,
                      player: Player,
                      materialFactory: MaterialFactory,
                      collisionModelFactory: CollisionModelFactory): GameMap {
        const config = this.game.config;

        const surfaceFactory = new SurfaceFactory(config, materialFactory, collisionModelFactory);
        const lightFactory = new LightFactory(config);
        const areaFactory = new AreaFactory(config, surfaceFactory, lightFactory);
        const mapFactory = new MapFactory(config, player, areaFactory, lightFactory);

        const map = mapFactory.create(mapDef);
        map.registerCollisionModels(this.game.physicsWorld, this.game.scene);
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