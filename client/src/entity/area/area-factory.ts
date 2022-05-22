import {EntityFactory} from '../entity-factory';
import {Area} from './area';
import {SurfaceFactory} from '../surface/surface-factory';
import {Surface} from '../surface/surface';

export class AreaFactory implements EntityFactory<Area> {
    constructor(private readonly surfaceFactory: SurfaceFactory) {
    }

    create(areaDef: any): Area {
        const surfaces: Surface[] = [];
        for (const surfaceDef of areaDef.surfaces) {
            surfaces.push(this.surfaceFactory.create(surfaceDef));
        }
        return new Area(surfaces);
    }
}