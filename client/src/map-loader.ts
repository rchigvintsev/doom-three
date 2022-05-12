import {AudioLoader, FileLoader, Texture} from 'three';

import {GameConfig} from './game-config';
import {TgaLoader} from './loader/tga-loader';

export class MapLoader {
    private textFileLoader: FileLoader;
    private binaryFileLoader: FileLoader;
    private soundLoader: AudioLoader;
    private animationLoader: FileLoader;
    private tgaLoader: TgaLoader;

    constructor(private config: GameConfig) {
        this.textFileLoader = new FileLoader();
        this.binaryFileLoader = new FileLoader();
        this.binaryFileLoader.setResponseType('arraybuffer');
        this.soundLoader = new AudioLoader();
        this.animationLoader = new FileLoader();
        this.tgaLoader = new TgaLoader();
    }

    load(mapName: string): Promise<void> {
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
            // const mapDef = result[1];
            const materialDefs = result[2];
            const soundDefs = result[3];
            const playerDef = result[4];
            const weaponDefs = result[5];

            const modelsToLoad = new Set<string>();
            const texturesToLoad = new Set<string>();
            const animationsToLoad = new Set<string>();
            const soundsToLoad = new Set<string>();

            this.getSoundSources(playerDef, soundDefs).forEach(source => soundsToLoad.add(source));

            weaponDefs.forEach(weaponDef => {
                modelsToLoad.add(weaponDef.model);
                if (!this.config.wireframeOnly) {
                    this.getTextureSources(weaponDef, materialDefs).forEach(source => texturesToLoad.add(source));
                }
                this.getAnimationSources(weaponDef).forEach(animation => animationsToLoad.add(animation));
                this.getSoundSources(weaponDef, soundDefs).forEach(source => soundsToLoad.add(source));
            });

            if (!this.config.wireframeOnly) {
                this.getTextureSources(mapMeta, materialDefs).forEach(source => texturesToLoad.add(source));
            }
            this.getModelSources(mapMeta).forEach(source => modelsToLoad.add(source));
            this.getAnimationSources(mapMeta).forEach(source => animationsToLoad.add(source));
            this.getSoundSources(mapMeta, soundDefs).forEach(source => soundsToLoad.add(source));

            const totalNumberOfAssetsToLoad = modelsToLoad.size + texturesToLoad.size + animationsToLoad.size
                + soundsToLoad.size;
            console.debug(`A total of ${totalNumberOfAssetsToLoad} assets need to be loaded for map "${mapName}"`);

            return this.loadTextures(texturesToLoad).then();
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
        return this.textFileLoader.loadAsync(url)
            .then(response => JSON.parse(<string>response))
            .catch(reason => console.error(`Failed to load JSON file "${url}"`, reason));
    }

    private loadTextures(texturesToLoad: Set<string>): Promise<Texture[]> {
        const texturePromises: Promise<any>[] = [];
        for (const textureName of texturesToLoad) {
            texturePromises.push(this.tgaLoader.loadAsync(`assets/${textureName}.tga`).then(response => {
                console.debug(`Texture "${textureName}" is loaded`);
                return response;
            }).catch(reason => console.error(`Failed to load texture ${textureName}`, reason)));
        }
        return Promise.all(texturePromises);
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
}