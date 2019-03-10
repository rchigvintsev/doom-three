import {AbstractModelFactory} from './abstract-model-factory.js';
import {LWOLoader} from '../../loader/lwo-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {Settings} from '../../settings.js';
import {Materials} from '../materials.js';
import {GameWorld} from '../../game-world.js';
import {Elevator} from '../elevator.js';
import {ModelMaterialBuilder} from '../material/model-material-builder.js';
import {CollisionModelFactory} from '../../physics/collision-model-factory.js';
import {Game} from '../../game.js';
import {ElevatorDoor} from '../elevator-door.js';
import {SKINS} from '../skins.js';
import {CommonBody} from '../../physics/common-body.js';

export class LWOModelFactory extends AbstractModelFactory {
    constructor(systems, assets, flashlight) {
        super(new ModelMaterialBuilder(assets, flashlight), 'LWO');
        this._systems = systems;
        this._assets = assets;
        this._lwoLoader = new LWOLoader();
    }

    loadModel(modelDef) {
        const model = this._assets[AssetLoader.AssetType.MODELS][modelDef.model];
        if (model)
            return this._lwoLoader.load(model);
        return null;
    }

    createModel(modelDef) {
        const model = this.loadModel(modelDef);
        if (!model) {
            console.error('LWO model "' + modelDef.model + '" is not found for entity "' + modelDef.name + '"');
            return null;
        }

        let mesh;
        if (Settings.wireframeOnly)
            mesh = this.createModelMesh(modelDef, model.geometry, this.createWireframeMaterial());
        else {
            const materials = [];
            const additionalMaterials = [];
            const guiMaterials = [];

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
                            const regularMaterial = this.createRegularMaterial(materialName, materialDef);
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
                console.warn('Materials are not defined for ' + this._type + ' model ' + modelDef.model);
                materials.push(new THREE.MeshPhongMaterial());
            }

            mesh = this.createModelMesh(modelDef, model.geometry, materials, guiMaterials);
            if (additionalMaterials.length > 0 || Settings.showWireframe) {
                if (additionalMaterials.length > 0)
                    mesh.add(new THREE.SkinnedMesh(model.geometry, additionalMaterials));
                if (Settings.showWireframe)
                    mesh.add(new THREE.SkinnedMesh(model.geometry, this.createWireframeMaterial()));
            }
        }

        mesh.scale.setScalar(GameWorld.WORLD_SCALE);
        this._positionMesh(mesh, modelDef.position);
        this._rotateMesh(mesh, modelDef.rotation);

        return mesh;
    }

    createModelMesh(modelDef, geometry, materials, guiMaterials) {
        const physicsSystem = this._systems[Game.SystemType.PHYSICS_SYSTEM];
        const cmFactory = new CollisionModelFactory(physicsSystem.materials);

        if (modelDef.model === 'models/mapobjects/elevators/elevator.lwo') {
            const collisionModel = cmFactory.createCollisionModel(Elevator.DEFINITION);
            const body = new CommonBody(collisionModel);
            return new Elevator(modelDef.name, geometry, materials, guiMaterials, this._assets, body);
        }

        if (modelDef.model === 'models/mapobjects/elevators/elevator_door.lwo') {
            const collisionModel = cmFactory.createCollisionModel(ElevatorDoor.DEFINITION);
            // TODO: Apply this pattern to Elevator model too.
            return ElevatorDoor.newBuilder(geometry, materials)
                .withName(modelDef.name)
                .withBody(new CommonBody(collisionModel))
                .withMoveDirection(modelDef.moveDirection)
                .withTime(modelDef.time)
                .build();
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