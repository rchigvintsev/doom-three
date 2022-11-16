export interface Entity {
    init(): void;

    update(deltaTime: number): void;
}
