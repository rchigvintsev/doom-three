import {Light, Vector3} from 'three';

import {EntityFactory} from '../entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';
import {LightFactory} from '../light/light-factory';
import {GameConfig} from '../../game-config';
import {Player} from '../player/player';

export class MapFactory implements EntityFactory<GameMap> {
    constructor(private readonly config: GameConfig,
                private readonly player: Player,
                private readonly areaFactory: AreaFactory,
                private readonly lightFactory: LightFactory) {
    }

    create(mapDef: any): GameMap {
        const areas: Area[] = [];
        const lights: Light[] = [];
        for (const areaDef of mapDef.areas) {
            areas.push(this.areaFactory.create(areaDef));
        }
        if (!this.config.renderOnlyWireframe && mapDef.lights) {
            for (const lightDef of mapDef.lights) {
                lights.push(this.lightFactory.create(lightDef));
            }
        }
        if (mapDef.player) {
            this.player.origin = new Vector3().fromArray(mapDef.player.origin).multiplyScalar(this.config.worldScale);
        }
        return new GameMap(this.player, areas, lights);
    }
}