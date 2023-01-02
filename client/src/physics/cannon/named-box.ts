import {Box, Vec3} from 'cannon-es';

import {NamedShape} from './named-shape';

export class NamedBox extends Box implements NamedShape {
    readonly namedShape = true;

    constructor(halfExtents: Vec3, readonly name: string | undefined) {
        super(halfExtents);
    }
}