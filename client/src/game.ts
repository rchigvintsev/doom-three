import {PCFShadowMap, PerspectiveCamera, Renderer, Scene, WebGLRenderer} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {GameConfig} from './game-config';

// noinspection JSMethodCanBeStatic
export class Game {
    private readonly config: GameConfig;
    private readonly container: HTMLElement;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;
    private readonly renderer: Renderer;
    private readonly stats: Stats;

    constructor() {
        this.config = GameConfig.load();

        this.container = this.getRequiredGameCanvasContainer();

        this.scene = this.initScene();
        this.camera = this.initCamera(this.config);
        this.renderer = this.initRenderer(this.config, this.container);
        this.stats = this.initStats(this.config, this.container);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
        if (this.config.showStats) {
            this.stats.update();
        }
    }

    private getRequiredGameCanvasContainer(): HTMLElement {
        const container = document.getElementById('game_canvas_container');
        if (!container) {
            throw new Error('Game canvas container element is not found in DOM');
        }
        return container;
    }

    private initScene(): Scene {
        return new Scene();
    }

    private initCamera(config: GameConfig): PerspectiveCamera {
        const aspect = window.innerWidth / window.innerHeight;
        return new PerspectiveCamera(config.cameraFov, aspect, config.cameraNear, config.cameraFar);
    }

    private initRenderer(config: GameConfig, parent: HTMLElement): Renderer {
        const renderer = new WebGLRenderer({antialias: config.antialias});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFShadowMap;
        renderer.localClippingEnabled = true;
        renderer.domElement.id = 'game_canvas';
        parent.appendChild(renderer.domElement);
        return renderer;
    }

    private initStats(config: GameConfig, parent: HTMLElement): Stats {
        const stats = Stats();
        if (config.showStats) {
            parent.appendChild(stats.dom);
        }
        return stats;
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private showLockScreen() {
        const lockScreen = document.getElementById('lock_screen');
        if (!lockScreen) {
            throw new Error('Failed to show lock screen: lock screen element is not found in DOM');
        }
        lockScreen.style.display = 'block';
    }

    private hideLockScreen() {
        const lockScreen = document.getElementById('lock_screen');
        if (!lockScreen) {
            throw new Error('Failed to hide lock screen: lock screen element is not found in DOM');
        }
        lockScreen.style.display = 'none';
    }
}
