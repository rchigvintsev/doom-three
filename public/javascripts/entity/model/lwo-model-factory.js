import {LWOLoader} from '../../loader/lwo-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {Settings} from '../../settings.js';
import {MATERIALS} from '../../material/materials.js';
import {SKINS} from '../../material/skins.js';
import {MODELS} from './models.js';
import {COLLISION_MODELS} from '../../physics/collision-models.js';
import {GameConstants} from '../../doom-three.js';
import {GameWorld} from '../../game-world.js';
import {Elevator} from './elevator.js';
import {ModelMaterialBuilder} from '../../map/material/model-material-builder.js';
import {CommonBody} from '../../physics/common-body.js';
import {ModelFactory} from './model-factory.js';
import {LightFactory} from '../light/light-factory.js';
import {SoundFactory} from '../../audio/sound-factory.js';
import {SurfaceFactory} from '../surface/surface-factory.js';
import {GuiFactory} from '../gui/gui-factory.js';
import {CollisionModelFactory} from '../../physics/collision-model-factory.js';
import {SlidingDoor} from './sliding-door.js';
import {TechDoorPanel} from './tech-door-panel.js';
import {LwoModel} from './lwo-model.js';
import {HealthGui} from './health-gui.js';
import {UpdatableMeshPhongMaterial} from '../../material/updatable-mesh-phong-material.js';

const ENTITY_GUI_MATERIAL_PATTERN = /textures\/common\/entitygui(\d*)/;

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
            case 'models/mapobjects/elevators/elevator.lwo':
                mesh = new Elevator(model.geometry, materials.main);
                break;
            case 'models/mapobjects/elevators/elevator_door.lwo':
            case 'models/mapobjects/doors/delelev/delelevlf.lwo':
            case 'models/mapobjects/doors/delelev/delelevrt.lwo':
            case 'models/mapobjects/doors/techdoor2/techdr2lft.lwo':
            case 'models/mapobjects/doors/techdoor2/techdr2rt.lwo': {
                const slidingDoor = new SlidingDoor(model.geometry, materials.main);
                slidingDoor.moveDirection = modelDef.moveDirection;
                slidingDoor.time = modelDef.time;
                slidingDoor.team = modelDef.team;
                slidingDoor.locked = modelDef.locked;
                slidingDoor.sounds = this._soundFactory.createSounds(modelDef);
                mesh = slidingDoor;
                break;
            }
            case 'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1.lwo':
                mesh = new TechDoorPanel(model.geometry, materials.main);
                break;
            case 'models/mapobjects/healthgui/healthgui.lwo':
                mesh = new HealthGui(model.geometry, materials.main);
                break;
            default:
                mesh = new LwoModel(model.geometry, materials.main);
        }

        mesh.name = modelDef.name;

        const collisionModelDef = COLLISION_MODELS[modelDef.model];
        if (collisionModelDef) {
            const collisionModel = this._collisionModelFactory.createCollisionModel(collisionModelDef);
            mesh.body = new CommonBody(collisionModel);
        }

        // It is necessary to set right rotation before GUI construction
        mesh.rotation.copy(this._computeMeshRotation(modelDef.rotation));

        if (materials.gui.length > 0)
            for (let i = 0; i < materials.gui.length; i++) {
                const gui = this._guiFactory.create(materials.gui[i], mesh);
                if (gui)
                    mesh.addGui(gui);
            }

        if (materials.additional.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry().fromGeometry(model.geometry);
            if (bufferGeometry.getAttribute('skinWeight') == null) {
                bufferGeometry.addAttribute('skinWeight', new THREE.Float32BufferAttribute(0, 4));
            }
            mesh.add(new THREE.Mesh(model.geometry, materials.additional));
        }

        if (modelDef.lights && !Settings.wireframeOnly)
            for (let i = 0; i < modelDef.lights.length; i++) {
                const lightDef = modelDef.lights[i];
                const light = this._lightFactory.create(lightDef, false);
                mesh.add(light);
                if (Settings.showLightSpheres) {
                    const lightSphere = this._lightFactory.createLightSphere(lightDef, false);
                    mesh.add(lightSphere);
                }
            }

        if (Settings.showWireframe && !Settings.wireframeOnly) {
            const bufferGeometry = new THREE.BufferGeometry().fromGeometry(model.geometry);
            if (bufferGeometry.getAttribute('skinWeight') == null) {
                bufferGeometry.addAttribute('skinWeight', new THREE.Float32BufferAttribute(0, 4));
            }
            mesh.add(new THREE.Mesh(bufferGeometry, this._createWireframeMaterial()));
        }

        mesh.init();
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
                    if (!skin) {
                        console.error('Skin "' + modelDef.skin + '" is not found');
                    }
                }

                for (let i = 0; i < declaredMaterials.length; i++) {
                    let declaredMaterial = declaredMaterials[i];
                    let materialName = typeof declaredMaterial === 'string' ? declaredMaterial : declaredMaterial.name;
                    if (materialName.endsWith('.tga')) {
                        materialName = materialName.substring(0, materialName.length - 4);
                    }
                    if (skin && skin[materialName])
                        materialName = skin[materialName]; // Override material
                    const match = materialName.match(ENTITY_GUI_MATERIAL_PATTERN);
                    if (match) {
                        const guiNumber = (match[1] || 1) - 1;
                        if (modelDef.gui[guiNumber])
                            materials.gui[guiNumber] = {name: modelDef.gui[guiNumber], index: i};
                        else
                            console.error('Model ' + modelDef.name + ' does not have GUI with number ' + guiNumber);
                    } else {
                        const materialDef = MATERIALS[materialName];
                        if (!materialDef) {
                            console.error('Definition for material ' + materialName + ' is not found');
                            const fallbackMaterial = new UpdatableMeshPhongMaterial();
                            fallbackMaterial.name = materialName;
                            materials.main.push(fallbackMaterial);
                        } else {
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
        mesh.position.copy(this._computeMeshPosition(position));
        if (mesh.body)
            mesh.body.position = mesh.position;
    }

    _computeMeshPosition(position) {
        return new THREE.Vector3().fromArray(position).multiplyScalar(GameWorld.WORLD_SCALE);
    }

    _rotateMesh(mesh, rotation) {
        mesh.rotation.copy(this._computeMeshRotation(rotation));
        if (mesh.body) {
            mesh.body.rotation = mesh.rotation;
        }
    }

    _computeMeshRotation(rotation) {
        const result = new THREE.Euler();
        const ninetyDegrees = THREE.Math.degToRad(90);
        result.set(ninetyDegrees, 0, ninetyDegrees);

        result.x -= rotation[0];
        result.y -= rotation[1];
        result.z -= rotation[2];

        return result;
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
