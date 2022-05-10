import {AudioLoader, FileLoader} from 'three';
import {TGALoader} from 'three/examples/jsm/loaders/TGALoader';

import {GameConfig} from './game-config';

export class MapLoader {
    private textFileLoader: FileLoader;
    private binaryFileLoader: FileLoader;
    private soundLoader: AudioLoader;
    private animationLoader: FileLoader;
    private tgaLoader: TGALoader;

    constructor(private config: GameConfig) {
        this.textFileLoader = new FileLoader();
        this.binaryFileLoader = new FileLoader();
        this.binaryFileLoader.setResponseType('arraybuffer');
        this.soundLoader = new AudioLoader();
        this.animationLoader = new FileLoader();
        this.tgaLoader = new TGALoader();
    }

    load(mapName: string): Promise<void> {
        console.debug(`Loading of map "${mapName}"...`);

        return Promise.all([
            this.loadMaterialDefs(),
            this.loadSoundDefs(),
            this.loadPlayerDef(),
            this.loadWeaponDefs()
        ]).then(result => {
            const materialDefs = result[0];
            const soundDefs = result[1];
            const playerDef = result[2];
            const weaponDefs = result[3];

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

                (<string[]>weaponDef.animations).forEach(animation => animationsToLoad.add(animation));
                this.getSoundSources(weaponDef, soundDefs).forEach(source => soundsToLoad.add(source));
            });
        });
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
        return new Promise((resolve, reject) => {
            this.textFileLoader.load(url, response => {
                resolve(JSON.parse(<string>response));
            }, undefined, event => {
                console.error(`Failed to load JSON file "${url}"`, event);
                reject(event);
            });
        });
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

    private getSoundSources(entityDef: any, soundDefs: Map<string, any>): Set<string> {
        const result = new Set<string>();
        Object.keys(entityDef.sounds).forEach(key => {
            const soundName = entityDef.sounds[key];
            const soundDef = soundDefs.get(soundName);
            if (soundDef) {
                soundDef.sources.forEach((source: string) => result.add(source));
            } else {
                console.error(`Definition of sound "${soundName}" is not found`);
            }
        });
        return result;
    }
}