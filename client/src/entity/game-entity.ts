export interface GameEntity {
    init(): void;

    update(deltaTime: number): void;
}
