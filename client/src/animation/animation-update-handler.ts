export interface AnimationUpdateHandler {
    handle(deltaTime: number): void;
}