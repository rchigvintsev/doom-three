import {AudioLoader, EventDispatcher, FileLoader, Mesh, Texture} from 'three';

import {GameAssets} from './game-assets';
import {GameConfig} from './game-config';
import {Md5Animation} from './animation/md5-animation';
import {TgaLoader} from './loader/tga-loader';
import {TgaImages} from './util/tga-images';
import {ProgressEvent} from './event/progress-event';
import {Md5MeshLoader} from './loader/md5-mesh-loader';
import {Md5AnimationLoader} from './loader/md5-animation-loader';
import {Lwo2MeshLoader} from './loader/lwo2-mesh-loader';

export class AssetLoader extends EventDispatcher<ProgressEvent> {
    private readonly jsonLoader = new FileLoader();
    private readonly binaryFileLoader: FileLoader;
    private readonly tgaLoader = new TgaLoader();
    private readonly md5MeshLoader = new Md5MeshLoader();
    private readonly md5AnimationLoader = new Md5AnimationLoader();
    private readonly lwoMeshLoader = new Lwo2MeshLoader();
    private readonly soundLoader = new AudioLoader();

    constructor(private readonly config: GameConfig) {
        super();
        this.binaryFileLoader = new FileLoader();
        this.binaryFileLoader.setResponseType('arraybuffer');
    }

    load(mapName: string): Promise<GameAssets> {
        console.debug(`Loading of assets for map "${mapName}"...`);
        const assets = new GameAssets();

        return Promise.all([
            this.loadMapMeta(assets, mapName),
            this.loadMapDef(assets, mapName),
            this.loadMaterialDefs(assets),
            this.loadTableDefs(assets),
            this.loadParticleDefs(assets),
            this.loadSoundDefs(assets),
            this.loadPlayerDef(assets),
            this.loadHudDef(assets),
            this.loadWeaponDefs(assets),
            this.loadDebrisDefs(assets),
            this.loadFontDefs(assets)
        ]).then(() => {
            const context = new LoadingContext(assets);

            this.handleMapMeta(context, assets);
            this.handlePlayerDef(context, assets);
            this.handleHudDef(context, assets);
            this.handleWeaponDefs(context, assets);
            this.handleDebrisDefs(context, assets);
            this.handleFontDefs(context, assets);

            console.debug(`A total of ${context.total} assets need to be loaded for map "${mapName}"`);

            return Promise.all([
                this.loadTextures(context),
                this.loadModels(context),
                this.loadAnimations(context),
                this.loadSounds(context)
            ]).then(() => assets);
        });
    }

    private loadMapMeta(assets: GameAssets, mapName: string): Promise<any> {
        return this.loadJson(`assets/maps/${mapName}.meta.json`).then(mapMeta => {
            assets.mapMeta = mapMeta;
            return mapMeta;
        });
    }

    private loadMapDef(assets: GameAssets, mapName: string): Promise<any> {
        return this.loadJson(`assets/maps/${mapName}.json`).then(mapDef => {
            assets.mapDef = mapDef;
            return mapDef;
        });
    }

    private loadMaterialDefs(assets: GameAssets): Promise<Map<string, any>> {
        return this.loadJson('assets/materials.json').then((materialDefs: any[]) => {
            materialDefs.forEach(materialDef => assets.materialDefs.set(materialDef.name, materialDef));
            return assets.materialDefs;
        });
    }

    private loadTableDefs(assets: GameAssets): Promise<Map<string, any>> {
        return this.loadJson('assets/tables.json').then((tableDefs: any[]) => {
            tableDefs.forEach(tableDef => assets.tableDefs.set(tableDef.name, tableDef));
            return assets.tableDefs;
        });
    }

    private loadParticleDefs(assets: GameAssets): Promise<Map<string, any>> {
        return this.loadJson('assets/particles.json').then((particleDefs: any[]) => {
            particleDefs.forEach(particleDef => assets.particleDefs.set(particleDef.name, particleDef));
            return assets.particleDefs;
        });
    }

    private loadSoundDefs(assets: GameAssets): Promise<Map<string, any>> {
        return this.loadJson('assets/sounds.json').then((soundDefs: any[]) => {
            soundDefs.forEach(soundDef => assets.soundDefs.set(soundDef.name, soundDef));
            return assets.soundDefs;
        });
    }

    private loadPlayerDef(assets: GameAssets): Promise<any> {
        return this.loadJson('assets/player.json').then(playerDef => {
            assets.playerDef = playerDef;
            return playerDef;
        });
    }

