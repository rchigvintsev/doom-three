import {Light, Vector3} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {GameMap} from './game-map';
import {Area} from '../area/area';
import {AreaFactory} from '../area/area-factory';
import {LightFactory} from '../light/light-factory';
import {GameConfig} from '../../game-config';
import {Player} from '../player/player';

export class MapFactory implements EntityFactory<GameMap> {
    constructor(private readonly parameters: MapFactoryParameters) {
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

    private get config(): GameConfig {
        return this.parameters.config;
    }

    private get player(): Player {
        return this.parameters.player;
    }

    private get areaFactory(): AreaFactory {
        return this.parameters.areaFactory;
    }

    private get lightFactory(): LightFactory {
        return this.parameters.lightFactory;
    }
}

export class MapFactoryParameters extends EntityFactoryParameters {
    player!: Player;
    areaFactory!: AreaFactory;
    lightFactory!: LightFactory;
}