import {LWOLoader} from '../../loader/lwo-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {Settings} from '../../settings.js';
import {MATERIALS} from '../../material/materials.js';
import {GameWorld} from '../../game-world.js';
import {Elevator} from './elevator.js';
import {ModelMaterialBuilder} from '../../map/material/model-material-builder.js';
import {ElevatorDoor} from './elevator-door.js';
import {SKINS} from '../../map/skins.js';
import {CommonBody} from '../../physics/common-body.js';
import {MODELS} from './models.js';
import {ModelFactory} from './model-factory.js';
import {GameConstants} from '../../doom-three.js';
import {LightFactory} from '../light/light-factory.js';
import {SoundFactory} from '../../audio/sound-factory.js';
import {SurfaceFactory} from '../surface/surface-factory.js';
import {GuiFactory} from '../gui/gui-factory.js';
import {CollisionModelFactory} from '../../physics/collision-model-factory.js';

export class LwoModelFactory extends ModelFactory {
    constructor(assetLoader, systems) {
        super('LWO', assetLoader, new ModelMaterialBuilder(assetLoader));
        this._lightFactory = new LightFactory(assetLoader);
        this._soundFactory = new SoundFactory(assetLoader);
        this._surfaceFactory = new SurfaceFactory(assetLoader, systems);
        this._guiFactory = new GuiFactory(assetLoader);
        this._collisionModelFactory = new CollisionModelFactory(systems);
        this._lwoLoader = new LWOLoader();
    }

    static isLWOModel(modelName) {
        return modelName.toLowerCase().indexOf('.lwo') > 0;
    }


    create(entityDef) {
        const modelMesh = super.create(entityDef);
        this._bindSurfaces(modelMesh, entityDef.surfaces);
        return modelMesh;
    }

    _loadModel(modelDef) {
        const model = this._assetLoader.assets[AssetLoader.AssetType.MODELS][modelDef.model];
        return model ? this._lwoLoader.load(model) : null;
    }

    _createModelMesh(modelDef, model, materials) {
        if (MODELS[modelDef.model])
            modelDef = Object.assign({}, modelDef, MODELS[modelDef.model]);
        let mesh;
        switch (modelDef.model) {
            case 'models/mapobjects/elevators/elevator.lwo': {
                const elevator = new Elevator(model.geometry, materials.main);
                elevator.name = modelDef.name;

                const collisionModel = this._collisionModelFactory.createCollisionModel(modelDef);
                elevator.body = new CommonBody(collisionModel);

                if (materials.gui.length > 0)
                    for (let guiMaterial of materials.gui) {
                        const gui = this._guiFactory.create(guiMaterial.definition, model.geometry, guiMaterial.index);
                        elevator.addGui(gui);
                    }

                if (!Settings.wireframeOnly) {
                    for (let i = 0; i < modelDef.lights.length; i++) {
                        const lightDef = modelDef.lights[i];
                        const light = this._lightFactory.create(lightDef, false);
                        elevator.add(light);
                        if (Settings.showLightSphere) {
                            const lightSphere = this._lightFactory.createLightSphere(lightDef, false);
                            elevator.add(lightSphere);
                        }
                    }
                }

                elevator.init();
                mesh = elevator;
                break;
            }
            case 'models/mapobjects/elevators/elevator_door.lwo':
            case 'models/mapobjects/doors/delelev/delelevlf.lwo':
            case 'models/mapobjects/doors/delelev/delelevrt.lwo': {
                const elevatorDoor = new ElevatorDoor(model.geometry, materials.main);
                elevatorDoor.name = modelDef.name;
                elevatorDoor.moveDirection = modelDef.moveDirection;
                elevatorDoor.time = modelDef.time;
                elevatorDoor.team = modelDef.team;
                elevatorDoor.sounds = this._soundFactory.createSounds(modelDef);

                const collisionModel = this._collisionModelFactory.createCollisionModel(modelDef);
                elevatorDoor.body = new CommonBody(collisionModel);

                elevatorDoor.init();
                mesh = elevatorDoor;
                break;
            }
            default: {
                const group = new THREE.Group();
                group.name = modelDef.name;
                group.add(new THREE.SkinnedMesh(model.geometry, materials.main));
                mesh = group;
            }
        }

        if (materials.additional.length > 0)
            mesh.add(new THREE.SkinnedMesh(model.geometry, materials.additional));

        if (Settings.showWireframe && !Settings.wireframeOnly)
            mesh.add(new THREE.SkinnedMesh(model.geometry, this._createWireframeMaterial()));

        return mesh;
    }

    _getMaterials(modelDef, model) {
        const materials = {main: [], additional: [], gui: []};

        if (Settings.wireframeOnly)
            materials.main.push(this._createWireframeMaterial());
        else {
            const declaredMaterials = modelDef.materials || model.materials;
            if (declaredMaterials) {
                let skin = null;
                if (modelDef.skin) {
                    skin = SKINS[modelDef.skin];
                    if (!skin)
                        console.error('Skin "' + modelDef.skin + '" is not found');
                }

                for (let i = 0; i < declaredMaterials.length; i++) {
                    let declaredMaterial = declaredMaterials[i];
                    let materialName = typeof declaredMaterial === 'string' ? declaredMaterial : declaredMaterial.name;
                    if (skin && skin[materialName])
                    // Override material
                        materialName = skin[materialName];
                    let materialDef = MATERIALS[materialName];
                    if (!materialDef) {
                        console.error('Definition for material ' + materialName + ' is not found');
                        materials.main.push(new THREE.MeshPhongMaterial());
                    } else {
                        if (materialDef.type === 'gui')
                            materials.gui.push({index: i, definition: materialDef});
                        else {
                            const regularMaterial = this._createRegularMaterial(materialName, materialDef);
                            if (Array.isArray(regularMaterial)) {
                                materials.main.push(regularMaterial[0]);
                                materials.additional[i] = regularMaterial[1];
                            } else
                                materials.main.push(regularMaterial);
                        }
                    }
                }
            }

            if (materials.main.length === 0) {
                console.warn('Materials are not defined for LWO model ' + modelDef.model);
                materials.main.push(new THREE.MeshPhongMaterial());
            }
        }

        return materials;
    }

    _positionMesh(mesh, position) {
        mesh.position.fromArray(position).multiplyScalar(GameWorld.WORLD_SCALE);
        if (mesh.body)
            mesh.body.position = mesh.position;
    }

    _rotateMesh(mesh, rotation) {
        const ninetyDegrees = THREE.Math.degToRad(90);
        mesh.rotation.set(ninetyDegrees, 0, ninetyDegrees);

        mesh.rotation.x -= rotation[0];
        mesh.rotation.y -= rotation[1];
        mesh.rotation.z -= rotation[2];

        if (mesh.body)
            mesh.body.rotation = mesh.rotation;
    }

    _bindSurfaces(mesh, surfaces) {
        if (!surfaces)
            return;
        mesh.updateMatrixWorld();
        const v = new THREE.Vector3();
        for (let surfaceDef of surfaces) {
            const surface = this._surfaceFactory.create(surfaceDef, false);
            v.fromArray(surfaceDef.position).multiplyScalar(GameConstants.WORLD_SCALE);
            surface.position.copy(mesh.worldToLocal(v));
            surface.rotation.x -= THREE.Math.degToRad(90);
            mesh.add(surface);
        }
    }
}