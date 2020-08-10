import {SlidingDoor} from './sliding-door.js';
import {GameWorld} from '../../game-world.js';

export class ElevatorDoor extends SlidingDoor {
    constructor(options = {}) {
        if (!options.moveSpeed) {
            options.moveSpeed = 40 * GameWorld.WORLD_SCALE;
        }
        super(options);
    }

    close() {
        return true;
    }
}
