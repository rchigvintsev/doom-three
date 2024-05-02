import {Light, Vector3} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';
import {LightFactory} from '../light/light-factory';
import {Monster} from '../model/md5/monster/monster';
import {MonsterFactory} from '../model/md5/monster/monster-factory';
import {TYPES} from '../../types';
import {Player} from '../player/player';
import {Game} from '../../game';

@injectable()
export class GameMapFactory implements GameEntityFactory<GameMap> {
    constructor(@inject(TYPES.AreaFactory) private readonly areaFactory: AreaFactory,
                @inject(TYPES.LightFactory) private readonly lightFactory: LightFactory,
                @inject(TYPES.MonsterFactory) private readonly monsterFactory: MonsterFactory) {
    }

    create(parameters: {mapDef: any, player: Player}): GameMap {
        const areas = this.createAreas(parameters.mapDef);
        const lights = this.createLights(parameters.mapDef);
        const monsters = this.createMonsters(parameters.mapDef);
        if (parameters.mapDef.player) {
            parameters.player.origin = new Vector3()
                .fromArray(parameters.mapDef.player.origin)
                .multiplyScalar(Game.getContext().config.worldScale);
        }
        return new GameMap({player: parameters.player, areas, lights, monsters});
    }

    private createAreas(mapDef: any): Area[] {
        const areas = [];
        for (const areaDef of mapDef.areas) {
            areas.push(this.areaFactory.create(areaDef));
        }
        return areas;
    }

    private createLights(mapDef: any): Light[] {
        const lights = [];
        if (!Game.getContext().config.renderOnlyWireframe && mapDef.lights) {
            for (const lightDef of mapDef.lights) {
                lights.push(this.lightFactory.create(lightDef));
            }
        }
        return lights;
    }

    private createMonsters(mapDef: any): Monster[] {
        const monsters = [];
        if (mapDef.monsters) {
            for (const monsterDef of mapDef.monsters) {
                const modelDef = Game.getContext().assets.monsterDefs.get(monsterDef.type);
                if (!modelDef) {
                    throw new Error(`Unsupported monster type: ${monsterDef.type}`);
                }
                monsters.push(this.monsterFactory.create({...modelDef, ...monsterDef}));
            }
        }
        return monsters;
    }
}
