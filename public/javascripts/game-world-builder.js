import {GameConstants} from './doom-three.js';
import {GameWorld} from './game-world.js';
import {AssetLoader} from './asset-loader.js';
import {SurfaceFactory} from './entity/surface/surface-factory.js';
import {Md5ModelFactory} from './entity/model/md5-model-factory.js';
import {LwoModelFactory} from './entity/model/lwo-model-factory.js';
import {LightFactory} from './entity/light/light-factory.js';
import {MATERIALS} from './material/materials.js';
import {Weapons} from './player/weapon/weapons.js';
import {Player} from './player/player.js';
import {PlayerBody} from './physics/player-body.js';
import {CollisionModelFactory} from './physics/collision-model-factory.js';
import {Settings} from './settings.js';
import {TriggerFactory} from './entity/trigger/trigger-factory.js';
import {SoundFactory} from './audio/sound-factory.js';
import {GuiFactory} from './entity/gui/gui-factory.js';
import {SystemType} from "./game-context.js";

export class GameWorldBuilder {
    constructor(camera, scene, systems) {
        this.camera = camera;
        this.scene = scene;
        this.systems = systems;
    }

    build(mapName, assetLoader) {
        const map = assetLoader.assets[AssetLoader.AssetType.MAPS][mapName];
        const gameWorld = new GameWorld(map.player.position, map.player.rotation);

        const factories = new Factories(this.systems, assetLoader);
        const physicsSystem = this.systems[SystemType.PHYSICS];

        if (map.skybox && !Settings.wireframeOnly)
            this.scene.add(new SkyboxBuilder().build(assetLoader, map.skybox));

        const weapons = new WeaponBuilder(this).build(gameWorld, factories);

        const player = new PlayerBuilder().build(factories, weapons);
        physicsSystem.registerBody(player.body);
        const attachedMeshes = player.body.collisionModel.attachedMeshes;
        if (attachedMeshes.length > 0)
            this.scene.add.apply(this.scene, attachedMeshes);
        gameWorld.player = player;
        this.scene.add(player);

        const areas = new AreaBuilder().build(factories, map.areas);
        for (let i = 0; i < areas.length; i++) {
            const area = areas[i];

            for (let i = 0; i < area.surfaces.length; i++) {
                const surface = area.surfaces[i];
                this.addObjectToScene(surface);
                gameWorld.currentArea.add(surface);
                if (surface.body)
                    physicsSystem.registerBody(surface.body);
            }

            for (let i = 0; i < area.lights.length; i++) {
                const light = area.lights[i];
                this.addObjectToScene(light.light);
                if (light.lightSphere)
                    this.addObjectToScene(light.lightSphere);
            }

            for (let i = 0; i < area.models.length; i++) {
                const model = area.models[i];
                this.addObjectToScene(model);
                if (model.body)
                    physicsSystem.registerBody(model.body);
                gameWorld.currentArea.add(model);
            }

            if (area.boundingBox) {
                this.addObjectToScene(area.boundingBox);
                gameWorld.currentArea.add(area.boundingBox);
            }
        }

        if (map.lights && !Settings.wireframeOnly) {
            const lights = new LightBuilder().build(factories, map.lights);
            for (let i = 0; i < lights.length; i++) {
                const light = lights[i];
                this.addObjectToScene(light.light);
                if (light.lightSphere)
                    this.addObjectToScene(light.lightSphere);
            }
        }

        if (map.triggers) {
            const triggers = new TriggerBuilder().build(factories, map.triggers);
            for (let i = 0; i < triggers.length; i++)
                gameWorld.addTrigger(triggers[i])
        }

        this.createTestBoxes(factories, gameWorld);

        return gameWorld;
    }

    addObjectToScene(object) {
        this.scene.add(object);
        if (object.body) {
            const attachedMeshes = object.body.collisionModel.attachedMeshes;
            if (attachedMeshes.length > 0)
                this.scene.add.apply(this.scene, attachedMeshes);
        }
    }

    // ========== Temporary code ==========

