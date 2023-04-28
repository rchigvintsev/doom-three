import {GameManager} from '../game-manager';

export interface PhysicsManager extends GameManager {
    get materials(): Map<string, any>

    addBody(body: any): void;

    removeBody(body: any): void;

    addConstraint(constraint: any): void;

    removeConstraint(constraint: any): void;
}
