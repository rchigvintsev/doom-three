import {AudioLoader, EventDispatcher, FileLoader, Texture} from 'three';

import {GameConfig} from './game-config';
import {TgaLoader} from './loader/tga-loader';
import {Md5MeshLoader} from './loader/md5-mesh-loader';
import {Md5AnimationLoader} from './loader/md5-animation-loader';
import {ProgressEvent} from './event/progress-event';
import {GameAssets} from './game-assets';
import {Md5Animation} from './entity/md5model/md5-animation';
import {Md5Mesh} from './entity/md5model/md5-mesh';
import {AreaFactory} from './entity/area/area-factory';
import {SurfaceFactory} from './entity/surface/surface-factory';
import {MaterialFactory} from './material/material-factory';
import {GameMap} from './entity/map/game-map';
import {MapFactory} from './entity/map/map-factory';

export class MapLoader extends EventDispatcher<ProgressEvent> {
    private readonly jsonLoader = new FileLoader();
    private readonly tgaLoader = new TgaLoader();
    private readonly md5MeshLoader = new Md5MeshLoader();
    private readonly md5AnimationLoader = new Md5AnimationLoader();
    private readonly soundLoader = new AudioLoader();

    constructor(private config: GameConfig) {
        super();
    }

    load(mapName: string): Promise<GameMap> {
        console.debug(`Loading of map "${mapName}"...`);

        return Promise.all([
            this.loadMapMeta(mapName),
            this.loadMapDef(mapName),
            this.loadMaterialDefs(),
            this.loadSoundDefs(),
            this.loadPlayerDef(),
            this.loadWeaponDefs(),
        ]).then(result => {
            const mapMeta = result[0];
            const mapDef = result[1];
            const materialDefs = result[2];
            const soundDefs = result[3];
            const playerDef = result[4];
            const weaponDefs = result[5];

            const assets = new GameAssets();
            const context = new LoadingContext(assets);

            this.getSoundSources(playerDef, soundDefs).forEach(source => context.soundsToLoad.add(source));

            weaponDefs.forEach(weaponDef => {
                context.modelsToLoad.add(weaponDef.model);
                if (!this.config.wireframeOnly) {
                    this.getTextureSources(weaponDef, materialDefs)
                        .forEach(source => context.texturesToLoad.add(source));
                }
                this.getAnimationSources(weaponDef).forEach(animation => context.animationsToLoad.add(animation));
                this.getSoundSources(weaponDef, soundDefs).forEach(source => context.soundsToLoad.add(source));
            });

            if (!this.config.wireframeOnly) {
                this.getTextureSources(mapMeta, materialDefs).forEach(source => context.texturesToLoad.add(source));
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
                const materialFactory = new MaterialFactory(materialDefs, assets);
                const surfaceFactory = new SurfaceFactory(this.config, materialFactory);
                return new MapFactory(new AreaFactory(surfaceFactory)).create(mapDef);
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
        for (const textureName of context.texturesToLoad) {
            texturePromises.push(this.tgaLoader.loadAsync(`assets/${textureName}.tga`).then(texture => {
                console.debug(`Texture "${textureName}" is loaded`);
                context.onTextureLoad(textureName, texture);
                this.publishProgress(context);
                return texture;
            }).catch(reason => {
                console.error(`Failed to load texture "${textureName}"`, reason);
                return Promise.reject(reason);
            }));
        }
        return Promise.all(texturePromises);
    }

    private loadModels(context: LoadingContext): Promise<Md5Mesh[]> {
        const modelPromises: Promise<any>[] = [];
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
        const animationPromises: Promise<any>[] = [];
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

    private loadSounds(context: LoadingContext): Promise<any[]> {
        const soundPromises: Promise<any>[] = [];
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

    private getTextureSources(entityDef: any, materialDefs: Map<string, any>): Set<string> {
        const result = new Set<string>();
        (<string[]>entityDef.materials).forEach(materialName => {
            const materialDef = materialDefs.get(materialName);
            if (materialDef) {
                if (materialDef.diffuseMap) {
                    result.add(materialDef.diffuseMap);
                }
                if (materialDef.specularMap) {
                    result.add(materialDef.specularMap);
                }
                if (materialDef.normalMap) {
                    result.add(materialDef.normalMap);
                }
                if (materialDef.alphaMap) {
                    result.add(materialDef.alphaMap);
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
}

class LoadingContext {
    readonly texturesToLoad = new Set<string>();
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

    onModelMeshLoad(modelName: string, mesh: Md5Mesh) {
        this.assets.modelMeshes.set(modelName, mesh);
        this.loaded++;
    }

    onSoundLoad(soundName: string, sound: AudioBuffer) {
        this.assets.sounds.set(soundName, sound);
        this.loaded++;
    }
}