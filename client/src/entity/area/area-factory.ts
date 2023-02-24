import {Light} from 'three';

import {GameEntityFactory, GameEntityFactoryParameters} from '../game-entity-factory';
import {Area} from './area';
import {SurfaceFactory} from '../surface/surface-factory';
import {Surface} from '../surface/surface';
import {LightFactory} from '../light/light-factory';

export class AreaFactory implements GameEntityFactory<Area> {
    constructor(private readonly parameters: AreaFactoryParameters) {
    }

    create(areaDef: any): Area {
        const surfaces: Surface[] = [];
        const lights: Light[] = [];
        for (const surfaceDef of areaDef.surfaces) {
            surfaces.push(this.parameters.surfaceFactory.create(surfaceDef));
        }
        if (!this.parameters.config.renderOnlyWireframe && areaDef.lights) {
            for (const lightDef of areaDef.lights) {
                lights.push(this.parameters.lightFactory.create(lightDef));
            }
        }
        return new Area(surfaces, lights);
    }
}

export interface AreaFactoryParameters extends GameEntityFactoryParameters {
    surfaceFactory: SurfaceFactory;
    lightFactory: LightFactory;
}