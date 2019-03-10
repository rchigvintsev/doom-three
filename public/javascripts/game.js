import {TIME_STEP} from './game-constants.js';
import {currentTime} from './util/common-utils.js';
import {FeatureDetector} from './feature-detector.js';
import {Settings} from './settings.js';
import {AnimationSystem} from './animation/animation-system.js';
import {PhysicsSystem} from './physics/physics-system.js';
import {SoundManager} from './sound/sound-manager.js';
import {AssetLoader} from './asset-loader.js';
import {GameWorldBuilder} from './game-world-builder.js'
import {FPSControls} from './control/fps-controls.js';

const GameState = {
    PRELOADING: 0,
    LOADING: 1,
    POSTLOADING: 2,
    RUNNING: 3,
    PAUSE: 4
};

export const SystemType = {
    ANIMATION_SYSTEM: 0,
    PHYSICS_SYSTEM: 1,

    get length() {
        return 2;
    }
};

export class Game {
    constructor() {
        Settings.load();

        this.initStats();
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.initSystems();
        this.initSoundManager();
        this.initAssetLoader();
        this.initWorldBuilder();

        Game.disableContextMenu();

        $(window).on('resize', $.proxy(this.onWindowResize, this));

        this.requestAnimationFrameId = null;
        this.state = GameState.PRELOADING;

        /*this.orthoCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2,
         window.innerHeight / 2, -window.innerHeight / 2, 1, 10);
         this.orthoCamera.position.z = 10;

         this.orthoScene = new THREE.Scene();

         var axisHelper = new THREE.AxisHelper(5);
         this.scene.add(axisHelper);

         this.graphicsManager = new DT.GraphicsManager();
         this.animationManager = new DT.AnimationManager();
         this.physicsManager = new DT.PhysicsManager(this.scene);
         this.player = new DT.Player(this.camera, this.physicsManager);

         this.mapLoader = new DT.MapLoader(this.graphicsManager, this.animationManager, this.physicsManager,
         this.scene, $.proxy(this.onMapLoad, this));

         this.objectExplorer = new DT.ObjectExplorer(this.orthoScene, this.graphicsManager.vMode);*/
    };

    static load() {
        const game = new Game();
        game.load('game/site3');
    }

    initStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({antialias: Settings.antialias});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.domElement.id = 'game_canvas';
        document.body.appendChild(this.renderer.domElement);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(Settings.cameraFov, window.innerWidth / window.innerHeight,
            Settings.cameraNear, Settings.cameraFar);
    }

    initScene() {
        this.scene = new THREE.Scene();
    }

    initSystems() {
        this.systems = {};
        this.systems[SystemType.ANIMATION_SYSTEM] = new AnimationSystem();
        this.systems[SystemType.PHYSICS_SYSTEM] = new PhysicsSystem();
    }

    initSoundManager() {
        this._soundManager = new SoundManager();
    }

    initAssetLoader() {
        this.assetLoader = new AssetLoader(this._soundManager);
        this.assetLoader.addEventListener('load', $.proxy(function () {
            this.state = GameState.POSTLOADING;
        }, this));
    }

    initWorldBuilder() {
        this.worldBuilder = new GameWorldBuilder(this.camera, this.scene, this.systems);
    }

    static disableContextMenu() {
        $(document).on('contextmenu', function () {
            return false;
        });
    }

    load(mapName) {
        this.mapName = mapName;

        if (this.requestAnimationFrameId !== null)
            cancelAnimationFrame(this.requestAnimationFrameId);

        this.currentTime = currentTime();
        this.accumulator = 0.0;

        this.animate();
    }

    animate() {
        const newTime = currentTime();
        let frameTime = (newTime - this.currentTime) / 1000;
        if (frameTime > 0.33)
            frameTime = 0.33;

        this.currentTime = newTime;
        this.accumulator += frameTime;

        while (this.accumulator >= TIME_STEP) {
            this.update();
            this.accumulator -= TIME_STEP;
        }

        this.render();

        const self = this;
        this.requestAnimationFrameId = requestAnimationFrame(function () {
            self.animate();
        });
    }

    update() {
        this.stats.update();
        switch (this.state) {
            case GameState.PRELOADING:
                this.doPreloading();
                break;
            case GameState.LOADING:
                this.doLoading();
                break;
            case GameState.POSTLOADING:
                this.doPostloading();
                break;
            case GameState.RUNNING:
                this.doRunning();
                break;
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        /*this.renderer.clearDepth();
         this.renderer.render(this.orthoScene, this.orthoCamera);*/
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        /*this.orthoCamera.left = -width / 2;
         this.orthoCamera.right = width / 2;
         this.orthoCamera.top = height / 2;
         this.orthoCamera.bottom = -height / 2;
         this.orthoCamera.updateProjectionMatrix();*/

        this.renderer.setSize(width, height);
    }

    doPreloading() {
        this.assetLoader.load(this.mapName);
        this.state = GameState.LOADING;
    }

    doLoading() {
        // Do nothing
    }

    doPostloading() {
        this.gameWorld = this.worldBuilder.build(this.mapName, this.assetLoader.assets);
        this.controls = new FPSControls(this.camera, this.gameWorld.player);
        this.gameWorld.activateTriggers();
        this.state = GameState.RUNNING;
    }

    doRunning() {
        const time = currentTime();
        for (let i = 0; i < SystemType.length; i++)
            this.systems[i].update(TIME_STEP);
        this.gameWorld.update(time);
        this.controls.update();
    }
}

Game.SystemType = Object.freeze(SystemType);

$(function () {
    FeatureDetector.run(function () {
        Game.load();
    });
});