    createTestBoxes(factories, gameWorld) {
        const boxSize = 25;
        const geometry = new THREE.BoxGeometry(
            boxSize * GameWorld.WORLD_SCALE,
            boxSize * GameWorld.WORLD_SCALE,
            boxSize * GameWorld.WORLD_SCALE
        );

        const physicsSystem = this.systems[SystemType.PHYSICS];

        const boxes = [];
        for (let i = 0; i < 3; i++) {
            const material = new THREE.MeshLambertMaterial({
                color: (i === 0 ? 0xff0000 : (i === 1 ? 0x00ff00 : 0x0000ff))
            });
            boxes[i] = new THREE.Mesh(geometry, material);
            this.scene.add(boxes[i]);

            const cm = factories.collisionModelFactory.createCollisionModel({
                material: 'test_box',
                cm: {
                    bodies: [
                        {
                            mass: i === 2 ? 5 : 100,
                            position: [0, boxSize * (i + 5), 0],
                            name: 'box' + (i + 1),
                            shapes: [
                                {
                                    type: 'box',
                                    width: boxSize,
                                    height: boxSize,
                                    depth: boxSize
                                }
                            ]
                        }
                    ]
                }
            });

            cm.attachMesh(cm.bodies[0], boxes[i]);
            const body = {collisionModel: cm};
            physicsSystem.registerBody(body);
            boxes[i].body = body;

            const f = new CANNON.Vec3();
            const p = new CANNON.Vec3();
            boxes[i].takePunch = function (force, worldPoint) {
                const localPoint = this.worldToLocal(worldPoint);
                this.body.collisionModel.bodies[0].wakeUp();
                this.body.collisionModel.bodies[0].applyForce(f.copy(force), p.copy(localPoint));
            };

            gameWorld.currentArea.add(boxes[i]);
        }
    }
}

class SkyboxBuilder {
    build(assetLoader, skybox) {
        const skyboxSize = skybox.size * GameConstants.WORLD_SCALE;
        const geometry = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);

        const materialDef = MATERIALS[skybox.material];
        if (!materialDef) {
            console.error('Definition of material "' + skybox.material + '" is not found');
            return;
        }

        const textures = assetLoader.assets[AssetLoader.AssetType.TEXTURES];
        const images = [];
        ['_right', '_left', '_up', '_down', '_forward', '_back'].forEach(function (postfix) {
            const texture = textures[materialDef.cubeMap + postfix];
            if (!texture)
                console.error('Texture "' + materialDef.cubeMap + postfix + '" is not found');
            else
                images.push(texture.image);
        });

        const cubeTexture = new THREE.CubeTexture();
        cubeTexture.images = images;
        cubeTexture.format = THREE.RGBFormat;
        cubeTexture.needsUpdate = true;

        const cubeShader = THREE.ShaderLib.cube;
        cubeShader.uniforms.tCube.value = cubeTexture;

        const material = new THREE.ShaderMaterial({
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            side: THREE.BackSide
        });

        return new THREE.Mesh(geometry, material);
    }
}

class WeaponBuilder {
    constructor($this) {
        this._$this = $this;
    }

    build(gameWorld, factories) {
        const $this = this._$this;
        const weapons = {};
        for (let i = 0; i < Weapons.length; i++) {
            const weaponClass = Weapons[i];
            const weaponDef = weaponClass.definition;

            const weaponMesh = factories.md5ModelFactory.create(weaponDef);
            const weaponSounds = factories.soundFactory.createSounds(weaponDef);

            const args = [null, weaponMesh, weaponSounds, gameWorld, $this.camera];
            weapons[weaponDef.name] = new (Function.prototype.bind.apply(weaponClass, args));
        }
        return weapons;
    }
}

class PlayerBuilder {
    build(factories, weapons) {
        const sounds = factories.soundFactory.createSounds(Player.definition);

        const collisionModel = factories.collisionModelFactory.createCollisionModel(Player.definition);
        const body = new PlayerBody(collisionModel);

        return new Player(weapons, sounds, body);
    }
}

class AreaBuilder {
    build(factories, areas) {
        const result = [];
        const surfaceBuilder = new SurfaceBuilder();
        for (let ai = 0; ai < areas.length; ai++) {
            result.push({surfaces: [], lights: [], models: []});
            const area = areas[ai];
            result[ai].surfaces = surfaceBuilder.build(factories, area.surfaces);
            if (area.lights && !Settings.wireframeOnly)
                result[ai].lights = new LightBuilder().build(factories, area.lights);
            if (area.models)
                result[ai].models = new ModelBuilder().build(factories, area.models);
            if (area.boundingBox && Settings.renderBoundingBoxes)
                result[ai].boundingBox = AreaBuilder.createBoundingBox(area.boundingBox);
        }
        return result;
    }

