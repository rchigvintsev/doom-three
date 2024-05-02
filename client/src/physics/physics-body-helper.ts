import {Group} from 'three';
import {PhysicsBody} from './physics-body';

export class PhysicsBodyHelper extends Group {
    constructor(public body: PhysicsBody) {
        super();
        if (body.name) {
            this.name = body.name;
        }
    }
}