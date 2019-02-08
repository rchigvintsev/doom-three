import {AbstractModelFactory} from './abstract-model-factory.js';
import {LWOLoader} from '../../loader/lwo-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {Settings} from '../../settings.js';
import {Materials} from '../../materials.js';
import {GameWorld} from '../../game-world.js';
import {Elevator} from '../elevator.js';
import {ModelMaterialBuilder} from '../material/model-material-builder.js';
import {CollisionModelFactory} from '../../physics/collision-model-factory.js';
import {Game} from '../../game.js';
import {ElevatorBody} from '../../physics/elevator-body.js';


export class LWOModelFactory extends AbstractModelFactory {
    constructor(systems, assets, flashlight) {
        super(new ModelMaterialBuilder(assets, flashlight), 'LWO');
        this._systems = systems;
        this._assets = assets;
        this._lwoLoader = new LWOLoader();
    }

    loadModel(modelDef) {
        const model = this._assets[AssetLoader.AssetType.MODELS][modelDef.name];
        if (model)
            return this._lwoLoader.load(model);
        return null;
    }

    createModel(modelDef) {
        const model = this.loadModel(modelDef);
        if (!model) {
            console.error('LWO model "' + modelDef.name + '" is not found');
            return null;
        }

        let mesh;
        if (Settings.wireframeOnly)
            mesh = this.createModelMesh(modelDef.name, model.geometry, this.createWireframeMaterial());
        else {
            const materials = [];
            const additionalMaterials = [];
            const guiMaterials = [];

            const declaredMaterials = modelDef.materials || model.materials;
            if (declaredMaterials)
                for (let i = 0; i < declaredMaterials.length; i++) {
                    let declaredMaterial = declaredMaterials[i];
                    const materialName = typeof declaredMaterial === 'string' ? declaredMaterial
                        : declaredMaterial.name;
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

            if (materials.length === 0) {
                console.warn('Materials are not defined for ' + this._type + ' model ' + modelDef.name);
                materials.push(new THREE.MeshPhongMaterial());
            }

            mesh = this.createModelMesh(modelDef.name, model.geometry, materials, guiMaterials);
            if (additionalMaterials.length > 0 || Settings.showWireframe) {
                if (additionalMaterials.length > 0)
                    mesh.add(new THREE.SkinnedMesh(model.geometry, additionalMaterials));
                if (Settings.showWireframe)
                    mesh.add(new THREE.SkinnedMesh(model.geometry, this.createWireframeMaterial()));
            }
        }

        mesh.scale.setScalar(GameWorld.WORLD_SCALE);
        this._positionMesh(mesh, modelDef.position);
        this._rotateMesh(mesh);

        return mesh;
    }

    createModelMesh(modelName, geometry, materials, guiMaterials) {
        if (modelName === 'models/mapobjects/elevators/elevator.lwo') {
            const physicsSystem = this._systems[Game.SystemType.PHYSICS_SYSTEM];
            const cmFactory = new CollisionModelFactory(physicsSystem.materials);
            const collisionModel = cmFactory.createCollisionModel(Elevator.DEFINITION);
            const body = new ElevatorBody(collisionModel);
            return new Elevator(geometry, materials, guiMaterials, this._assets, body);
        }

        const group = new THREE.Group();
        group.add(new THREE.SkinnedMesh(geometry, materials));
        return group;
    }

    // noinspection JSMethodCanBeStatic
    _positionMesh(mesh, position) {
        mesh.position.fromArray(position).multiplyScalar(GameWorld.WORLD_SCALE);
        if (mesh.body)
            mesh.body.position = mesh.position;
    }

    _rotateMesh(mesh) {
        mesh.rotation.set(THREE.Math.degToRad(90), 0, 0);
        if (mesh.body)
            mesh.body.rotation = mesh.rotation;
    }
}