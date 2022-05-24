import {Light} from 'three';

import {EntityFactory} from '../entity-factory';
import {Area} from './area';
import {SurfaceFactory} from '../surface/surface-factory';
import {Surface} from '../surface/surface';
import {LightFactory} from '../light/light-factory';
import {GameConfig} from '../../game-config';

export class AreaFactory implements EntityFactory<Area> {
    constructor(private readonly config: GameConfig,
                private readonly surfaceFactory: SurfaceFactory,
                private readonly lightFactory: LightFactory) {
    }

    create(areaDef: any): Area {
        const surfaces: Surface[] = [];
        const lights: Light[] = [];
        for (const surfaceDef of areaDef.surfaces) {
            surfaces.push(this.surfaceFactory.create(surfaceDef));
        }
        if (!this.config.renderOnlyWireframe && areaDef.lights) {
            for (const lightDef of areaDef.lights) {
                lights.push(this.lightFactory.create(lightDef));
            }
        }
        return new Area(surfaces, lights);
    }
}