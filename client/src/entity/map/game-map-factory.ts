import {Light, Vector3} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';
import {LightFactory} from '../light/light-factory';
import {Player} from '../player/player';
import {Hud} from '../hud/hud';
import {Md5ModelFactory} from '../model/md5/md5-model-factory';
import {Monster} from '../model/md5/monster/monster';
import {GameAssets} from '../../game-assets';

export class GameMapFactory implements EntityFactory<GameMap> {
    constructor(private readonly parameters: MapFactoryParameters) {
    }

    create(mapDef: any): GameMap {
        const areas = this.createAreas(mapDef);
        const lights = this.createLights(mapDef);
        const monsters = this.createMonsters(mapDef);
        if (mapDef.player) {
            this.parameters.player.origin = new Vector3()
                .fromArray(mapDef.player.origin)
                .multiplyScalar(this.parameters.config.worldScale);
        }
        return new GameMap({player: this.parameters.player, hud: this.parameters.hud, areas, lights, monsters});
    }

    private createAreas(mapDef: any): Area[] {
        const areas = [];
        for (const areaDef of mapDef.areas) {
            areas.push(this.parameters.areaFactory.create(areaDef));
        }
        return areas;
    }

    private createLights(mapDef: any): Light[] {
        const lights = [];
        if (!this.parameters.config.renderOnlyWireframe && mapDef.lights) {
            for (const lightDef of mapDef.lights) {
                lights.push(this.parameters.lightFactory.create(lightDef));
            }
        }
        return lights;
    }

    private createMonsters(mapDef: any): Monster[] {
        const monsters = [];
        if (mapDef.monsters) {
            for (const monsterDef of mapDef.monsters) {
                const modelDef = this.parameters.assets.monsterDefs.get(monsterDef.type);
                if (!modelDef) {
                    throw new Error(`Unsupported monster type: ${monsterDef.type}`);
                }
                monsters.push(this.parameters.monsterFactory.create({...modelDef, ...monsterDef}));
            }
        }
        return monsters;
    }
}

export interface MapFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    player: Player;
    hud: Hud;
    areaFactory: AreaFactory;
    lightFactory: LightFactory;
    monsterFactory: Md5ModelFactory;
}
