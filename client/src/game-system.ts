export interface GameSystem {
    update(deltaTime: number): void;
}

export enum GameSystemType {
    ANIMATION, PHYSICS, PARTICLE
}