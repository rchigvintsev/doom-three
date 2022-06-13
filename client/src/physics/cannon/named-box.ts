import {Box, Vec3} from 'cannon-es';

import {NamedShape} from './named-shape';

export class NamedBox extends Box implements NamedShape {
    constructor(halfExtents: Vec3, readonly name: string | undefined) {
        super(halfExtents);
    }
}