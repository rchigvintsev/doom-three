import {LWOLoader} from '../../loader/lwo-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {Settings} from '../../settings.js';
import {Materials} from '../../map/materials.js';
import {GameWorld} from '../../game-world.js';
import {Elevator} from './elevator.js';
import {ModelMaterialBuilder} from '../../map/material/model-material-builder.js';
import {CollisionModelFactory} from '../../physics/collision-model-factory.js';
import {Game} from '../../game.js';
import {ElevatorDoor} from './elevator-door.js';
import {SKINS} from '../../map/skins.js';
import {CommonBody} from '../../physics/common-body.js';
import {MeshFactory} from '../mesh-factory.js';
import {SoundFactory} from '../../audio/sound-factory.js';
import {GuiFactory} from '../gui/gui-factory.js';
import {LightFactory} from '../light/light-factory.js';

export class LwoModelFactory extends MeshFactory {
    constructor(assets, flashlight, systems) {
        super(assets, new ModelMaterialBuilder(assets, flashlight));
        const physicsSystem = systems[Game.SystemType.PHYSICS_SYSTEM];
        this._collisionModelFactory = new CollisionModelFactory(physicsSystem.materials);
        this._soundFactory = new SoundFactory(this._assets);
        this._lwoLoader = new LWOLoader();
    }

    static isLWOModel(modelName) {
        return modelName.toLowerCase().indexOf('.lwo') > 0;
    }

    create(entityDef) {
        const model = this._loadModel(entityDef);
        if (!model) {
            console.error('LWO model "' + entityDef.model + '" is not found for entity "' + entityDef.name + '"');
            return null;
        }

        let mesh;
        if (Settings.wireframeOnly)
            mesh = this._createModelMesh(entityDef, model.geometry, this._createWireframeMaterial());
        else {
            const materials = [];
            const additionalMaterials = [];
            const guiMaterials = [];

            const declaredMaterials = entityDef.materials || model.materials;
            if (declaredMaterials) {
                let skin = null;
                if (entityDef.skin) {
                    skin = SKINS[entityDef.skin];
                    if (!skin)
                        console.error('Skin "' + entityDef.skin + '" is not found');
                }

                for (let i = 0; i < declaredMaterials.length; i++) {
                    let declaredMaterial = declaredMaterials[i];
                    let materialName = typeof declaredMaterial === 'string' ? declaredMaterial
                        : declaredMaterial.name;
                    if (skin && skin[materialName])
                        // Override material
                        materialName = skin[materialName];
                    let materialDef = Materials.definition[materialName];
                    if (!materialDef) {
                        console.error('Definition for material ' + materialName + ' is not found');
                        materials.push(new THREE.MeshPhongMaterial());
                    } else {
                        if (materialDef.type === 'gui')
                            guiMaterials.push({index: i, definition: materialDef});
                        else {
                            const regularMaterial = this._createRegularMaterial(materialName, materialDef);
                            if (Array.isArray(regularMaterial)) {
                                materials.push(regularMaterial[0]);
                                additionalMaterials[i] = regularMaterial[1];
                            } else
                                materials.push(regularMaterial);
                        }
                    }
                }
            }

            if (materials.length === 0) {
                console.warn('Materials are not defined for LWO model ' + entityDef.model);
                materials.push(new THREE.MeshPhongMaterial());
            }

            mesh = this._createModelMesh(entityDef, model.geometry, materials, guiMaterials);
            if (additionalMaterials.length > 0 || Settings.showWireframe) {
                if (additionalMaterials.length > 0)
                    mesh.add(new THREE.SkinnedMesh(model.geometry, additionalMaterials));
                if (Settings.showWireframe)
                    mesh.add(new THREE.SkinnedMesh(model.geometry, this._createWireframeMaterial()));
            }
        }

        mesh.scale.setScalar(GameWorld.WORLD_SCALE);
        this._positionMesh(mesh, entityDef.position);
        this._rotateMesh(mesh, entityDef.rotation);

        return mesh;
    }

    _loadModel(modelDef) {
        const model = this._assets[AssetLoader.AssetType.MODELS][modelDef.model];
        if (model)
            return this._lwoLoader.load(model);
        return null;
    }

    _createModelMesh(modelDef, geometry, materials, guiMaterials) {
        if (modelDef.model === 'models/mapobjects/elevators/elevator.lwo') {
            const collisionModel = this._collisionModelFactory.createCollisionModel(Elevator.DEFINITION);
            const body = new CommonBody(collisionModel);
            const elevator = new Elevator(geometry, materials, guiMaterials, this._assets, body);
            elevator.name = modelDef.name;
            elevator.body = body;

            if (guiMaterials) {
                const guiFactory = new GuiFactory(this._assets);
                for (let guiMaterial of guiMaterials)
                    elevator.addGui(guiFactory.create(guiMaterial.definition, geometry, guiMaterial.index));
            }

            if (!Settings.wireframeOnly) {
                const lightFactory = new LightFactory(this._assets);
                for (let i = 0; i < Elevator.DEFINITION.lights.length; i++) {
                    const lightDef = Elevator.DEFINITION.lights[i];
                    const light = lightFactory.create(lightDef, false);
                    elevator.add(light);
                    if (Settings.showLightSphere) {
                        const lightSphere = lightFactory.createLightSphere(lightDef, false);
                        elevator.add(lightSphere);
                    }
                }
            }

            elevator.init();
            return elevator;
        }

        if (modelDef.model === 'models/mapobjects/elevators/elevator_door.lwo') {
            const collisionModel = this._collisionModelFactory.createCollisionModel(ElevatorDoor.DEFINITION);
            const elevatorDoor = new ElevatorDoor(geometry, materials);
            elevatorDoor.name = modelDef.name;
            elevatorDoor.body = new CommonBody(collisionModel);
            elevatorDoor.moveDirection = modelDef.moveDirection;
            elevatorDoor.time = modelDef.time;
            elevatorDoor.sounds = this._soundFactory.createSounds(modelDef);
            elevatorDoor.init();
            return elevatorDoor;
        }

        const group = new THREE.Group();
        group.name = modelDef.name;
        group.add(new THREE.SkinnedMesh(geometry, materials));
        return group;
    }

    // noinspection JSMethodCanBeStatic
    _positionMesh(mesh, position) {
        mesh.position.fromArray(position).multiplyScalar(GameWorld.WORLD_SCALE);
        if (mesh.body)
            mesh.body.position = mesh.position;
    }

    // noinspection JSMethodCanBeStatic
    _rotateMesh(mesh, rotation) {
        const ninetyDegrees = THREE.Math.degToRad(90);
        mesh.rotation.set(ninetyDegrees, 0, ninetyDegrees);

        mesh.rotation.x -= rotation[0];
        mesh.rotation.y -= rotation[1];
        mesh.rotation.z -= rotation[2];

        if (mesh.body)
            mesh.body.rotation = mesh.rotation;
    }
}