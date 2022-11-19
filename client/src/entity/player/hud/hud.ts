import {OrthographicCamera, Scene, Sprite, WebGLRenderer} from 'three';

import {Entity} from '../../entity';
import {GameConfig} from '../../../game-config';
import {isUpdatableMaterial} from '../../../material/updatable-material';

export class Hud implements Entity {
    private readonly scene = new Scene();
    private readonly camera: OrthographicCamera;

    private readonly crosshair: Sprite[];
    private readonly ammoCounter: Sprite[];

    constructor(private readonly parameters: HudParameters) {
        this.camera = this.createCamera(this.parameters.config);

        this.crosshair = this.parameters.crosshair;
        for (const child of this.crosshair) {
            this.scene.add(child);
        }

        this.ammoCounter = this.parameters.ammoCounter;
        for (const child of this.ammoCounter) {
            this.scene.add(child);
        }
    }

    init() {
        // Do nothing
    }

    update(deltaTime: number) {
        for (const child of this.crosshair) {
            if (isUpdatableMaterial(child.material)) {
                child.material.update(deltaTime);
            }
        }

        for (const child of this.ammoCounter) {
            if (isUpdatableMaterial(child.material)) {
                child.material.update(deltaTime);
            }
        }
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
    ammoCounter!: Sprite[];
}