import {Object3D, OrthographicCamera, Scene, Sprite, WebGLRenderer} from 'three';

import {Entity} from '../../entity';
import {GameConfig} from '../../../game-config';
import {isUpdatableMaterial} from '../../../material/updatable-material';
import {SpriteText} from '../../text/sprite-text';

export class Hud implements Entity {
    private readonly scene = new Scene();
    private readonly camera: OrthographicCamera;

    private readonly crosshair: Object3D[];
    private readonly ammoCounter: AmmoCounter;

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
            const material = (<any>child).material;
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
        this.ammoCounter.update(deltaTime);
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

export interface HudParameters {
    config: GameConfig;
    crosshair: Object3D[];
    ammoCounter: AmmoCounter;
}

export class AmmoCounter implements Iterable<Object3D> {
    constructor(private readonly background: Sprite[], private readonly text: SpriteText) {
    }

    setValue(value: number) {
        this.text.setText(value.toString());
    }

    update(deltaTime: number) {
        for (const backgroundElement of this.background) {
            if (isUpdatableMaterial(backgroundElement.material)) {
                backgroundElement.material.update(deltaTime);
            }
        }
        this.text.update(deltaTime);
    }

    *[Symbol.iterator](): IterableIterator<Object3D> {
        for (let i = 0; i < this.background.length; i++) {
            yield this.background[i];
        }
        yield this.text;
    }
}