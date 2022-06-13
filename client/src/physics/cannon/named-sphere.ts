import {Sphere} from 'cannon-es';

import {NamedShape} from './named-shape';

export class NamedSphere extends Sphere implements NamedShape {
    constructor(radius: number, readonly name: string | undefined) {
        super(radius);
    }
}