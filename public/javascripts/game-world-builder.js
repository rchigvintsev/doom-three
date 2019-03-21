import {Game} from './game.js';
import {GameConstants} from './doom-three.js';
import {GameWorld} from './game-world.js';
import {AssetLoader} from './asset-loader.js';
import {SurfaceFactory} from './entity/surface/surface-factory.js';
import {Md5ModelFactory} from './entity/model/md5-model-factory.js';
import {LwoModelFactory} from './entity/model/lwo-model-factory.js';
import {LightFactory} from './entity/light/light-factory.js';
import {Materials} from './map/materials.js';
import {Weapons} from './player/weapon/weapons.js';
import {Flashlight} from './player/weapon/flashlight.js';
import {Player} from './player/player.js';
import {PlayerBody} from './physics/player-body.js';
import {CollisionModelFactory} from './physics/collision-model-factory.js';
import {Settings} from './settings.js';
import {TriggerFactory} from './entity/trigger/trigger-factory.js';
import {SoundFactory} from './audio/sound-factory.js';

export class GameWorldBuilder {
    constructor(camera, scene, systems) {
        this.camera = camera;
        this.scene = scene;
        this.systems = systems;
    }

    build(mapName, assets) {
        const map = assets[AssetLoader.AssetType.MAPS][mapName];
        const gameWorld = new GameWorld(map.player.position, map.player.rotation);

        if (map.skybox && !Settings.wireframeOnly)
            this.scene.add(new SkyboxBuilder({assets: assets}).build(map.skybox));

        const weapons = new WeaponBuilder({
            camera: this.camera,
            systems: this.systems,
            world: gameWorld,
            assets: assets
        }).build();

        const player = new PlayerBuilder({systems: this.systems, assets: assets, weapons: weapons}).build();
        this.systems[Game.SystemType.PHYSICS_SYSTEM].registerBody(player.body);
        const attachedMeshes = player.body.collisionModel.attachedMeshes;
        if (attachedMeshes.length > 0)
            this.scene.add.apply(this.scene, attachedMeshes);
        gameWorld.player = player;
        this.scene.add(player);

        const areas = new AreaBuilder({
            systems: this.systems,
            assets: assets,
            flashlight: weapons[Flashlight.definition.name]
        }).build(map.areas);

        for (let i = 0; i < areas.length; i++) {
            const area = areas[i];

            for (let i = 0; i < area.surfaces.length; i++) {
                const surface = area.surfaces[i];
                this.addObjectToScene(surface);
                gameWorld.currentArea.add(surface);
                if (surface.body)
                    this.systems[Game.SystemType.PHYSICS_SYSTEM].registerBody(surface.body);
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
                    this.systems[Game.SystemType.PHYSICS_SYSTEM].registerBody(model.body);
                gameWorld.currentArea.add(model);
            }

            if (area.boundingBox) {
                this.addObjectToScene(area.boundingBox);
                gameWorld.currentArea.add(area.boundingBox);
            }
        }

        if (map.lights && !Settings.wireframeOnly) {
            const lights = new LightBuilder(assets).build(map.lights);
            for (let i = 0; i < lights.length; i++) {
                const light = lights[i];
                this.addObjectToScene(light.light);
                if (light.lightSphere)
                    this.addObjectToScene(light.lightSphere);
            }
        }

        if (map.triggers) {
            const triggers = new TriggerBuilder(assets).build(map.triggers);
            for (let i = 0; i < triggers.length; i++)
                gameWorld.addTrigger(triggers[i])
        }

        this.createTestBoxes(gameWorld);

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

    createTestBoxes(gameWorld) {
        const physicsSystem = this.systems[Game.SystemType.PHYSICS_SYSTEM];
        const collisionModelFactory = new CollisionModelFactory(physicsSystem.materials);

        const boxSize = 25;
        const geometry = new THREE.BoxGeometry(
            boxSize * GameWorld.WORLD_SCALE,
            boxSize * GameWorld.WORLD_SCALE,
            boxSize * GameWorld.WORLD_SCALE
        );

        const boxes = [];
        for (let i = 0; i < 3; i++) {
            const material = new THREE.MeshLambertMaterial({
                color: (i === 0 ? 0xff0000 : (i === 1 ? 0x00ff00 : 0x0000ff))
            });
            boxes[i] = new THREE.Mesh(geometry, material);
            this.scene.add(boxes[i]);

            const cm = collisionModelFactory.createCollisionModel({
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
    constructor(context) {
        this.context = context;
    }

    build(skybox) {
        const skyboxSize = skybox.size * GameConstants.WORLD_SCALE;
        const geometry = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);

        const materialDef = Materials.definition[skybox.material];
        if (!materialDef) {
            console.error('Definition of material "' + skybox.material + '" is not found');
            return;
        }

        const textures = this.context.assets[AssetLoader.AssetType.TEXTURES];
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
    constructor(context) {
        this.context = context;
        this.md5ModelFactory = new Md5ModelFactory(context.assets);
    }

    build() {
        const weapons = {};
        const animationSystem = this.context.systems[Game.SystemType.ANIMATION_SYSTEM];
        const soundFactory = new SoundFactory(this.context.assets);

        for (let wi = 0; wi < Weapons.length; wi++) {
            const weaponClass = Weapons[wi];
            const weaponDef = weaponClass.definition;

            const weaponModel = this.md5ModelFactory.create(weaponDef);

            const animationMixer = new THREE.AnimationMixer(weaponModel);
            animationSystem.registerAnimationMixer(animationMixer);

            const weaponSounds = soundFactory.createSounds(weaponDef);

            const args = [null, weaponModel, animationMixer, weaponSounds, this.context.world, this.context.camera];
            weapons[weaponDef.name] = new (Function.prototype.bind.apply(weaponClass, args));
        }
        return weapons;
    }
}

class PlayerBuilder {
    constructor(context) {
        this.context = context;
    }

    build() {
        const soundFactory = new SoundFactory(this.context.assets);
        const sounds = soundFactory.createSounds(Player.definition);

        const physicsSystem = this.context.systems[Game.SystemType.PHYSICS_SYSTEM];
        const collisionModelFactory = new CollisionModelFactory(physicsSystem.materials);
        const collisionModel = collisionModelFactory.createCollisionModel(Player.definition);
        const body = new PlayerBody(collisionModel);

        return new Player(this.context.weapons, sounds, body);
    }
}

class AreaBuilder {
    constructor(context) {
        this.context = context;
    }

    build(areas) {
        const result = [];
        const surfaceBuilder = new SurfaceBuilder(this.context);
        for (let ai = 0; ai < areas.length; ai++) {
            result.push({surfaces: [], lights: [], models: []});
            const area = areas[ai];
            result[ai].surfaces = surfaceBuilder.build(area.surfaces);
            if (area.lights && !Settings.wireframeOnly)
                result[ai].lights = new LightBuilder().build(area.lights);
            if (area.models)
                result[ai].models = new ModelBuilder(this.context).build(area.models);
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
    constructor(context) {
        const physicsSystem = context.systems[Game.SystemType.PHYSICS_SYSTEM];
        this.collisionModelFactory = new CollisionModelFactory(physicsSystem.materials);
        this.surfaceFactory = new SurfaceFactory(context.assets, context.flashlight, this.collisionModelFactory);
    }

    build(surfaces) {
        const result = [];
        for (let i = 0; i < surfaces.length; i++) {
            const surface = this.surfaceFactory.create(surfaces[i]);
            if (surfaces[i].position)
                surface.position.fromArray(surfaces[i].position).multiplyScalar(GameConstants.WORLD_SCALE);
            result.push(surface);
        }
        return result;
    }
}

class LightBuilder {
    constructor(assets) {
        this.lightFactory = new LightFactory(assets);
    }

    build(lights) {
        const result = [];
        for (let i = 0; i < lights.length; i++) {
            result.push({});
            const lightDef = lights[i];
            result[i].light = this.lightFactory.create(lightDef);
            if (Settings.showLightSphere)
                result[i].lightSphere = this.lightFactory.createLightSphere(lightDef);
        }
        return result;
    }
}

class ModelBuilder {
    constructor(context) {
        this.md5ModelFactory = new Md5ModelFactory(context.assets, context.flashlight);
        this.lwoModelFactory = new LwoModelFactory(context.assets, context.flashlight, context.systems);
    }

    build(models) {
        const result = [];
        for (let i = 0; i < models.length; i++) {
            const modelDef = models[i];
            if (Md5ModelFactory.isMD5Model(modelDef.model))
                result.push(this.md5ModelFactory.create(modelDef));
            else if (LwoModelFactory.isLWOModel(modelDef.model))
                result.push(this.lwoModelFactory.create(modelDef));
            else
                console.error("Model " + modelDef.model + " is not supported");
        }
        return result;
    }
}

class TriggerBuilder {
    constructor(assets) {
        this._triggerFactory = new TriggerFactory(assets);
    }

    build(triggers) {
        const result = [];
        for (let i = 0; i < triggers.length; i++)
            result.push(this._triggerFactory.create(triggers[i]));
        return result;
    }
}