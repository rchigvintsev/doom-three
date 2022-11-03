import {Mesh, Scene, Vector3} from 'three';

import {Weapon} from '../md5/weapon/weapon';
import {PhysicsSystem} from '../../../physics/physics-system';
import {ModelParameters} from '../model-parameters';
import {MeshBasedEntity, updateCollisionModel, updateMaterials} from '../../mesh-based-entity';
import {CollisionModel} from '../../../physics/collision-model';
import {GameConfig} from '../../../game-config';

export class LwoModel extends Mesh implements MeshBasedEntity {
    private initialized = false;

    constructor(protected readonly parameters: ModelParameters) {
        super(parameters.geometry, parameters.materials);
    }

    init() {
        if (!this.initialized) {
            this.doInit();
            this.initialized = true;
        }
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        if (this.collisionModel) {
            this.collisionModel.register(physicsSystem, scene);
        }
    }

    onAttacked(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon) {
        // Do nothing
    }

    update(deltaTime: number) {
        if (!this.config.renderOnlyWireframe) {
            updateMaterials(this, deltaTime);
        }
        updateCollisionModel(this, deltaTime);
    }

    get collisionModel(): CollisionModel | undefined {
        return this.parameters.collisionModel;
    }

    protected get config(): GameConfig {
        return this.parameters.config;
    }

    protected doInit() {
        // Do nothing by default
    }
}
