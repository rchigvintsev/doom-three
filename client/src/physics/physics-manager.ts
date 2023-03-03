import {GameManager} from '../game-manager';

export interface PhysicsManager extends GameManager {
    get materials(): Map<string, any>

    addBody(body: any): void;
    removeBody(body: any): void;
}

export function isPhysicsManager(manager: any): manager is PhysicsManager {
    return manager && manager.physicsManager;
}
