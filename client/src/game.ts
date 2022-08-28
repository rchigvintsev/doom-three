import {AudioListener, Clock, PCFShadowMap, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {GSSolver, SplitSolver} from 'cannon-es';

import {GameConfig} from './game-config';
import {MapLoader} from './map-loader';
import {ProgressEvent} from './event/progress-event';
import {FpsControls} from './control/fps-controls';
import {PointerLock} from './control/pointer-lock';
import {GameMap} from './entity/map/game-map';
import {PhysicsWorld} from './physics/physics-world';
import {PointerUnlockEvent} from './event/pointer-lock-events';

const TIME_STEP = 1 / 60;

// noinspection JSMethodCanBeStatic
export class Game {
    private readonly clock = new Clock();

    private _config!: GameConfig;
    private _scene!: Scene;
    private _camera!: PerspectiveCamera;
    private _audioListener!: AudioListener;
    private _physicsWorld!: PhysicsWorld;

    private container!: HTMLElement;
    private pointerLock!: PointerLock;
    private controls!: FpsControls;
    private renderer!: WebGLRenderer;
    private stats!: Stats;
    private map?: GameMap;

    private initialized = false;

    init() {
        if (!this.initialized) {
            this._config = GameConfig.load();

            this.container = this.getRequiredGameCanvasContainer();

            this.initScene();
            this.initCamera(this._config);
            this.initAudioListener(this._camera);
            this.initPointerLock(this.container);
            this.initControls(this._config, this.pointerLock);
            this.initRenderer(this._config, this.container);
            this.initPhysics();
            this.initStats(this._config, this.container);

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

            const mapLoader = new MapLoader(game);
            mapLoader.addEventListener(ProgressEvent.TYPE, e => game.onProgress(e));
            mapLoader.load(mapName).then(map => {
                console.debug(`Map "${mapName}" is loaded`);

                game.map = map;
                game._scene.add(map);

                game.controls.player = map.player;
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
        if (this._config.showStats) {
            this.stats.update();
        }
    }

    get config(): GameConfig {
        return this._config;
    }

    get scene(): Scene {
        return this._scene;
    }

    get camera(): PerspectiveCamera {
        return this._camera;
    }

    get audioListener(): AudioListener {
        return this._audioListener;
    }

    get physicsWorld(): PhysicsWorld {
        return this._physicsWorld;
    }

    private update() {
        const deltaTime = this.clock.getDelta();
        if (this.map) {
            this.map.update(deltaTime);
        }
        this.controls.update();
        this._physicsWorld.step(TIME_STEP, deltaTime);
    }

    private getRequiredGameCanvasContainer(): HTMLElement {
        const container = document.getElementById('game_canvas_container');
        if (!container) {
            throw new Error('Game canvas container element is not found in DOM');
        }
        return container;
    }

    private initScene() {
        this._scene = new Scene();
    }

    private initCamera(config: GameConfig) {
        const aspect = window.innerWidth / window.innerHeight;
        this._camera = new PerspectiveCamera(config.cameraFov, aspect, config.cameraNear, config.cameraFar);
    }

    private initAudioListener(camera: PerspectiveCamera) {
        this._audioListener = new AudioListener();
        camera.add(this._audioListener);
    }

    private initPointerLock(target: HTMLElement) {
        this.pointerLock = new PointerLock(target);
        this.pointerLock.init();
        this.pointerLock.addEventListener(PointerUnlockEvent.TYPE,
            () => Game.showLockScreen(() => this.pointerLock.request()));
    }

    private initControls(config: GameConfig, pointerLock: PointerLock) {
        this.controls = new FpsControls(config, pointerLock);
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

    private initPhysics() {
        this._physicsWorld = new PhysicsWorld();
        this._physicsWorld.allowSleep = true;

        this._physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e9;
        this._physicsWorld.defaultContactMaterial.contactEquationRelaxation = 4;

        const solver = new GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this._physicsWorld.solver = new SplitSolver(solver);
    }

    private initStats(config: GameConfig, parent: HTMLElement) {
        this.stats = Stats();
        if (config.showStats) {
            parent.appendChild(this.stats.dom);
        }
    }

    private render() {
        this.renderer.render(this._scene, this._camera);
    }

    private onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
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
        lockScreen.addEventListener('auxclick', () => {
            Game.hideLockScreen();
            if (onClick) {
                onClick();
            }
        }, {once: true});
    }

    private static hideLockScreen() {
        const lockScreen = document.getElementById('lock_screen');
        if (!lockScreen) {
            throw new Error('Failed to hide lock screen: lock screen element is not found in DOM');
        }
        lockScreen.classList.add('hidden');
    }
}
