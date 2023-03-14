import {Event} from 'three';

import {PhysicsBody} from '../physics/physics-body';
import {PhysicsContact} from '../physics/physics-contact';

export class CollideEvent implements Event {
    static readonly TYPE = 'collide';

    constructor(readonly body: PhysicsBody, readonly contact: PhysicsContact, readonly target?: any) {
    }

    get type(): string {
        return CollideEvent.TYPE;
    }
}
