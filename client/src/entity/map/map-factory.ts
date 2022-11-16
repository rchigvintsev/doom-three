import {Light, Vector3} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';
import {LightFactory} from '../light/light-factory';
import {Player} from '../player/player';
import {Hud} from '../player/hud/hud';

export class MapFactory implements EntityFactory<GameMap> {
    constructor(private readonly parameters: MapFactoryParameters) {
    }

    create(mapDef: any): GameMap {
        const areas: Area[] = [];
        const lights: Light[] = [];
        for (const areaDef of mapDef.areas) {
            areas.push(this.parameters.areaFactory.create(areaDef));
        }
        if (!this.parameters.config.renderOnlyWireframe && mapDef.lights) {
            for (const lightDef of mapDef.lights) {
                lights.push(this.parameters.lightFactory.create(lightDef));
            }
        }
        if (mapDef.player) {
            this.parameters.player.origin = new Vector3()
                .fromArray(mapDef.player.origin)
                .multiplyScalar(this.parameters.config.worldScale);
        }
        return new GameMap(this.parameters.player, this.parameters.hud, areas, lights);
    }
}

export class MapFactoryParameters extends EntityFactoryParameters {
    player!: Player;
    hud!: Hud;
    areaFactory!: AreaFactory;
    lightFactory!: LightFactory;
}
