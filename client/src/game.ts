import {AudioListener, Clock, PCFShadowMap, PerspectiveCamera, Scene, WebGLRenderer} from 'three';

import Stats from 'three/examples/jsm/libs/stats.module';

import {injectable} from 'inversify';

import {GameConfig} from './game-config';
import {GameLoader} from './game-loader';
import {ProgressEvent} from './event/progress-event';
import {FpsControls} from './control/fps-controls';
import {PointerLock} from './control/pointer-lock';
import {GameMap} from './entity/map/game-map';
import {PointerUnlockEvent} from './event/pointer-lock-events';
import {Hud} from './entity/hud/hud';
import {AssetLoader} from './asset-loader';
import {configureDiContainer} from './di.config';
import {TYPES} from './types';
import {GameManager} from './game-manager';
import {Player} from './entity/player/player';
import {GameContext} from './game-context';
import {GameAssets} from './game-assets';

@injectable()
export class Game {
    private static context: GameContext;

    private readonly clock = new Clock();
    private readonly controls: FpsControls;
    private readonly stats: Stats;

    private map?: GameMap;
    private player?: Player;
    private hud?: Hud;

    constructor(pointerLock: PointerLock,
                config: GameConfig,
                assets: GameAssets,
                private readonly gameLoader: GameLoader,
                private readonly gameManagers: GameManager[]) {
        const camera = this.createCamera(config);
        const scene = this.createScene();
        const renderer = this.createRenderer(config);
        const audioListener = this.createAudioListener();
        camera.add(audioListener);

        this.controls = this.createControls(config, pointerLock);
        this.stats = this.createStats(config);

        window.addEventListener('resize', () => this.onWindowResize());

        Game.context = new GameContext(config, assets, camera, scene, renderer);
    }

    static getContext(): GameContext {
        return Game.context;
    }

    static loadGame(mapName: string) {
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
                game.load();
                game.start();
                console.debug('Game started');
            }).catch(reason => console.error(`Failed to load map "${mapName}"`, reason));
        });
    }

    private createCamera(config: GameConfig): PerspectiveCamera {
        const aspect = window.innerWidth / window.innerHeight;
        return new PerspectiveCamera(config.cameraFov, aspect, config.cameraNear, config.cameraFar);
    }

    private createScene(): Scene {
        return new Scene();
    }

    private createAudioListener(): AudioListener {
        return new AudioListener();
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

    private load() {
        const {map, player, hud} = this.gameLoader.load();

        this.map = map;
        Game.context.scene.add(map);

        this.player = player;
        this.controls.player = player;
        this.controls.enabled = true;

        this.hud = hud;
    }

    private start() {
        this.animate();
    }

    private animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
        if (Game.context.config.showStats) {
            this.stats.update();
        }
    }

    private update() {
        const deltaTime = this.clock.getDelta();
        for (const manager of this.gameManagers) {
            manager.update(deltaTime);
        }
        this.controls.update();
        this.map?.update(deltaTime);
        this.player?.update(deltaTime);
        this.hud?.update(deltaTime);
    }

    private render() {
        const context = Game.context;
        context.renderer.clear();
        context.renderer.render(context.scene, context.camera);
        if (this.hud) {
            this.hud.render();
        }
    }

    private onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const context = Game.context;

        context.camera.aspect = width / height;
        context.camera.updateProjectionMatrix();

        context.renderer.setSize(width, height);
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