    static createBoundingBox(bbDef) {
        const vertices = [];
        vertices.push(new THREE.Vector3(bbDef[0], bbDef[2], bbDef[4]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[1], bbDef[2], bbDef[4]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[0], bbDef[2], bbDef[5]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[1], bbDef[2], bbDef[5]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[0], bbDef[3], bbDef[4]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[1], bbDef[3], bbDef[4]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[0], bbDef[3], bbDef[5]).multiplyScalar(GameConstants.WORLD_SCALE));
        vertices.push(new THREE.Vector3(bbDef[1], bbDef[3], bbDef[5]).multiplyScalar(GameConstants.WORLD_SCALE));

        const faces = [];
        faces.push(new THREE.Face3(0, 1, 2));
        faces.push(new THREE.Face3(1, 2, 3));
        faces.push(new THREE.Face3(0, 1, 4));
        faces.push(new THREE.Face3(1, 4, 5));
        faces.push(new THREE.Face3(0, 2, 6));
        faces.push(new THREE.Face3(0, 4, 6));
        faces.push(new THREE.Face3(2, 3, 7));
        faces.push(new THREE.Face3(2, 6, 7));
        faces.push(new THREE.Face3(1, 3, 5));
        faces.push(new THREE.Face3(3, 5, 7));
        faces.push(new THREE.Face3(4, 5, 6));
        faces.push(new THREE.Face3(5, 6, 7));

        const geometry = new THREE.Geometry();
        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.mergeVertices();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({wireframe: true, color: 0xff0000});
        return new THREE.Mesh(geometry, material);
    }
}

class SurfaceBuilder {
    build(factories, surfaces) {
        const result = [];
        for (let i = 0; i < surfaces.length; i++) {
            const surface = factories.surfaceFactory.create(surfaces[i]);
            if (surfaces[i].position)
                surface.position.fromArray(surfaces[i].position).multiplyScalar(GameConstants.WORLD_SCALE);
            result.push(surface);
        }
        return result;
    }
}

class LightBuilder {
    build(factories, lights) {
        const result = [];
        for (let i = 0; i < lights.length; i++) {
            result.push({});
            const lightDef = lights[i];
            result[i].light = factories.lightFactory.create(lightDef);
            if (Settings.showLightSpheres)
                result[i].lightSphere = factories.lightFactory.createLightSphere(lightDef);
        }
        return result;
    }
}

class ModelBuilder {
    build(factories, models) {
        const result = [];
        for (let i = 0; i < models.length; i++) {
            const modelDef = models[i];
            if (Md5ModelFactory.isMD5Model(modelDef.model))
                result.push(factories.md5ModelFactory.create(modelDef));
            else if (LwoModelFactory.isLWOModel(modelDef.model))
                result.push(factories.lwoModelFactory.create(modelDef));
            else
                console.error("Model " + modelDef.model + " is not supported");
        }
        return result;
    }
}

class TriggerBuilder {
    build(factories, triggers) {
        const result = [];
        for (let i = 0; i < triggers.length; i++)
            result.push(factories.triggerFactory.create(triggers[i]));
        return result;
    }
}

class Factories {
    constructor(systems, assetLoader) {
        this._lightFactory = new LightFactory(assetLoader);
        this._soundFactory = new SoundFactory(assetLoader);
        this._triggerFactory = new TriggerFactory(assetLoader);
        this._guiFactory = new GuiFactory(assetLoader);
        this._collisionModelFactory = new CollisionModelFactory(systems);
        this._surfaceFactory = new SurfaceFactory(assetLoader, systems);
        this._md5ModelFactory = new Md5ModelFactory(assetLoader);
        this._lwoModelFactory = new LwoModelFactory(assetLoader, systems);
    }

    get lightFactory() {
        return this._lightFactory;
    }

    get soundFactory() {
        return this._soundFactory;
    }

    get guiFactory() {
        return this._guiFactory;
    }

    get triggerFactory() {
        return this._triggerFactory;
    }

    get collisionModelFactory() {
        return this._collisionModelFactory;
    }

    get surfaceFactory() {
        return this._surfaceFactory;
    }

    get md5ModelFactory() {
        return this._md5ModelFactory;
    }

    get lwoModelFactory() {
        return this._lwoModelFactory;
    }
}
