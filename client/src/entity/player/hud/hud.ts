import {OrthographicCamera, Scene, Sprite, WebGLRenderer} from 'three';

import {Entity} from '../../entity';
import {GameConfig} from '../../../game-config';

export class Hud implements Entity {
    private readonly scene = new Scene();
    private readonly camera: OrthographicCamera;

    constructor(private readonly parameters: HudParameters) {
        this.camera = this.createCamera(this.parameters.config);
        const crosshair = this.parameters.crosshair;
        for (const child of crosshair) {
            this.scene.add(child);
        }
    }

    init() {
        // Do nothing
    }

    update(_deltaTime: number) {
        // Do nothing
    }

    render(renderer: WebGLRenderer) {
        renderer.clearDepth();
        renderer.render(this.scene, this.camera);
    }

    private createCamera(_config: GameConfig): OrthographicCamera {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -500, 1000);
    }
}

export class HudParameters {
    config!: GameConfig;
    crosshair!: Sprite[];
}