import {AudioListener, Clock, PCFShadowMap, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {GameConfig} from './game-config';
import {MapLoader} from './map-loader';
import {ProgressEvent} from './event/progress-event';
import {FpsControls} from './control/fps-controls';
import {Player} from './entity/player';
import {PointerLock} from './control/pointer-lock';
import {GameMap} from './entity/map/game-map';

// noinspection JSMethodCanBeStatic
export class Game {
    private readonly clock = new Clock();

    private config!: GameConfig;
    private container!: HTMLElement;
    private scene!: Scene;
    private camera!: PerspectiveCamera;
    private audioListener!: AudioListener;
    private player!: Player;
    private pointerLock!: PointerLock;
    private controls!: FpsControls;
    private renderer!: WebGLRenderer;
    private stats!: Stats;

    private _map?: GameMap;

    private initialized = false;

    init() {
        if (!this.initialized) {
            this.config = GameConfig.load();

            this.container = this.getRequiredGameCanvasContainer();

            this.initScene();
            this.initCamera(this.config);
            this.initAudioListener(this.camera);
            this.initPlayer(this.camera);
            this.initPointerLock(this.container);
            this.initControls(this.config, this.player, this.pointerLock);
            this.initRenderer(this.config, this.container);
            this.initStats(this.config, this.container);

            // Disable context menu
            window.addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault());
            window.addEventListener('resize', () => this.onWindowResize());

            this.initialized = true;
        }
    }

    static load(mapName: string): Game {
        const game = new Game();
        Game.showLockScreen(() => {
            game.init();
            game.pointerLock.request();
            game.animate();

            const mapLoader = new MapLoader(game.config);
            mapLoader.addEventListener(ProgressEvent.TYPE, e => game.onProgress(e));
            mapLoader.load(mapName, game.audioListener, game.player).then(map => {
                console.debug(`Map "${mapName}" is loaded`);
                game.map = map;
                game.player.fists.enable();
                game.controls.enabled = true;
                console.debug('Game started');
            }).catch(reason => console.error(`Failed to load map "${mapName}"`, reason));
        });
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

    set map(map: GameMap) {
        this._map = map;
        this.scene.add(map);
    }

    private update() {
        const deltaTime = this.clock.getDelta();
        if (this._map) {
            this._map.update(deltaTime);
        }
        this.player.update(deltaTime);
        this.controls.update();
    }

    private getRequiredGameCanvasContainer(): HTMLElement {
        const container = document.getElementById('game_canvas_container');
        if (!container) {
            throw new Error('Game canvas container element is not found in DOM');
        }
        return container;
    }

    private initScene() {
        this.scene = new Scene();
    }

    private initCamera(config: GameConfig) {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new PerspectiveCamera(config.cameraFov, aspect, config.cameraNear, config.cameraFar);
    }

    private initAudioListener(camera: PerspectiveCamera) {
        this.audioListener = new AudioListener();
        camera.add(this.audioListener);
    }

    private initPlayer(camera: PerspectiveCamera) {
        this.player = new Player(camera);
    }

    private initPointerLock(target: HTMLElement) {
        this.pointerLock = new PointerLock(target);
        this.pointerLock.init();
    }

    private initControls(config: GameConfig, player: Player, pointerLock: PointerLock) {
        this.controls = new FpsControls(config, player, pointerLock);
        this.controls.init();
    }

    private initRenderer(config: GameConfig, parent: HTMLElement) {
        this.renderer = new WebGLRenderer({antialias: config.antialias});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFShadowMap;
        this.renderer.localClippingEnabled = true;
        this.renderer.domElement.id = 'game_canvas';
        parent.appendChild(this.renderer.domElement);
    }

    private initStats(config: GameConfig, parent: HTMLElement) {
        this.stats = Stats();
        if (config.showStats) {
            parent.appendChild(this.stats.dom);
        }
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
