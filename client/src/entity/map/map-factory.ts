import {Light} from 'three';

import {EntityFactory} from '../entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';
import {LightFactory} from '../light/light-factory';

export class MapFactory implements EntityFactory<GameMap> {
    constructor(private readonly areaFactory: AreaFactory, private readonly lightFactory: LightFactory) {
    }

    create(mapDef: any): GameMap {
        const areas: Area[] = [];
        const lights: Light[] = [];
        for (const areaDef of mapDef.areas) {
            areas.push(this.areaFactory.create(areaDef));
        }
        if (mapDef.lights) {
            for (const lightDef of mapDef.lights) {
                lights.push(this.lightFactory.create(lightDef));
            }
        }
        return new GameMap(areas, lights);
    }
}