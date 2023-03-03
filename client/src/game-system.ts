export interface GameSystem {
    update(deltaTime: number): void;
}

export enum GameSystemType {
    PARTICLE, DECAL
}