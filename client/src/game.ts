import {AudioListener, Camera, Clock, PCFShadowMap, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import {GSSolver, SplitSolver} from 'cannon-es';

import {GameConfig} from './game-config';
import {MapLoader} from './map-loader';
import {ProgressEvent} from './event/progress-event';
import {FpsControls} from './control/fps-controls';
import {PointerLock} from './control/pointer-lock';
import {GameMap} from './entity/map/game-map';
import {PhysicsSystem} from './physics/physics-system';
import {PointerUnlockEvent} from './event/pointer-lock-events';
import {GameSystem, GameSystemType} from './game-system';
import {TweenAnimationSystem} from './animation/tween-animation-system';
import {Hud} from './entity/hud/hud';
import {AssetLoader} from './asset-loader';
import {createDiContainer} from './di.config';

export class Game {
    readonly systems = new Map<GameSystemType, GameSystem>();

    private readonly clock = new Clock();
    private readonly _config: GameConfig;
    private readonly canvasContainer: HTMLElement;
    private readonly _scene: Scene;
    private readonly _camera: PerspectiveCamera;
    private readonly _audioListener: AudioListener;
    private readonly pointerLock: PointerLock;
    private readonly controls: FpsControls;
    private readonly renderer: WebGLRenderer;
    private readonly stats: Stats;

    private map?: GameMap;
    private hud?: Hud;

    constructor() {
        this._config = GameConfig.load();

        this.canvasContainer = this.getRequiredGameCanvasContainer();

        this._scene = this.createScene();
        this._camera = this.createCamera(this._config);
        this._audioListener = this.createAudioListener(this._camera);
        this.pointerLock = this.createPointerLock(this.canvasContainer);
        this.controls = this.createControls(this._config, this.pointerLock);
        this.renderer = this.createRenderer(this._config, this.canvasContainer);
        this.stats = this.createStats(this._config, this.canvasContainer);

        this.createAnimationSystem();
        this.createPhysicsSystem();

        // Disable context menu
        window.addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault());
        window.addEventListener('resize', () => this.onWindowResize());
    }

    static load(mapName: string) {
        Game.showLockScreen(() => {
            const game = new Game();
            game.pointerLock.request();
            game.start();

            const assetLoader = new AssetLoader(game.config);
            assetLoader.addEventListener(ProgressEvent.TYPE, e => game.onProgress(e));
            assetLoader.load(mapName).then(assets => {
                const diContainer = createDiContainer(game.config, assets);

                const map = new MapLoader(game, diContainer).load(mapName, assets);
                console.debug(`Map "${mapName}" is loaded`);

                game.map = map;
                game.scene.add(map);

                game.hud = map.parameters.hud;

                game.controls.player = map.parameters.player;
                game.controls.enabled = true;

                console.debug('Game started');
            }).catch(reason => console.error(`Failed to load map "${mapName}"`, reason));
        });
    }

    start() {
        this.animate();
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

    private createAudioListener(camera: Camera): AudioListener {
        const audioListener = new AudioListener();
        camera.add(audioListener);
        return audioListener;
    }

    private createPointerLock(target: HTMLElement): PointerLock {
        const pointerLock = new PointerLock(target);
        pointerLock.init();
        pointerLock.addEventListener(PointerUnlockEvent.TYPE, () => Game.showLockScreen(() => pointerLock.request()));
        return pointerLock;
    }

    private createControls(config: GameConfig, pointerLock: PointerLock): FpsControls {
        const controls = new FpsControls(config, pointerLock);
        controls.init();
        return controls;
    }

    private createRenderer(config: GameConfig, parent: HTMLElement): WebGLRenderer {
        const renderer = new WebGLRenderer({antialias: config.antialias});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFShadowMap;
        renderer.localClippingEnabled = true;
        renderer.domElement.id = 'game_canvas';
        renderer.autoClear = false;
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

    private createAnimationSystem(): GameSystem {
        const animationSystem = new TweenAnimationSystem();
        this.systems.set(GameSystemType.ANIMATION, animationSystem);
        return animationSystem;
    }

    private createPhysicsSystem(): GameSystem {
        const physicsSystem = new PhysicsSystem();
        physicsSystem.allowSleep = true;
        physicsSystem.defaultContactMaterial.contactEquationStiffness = 1e9;
        physicsSystem.defaultContactMaterial.contactEquationRelaxation = 4;
        physicsSystem.solver = new SplitSolver(new GSSolver());
        this.systems.set(GameSystemType.PHYSICS, physicsSystem);
        return physicsSystem;
    }

    private render() {
        this.renderer.clear();
        this.renderer.render(this._scene, this._camera);
        if (this.hud) {
            this.hud.render(this.renderer);
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
        this.controls.update();
        if (this.hud) {
            this.hud.update(deltaTime);
        }
    }

    private onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        if (this.hud) {
            this.hud.onWindowResize();
        }
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
