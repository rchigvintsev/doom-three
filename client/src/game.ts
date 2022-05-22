import {PCFShadowMap, PerspectiveCamera, Renderer, Scene, WebGLRenderer} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {GameConfig} from './game-config';
import {MapLoader} from './map-loader';
import {ProgressEvent} from './event/progress-event';
import {FpsControls} from './control/fps-controls';
import {Player} from './entity/player';
import {PointerLock} from './control/pointer-lock';

// noinspection JSMethodCanBeStatic
export class Game {
    private readonly config: GameConfig;
    private readonly container: HTMLElement;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;
    private readonly pointerLock: PointerLock;
    private readonly controls: FpsControls;
    private readonly renderer: Renderer;
    private readonly stats: Stats;

    constructor() {
        this.config = GameConfig.load();

        this.container = this.getRequiredGameCanvasContainer();

        this.scene = this.createScene();
        this.camera = this.createCamera(this.config);

        const player = new Player(this.camera);
        this.scene.add(player);

        this.pointerLock = this.createPointerLock(this.container);
        this.controls = this.createControls(this.config, player, this.pointerLock);
        this.renderer = this.createRenderer(this.config, this.container);
        this.stats = this.createStats(this.config, this.container);
    }

    init() {
        window.addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault()); // Disable context menu
        window.addEventListener('resize', () => this.onWindowResize());
    }

    static load(mapName: string): Game {
        const game = new Game();
        game.init();
        game.animate();

        const mapLoader = new MapLoader(game.config);
        mapLoader.addEventListener(ProgressEvent.TYPE, e => game.onProgress(e));
        mapLoader.load(mapName).then(map => {
            console.debug(`Map "${mapName}" is loaded`);

            game.scene.add(map);
            game.controls.init();

            Game.showLockScreen(() => {
                game.pointerLock.request();
                console.debug('Game started');
            });
        }).catch(reason => console.error(`Failed to load map "${mapName}"`, reason));
        return game;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
        if (this.config.showStats) {
            this.stats.update();
        }
    }

    private update() {
        this.controls.update();
    }

    private getRequiredGameCanvasContainer(): HTMLElement {
        const container = document.getElementById('game_canvas_container');
        if (!container) {
            throw new Error('Game canvas container element is not found in DOM');
        }
        return container;
    }

    private createScene(): Scene {
        return new Scene();
    }

    private createCamera(config: GameConfig): PerspectiveCamera {
        const aspect = window.innerWidth / window.innerHeight;
        return new PerspectiveCamera(config.cameraFov, aspect, config.cameraNear, config.cameraFar);
    }

    private createPointerLock(target: HTMLElement): PointerLock {
        return new PointerLock(target);
    }

    private createControls(config: GameConfig, player: Player, pointerLock: PointerLock): FpsControls {
        return new FpsControls(config, player, pointerLock);
    }

    private createRenderer(config: GameConfig, parent: HTMLElement): Renderer {
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

    private createStats(config: GameConfig, parent: HTMLElement): Stats {
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

    private onProgress(e: ProgressEvent) {
        const percentage = e.loaded / (e.total / 100);
        console.debug(`Load progress: ${percentage.toFixed()}%`);
    }

    private static showLockScreen(onClick?: () => void) {
        const lockScreen = document.getElementById('lock_screen');
        if (!lockScreen) {
            throw new Error('Failed to show lock screen: lock screen element is not found in DOM');
        }
        lockScreen.classList.remove('hidden');
        if (onClick) {
            lockScreen.addEventListener('auxclick', () => {
                Game.hideLockScreen();
                onClick();
            });
        }
    }

    private static hideLockScreen() {
        const lockScreen = document.getElementById('lock_screen');
        if (!lockScreen) {
            throw new Error('Failed to hide lock screen: lock screen element is not found in DOM');
        }
        lockScreen.classList.add('hidden');
    }
}
