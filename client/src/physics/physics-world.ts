import {World} from 'cannon-es';

export class PhysicsWorld extends World {
    constructor() {
        super();
        this.gravity.set(0, -9.8, 0);
    }
}