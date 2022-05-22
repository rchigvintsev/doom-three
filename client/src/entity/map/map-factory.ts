import {EntityFactory} from '../entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';

export class MapFactory implements EntityFactory<GameMap> {
    constructor(private readonly areaFactory: AreaFactory) {
    }

    create(mapDef: any): GameMap {
        const mapAreas: Area[] = [];
        for (const areaDef of mapDef.areas) {
            mapAreas.push(this.areaFactory.create(areaDef));
        }
        return new GameMap(mapAreas);
    }
}