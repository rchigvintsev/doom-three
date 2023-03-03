import {AudioListener, Camera, Clock, PCFShadowMap, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {inject, injectable, multiInject} from 'inversify';

import {GameConfig} from './game-config';
import {MapLoader} from './map-loader';
import {ProgressEvent} from './event/progress-event';
import {FpsControls} from './control/fps-controls';
import {PointerLock} from './control/pointer-lock';
import {GameMap} from './entity/map/game-map';
import {PointerUnlockEvent} from './event/pointer-lock-events';
import {GameSystem, GameSystemType} from './game-system';
import {Hud} from './entity/hud/hud';
import {AssetLoader} from './asset-loader';
import {configureDiContainer} from './di.config';
import {TYPES} from './types';
import {GameManager} from './game-manager';

@injectable()
export class Game {
    readonly systems = new Map<GameSystemType, GameSystem>();
    readonly scene: Scene;
    readonly camera: PerspectiveCamera;
    readonly audioListener: AudioListener;

    private readonly clock = new Clock();
    private readonly controls: FpsControls;
    private readonly renderer: WebGLRenderer;
    private readonly stats: Stats;

    private map?: GameMap;
    private hud?: Hud;

    constructor(@inject(TYPES.Config) readonly config: GameConfig,
                @inject(TYPES.PointerLock) private readonly pointerLock: PointerLock,
                @multiInject(TYPES.GameManager) private readonly gameManagers: GameManager[]) {
        this.scene = this.createScene();
        this.camera = this.createCamera(this.config);
        this.audioListener = this.createAudioListener(this.camera);
        this.controls = this.createControls(this.config, this.pointerLock);
        this.renderer = this.createRenderer(this.config);
        this.stats = this.createStats(this.config);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    static load(mapName: string) {
        // Disable context menu
        window.addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault());

        showLockScreen(() => {
            const pointerLock = createPointerLock();
            pointerLock.request();

            const config = GameConfig.load();
            const assetLoader = new AssetLoader(config);
            assetLoader.addEventListener(ProgressEvent.TYPE, e => {
                const percentage = e.loaded / (e.total / 100);
                console.debug(`Load progress: ${percentage.toFixed()}%`);
            });
            assetLoader.load(mapName).then(assets => {
                const diContainer = configureDiContainer(pointerLock, config, assets);
                const game = diContainer.get<Game>(TYPES.Game);

                game.map = new MapLoader(game, diContainer).load(mapName, assets);
                console.debug(`Map "${mapName}" is loaded`);
                game.scene.add(game.map);

                game.hud = game.map.parameters.hud;

                game.controls.player = game.map.parameters.player;
                game.controls.enabled = true;

                game.start();
                console.debug('Game started');
            }).catch(reason => console.error(`Failed to load map "${mapName}"`, reason));
        });
    }

    start() {
        this.animate();
    }

    private createScene(): Scene {
        return new Scene();
    }

    private createCamera(config: GameConfig): PerspectiveCamera {
        const aspect = window.innerWidth / window.innerHeight;
        return new PerspectiveCamera(config.cameraFov, aspect, config.cameraNear, config.cameraFar);
    }

    private createAudioListener(camera: Camera): AudioListener {
        const audioListener = new AudioListener();
        camera.add(audioListener);
        return audioListener;
    }

    private createControls(config: GameConfig, pointerLock: PointerLock): FpsControls {
        const controls = new FpsControls(config, pointerLock);
        controls.init();
        return controls;
    }

    private createRenderer(config: GameConfig): WebGLRenderer {
        const renderer = new WebGLRenderer({antialias: config.antialias});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFShadowMap;
        renderer.localClippingEnabled = true;
        renderer.domElement.id = 'game_canvas';
        renderer.autoClear = false;
        getGameCanvasContainer()!.appendChild(renderer.domElement);
        return renderer;
    }

    private createStats(config: GameConfig): Stats {
        const stats = Stats();
        if (config.showStats) {
            getGameCanvasContainer()!.appendChild(stats.dom);
        }
        return stats;
    }

    private animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
        if (this.config.showStats) {
            this.stats.update();
        }
    }

    private update() {
        const deltaTime = this.clock.getDelta();
        if (this.map) {
            this.map.update(deltaTime);
        }
        for (const system of this.systems.values()) {
            system.update(deltaTime);
        }
        for (const manager of this.gameManagers) {
            manager.update(deltaTime);
        }
        this.controls.update();
        this.hud?.update(deltaTime);
    }

    private render() {
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        if (this.hud) {
            this.hud.render(this.renderer);
        }
    }

    private onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.hud?.onWindowResize();
    }
}

function createPointerLock(): PointerLock {
    const gameCanvasContainer = getRequiredGameCanvasContainer();
    const pointerLock = new PointerLock(gameCanvasContainer);
    pointerLock.init();
    pointerLock.addEventListener(PointerUnlockEvent.TYPE, () => showLockScreen(() => pointerLock.request()));
    return pointerLock;
}

function getRequiredGameCanvasContainer(): HTMLElement {
    const container = getGameCanvasContainer();
    if (!container) {
        throw new Error('Game canvas container element is not found in DOM');
    }
    return container;
}

function getGameCanvasContainer(): HTMLElement | null {
    return document.getElementById('game_canvas_container');
}

function showLockScreen(onClick?: () => void) {
    const lockScreen = document.getElementById('lock_screen');
    if (!lockScreen) {
        throw new Error('Failed to show lock screen: lock screen element is not found in DOM');
    }
    lockScreen.classList.remove('hidden');
    lockScreen.addEventListener('auxclick', () => {
        hideLockScreen();
        if (onClick) {
            onClick();
        }
    }, {once: true});
}

function hideLockScreen() {
    const lockScreen = document.getElementById('lock_screen');
    if (!lockScreen) {
        throw new Error('Failed to hide lock screen: lock screen element is not found in DOM');
    }
    lockScreen.classList.add('hidden');
}
