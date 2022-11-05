import {Light} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {Area} from './area';
import {SurfaceFactory} from '../surface/surface-factory';
import {Surface} from '../surface/surface';
import {LightFactory} from '../light/light-factory';
import {GameConfig} from '../../game-config';

export class AreaFactory implements EntityFactory<Area> {
    constructor(private readonly parameters: AreaFactoryParameters) {
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

    private get config(): GameConfig {
        return this.parameters.config;
    }

    private get surfaceFactory(): SurfaceFactory {
        return this.parameters.surfaceFactory;
    }

    private get lightFactory(): LightFactory {
        return this.parameters.lightFactory;
    }
}

export class AreaFactoryParameters extends EntityFactoryParameters {
    surfaceFactory!: SurfaceFactory;
    lightFactory!: LightFactory;
}