    private loadHudDef(assets: GameAssets): Promise<any> {
        return this.loadJson('assets/hud.json').then(hudDef => {
            assets.hudDef = hudDef;
            return hudDef;
        });
    }

    private loadWeaponDefs(assets: GameAssets): Promise<Map<string, any>> {
        return this.loadJson('assets/weapons.json').then((weaponDefs: any[]) => {
            weaponDefs.forEach(weaponDef => assets.weaponDefs.set(weaponDef.name, weaponDef));
            return assets.weaponDefs;
        });
    }

    private loadDebrisDefs(assets: GameAssets): Promise<Map<string, any>> {
        return this.loadJson('assets/debris.json').then((debrisDefs: any[]) => {
            debrisDefs.forEach(debrisDef => assets.debrisDefs.set(debrisDef.name, debrisDef));
            return assets.debrisDefs;
        });
    }

    private loadFontDefs(assets: GameAssets) : Promise<Map<string, any>> {
        return this.loadJson('assets/fonts.json').then((fontDefs: any[]) => {
            fontDefs.forEach(fontDef => assets.fontDefs.set(`${fontDef.name}__${fontDef.size}`, fontDef));
            return assets.fontDefs;
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

    private handleMapMeta(context: LoadingContext, assets: GameAssets) {
        if (!this.config.renderOnlyWireframe) {
            this.collectTextureSources(context, assets, assets.mapMeta.materials);
        }
        this.collectModelSources(context, assets.mapMeta);
        this.collectAnimationSources(context, assets.mapMeta);
        this.collectSoundSources(context, assets, assets.mapMeta);
    }

    private handlePlayerDef(context: LoadingContext, assets: GameAssets) {
        this.collectSoundSources(context, assets, assets.playerDef);
    }

    private handleHudDef(context: LoadingContext, assets: GameAssets) {
        const hudMaterials = [];
        for (const child of assets.hudDef.crosshair) {
            if (child.material) {
                hudMaterials.push(child.material);
            }
        }
        for (const child of assets.hudDef.ammoIndicator.background) {
            if (child.material) {
                hudMaterials.push(child.material);
            }
        }
        for (const child of assets.hudDef.weaponIndicator) {
            if (child.material) {
                hudMaterials.push(child.material);
            }
        }
        this.collectTextureSources(context, assets, hudMaterials);
    }

    private handleWeaponDefs(context: LoadingContext, assets: GameAssets) {
        assets.weaponDefs.forEach(weaponDef => {
            context.modelsToLoad.add(weaponDef.model);
            if (!this.config.renderOnlyWireframe) {
                const materials = [...weaponDef.materials];
                if (weaponDef.muzzleSmoke) {
                    const particleDef = assets.particleDefs.get(weaponDef.muzzleSmoke);
                    if (!particleDef) {
                        console.error(`Definition of particle "${weaponDef.muzzleSmoke}" is not found`);
                    } else {
                        materials.push(particleDef.material);
                    }
                }
                this.collectTextureSources(context, assets, materials);
            }
            this.collectAnimationSources(context, weaponDef);
            this.collectSoundSources(context, assets, weaponDef);
        });
    }

    private handleDebrisDefs(context: LoadingContext, assets: GameAssets) {
        assets.debrisDefs.forEach(debrisDef => {
            context.modelsToLoad.add(debrisDef.model);
            if (!this.config.renderOnlyWireframe) {
                this.collectTextureSources(context, assets, debrisDef.materials);
            }
            this.collectSoundSources(context, assets, debrisDef);
        });
    }

    private handleFontDefs(context: LoadingContext, assets: GameAssets) {
        assets.fontDefs.forEach(fontDef => {
            Object.keys(fontDef.characters).forEach(char => {
                const charDef = fontDef.characters[char];
                const source = new TextureSource(charDef.material.diffuseMap, this.tgaLoader, this.binaryFileLoader);
                context.texturesToLoad.set(source.name, source);
            });
        });
    }

    private collectTextureSources(context: LoadingContext, assets: GameAssets, materials: string[]) {
        materials.forEach(materialName => {
            const materialDef = assets.materialDefs.get(materialName);
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

    private collectSoundSources(context: LoadingContext, assets: GameAssets, entityDef: any) {
        if (entityDef.sounds) {
            Object.keys(entityDef.sounds).forEach(key => {
                const soundName = entityDef.sounds[key];
                const soundDef = assets.soundDefs.get(soundName);
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
