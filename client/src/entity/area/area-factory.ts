import {Light} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {Area} from './area';
import {SurfaceFactory} from '../surface/surface-factory';
import {Surface} from '../surface/surface';
import {LightFactory} from '../light/light-factory';
import {TYPES} from '../../types';
import {Game} from '../../game';

@injectable()
export class AreaFactory implements GameEntityFactory<Area> {
    constructor(@inject(TYPES.SurfaceFactory) private readonly surfaceFactory: SurfaceFactory,
                @inject(TYPES.LightFactory) private readonly lightFactory: LightFactory) {
    }

    create(areaDef: any): Area {
        const surfaces: Surface[] = [];
        const lights: Light[] = [];
        for (const surfaceDef of areaDef.surfaces) {
            surfaces.push(this.surfaceFactory.create(surfaceDef));
        }
        if (!Game.getContext().config.renderOnlyWireframe && areaDef.lights) {
            for (const lightDef of areaDef.lights) {
                lights.push(this.lightFactory.create(lightDef));
            }
        }
        return new Area(surfaces, lights);
    }
}
