import {Mesh, Scene, Vector3} from 'three';

import {Entity} from '../../entity';
import {Weapon} from '../md5/weapon/weapon';
import {PhysicsSystem} from '../../../physics/physics-system';
import {ModelParameters} from '../model-parameters';
import {MeshBasedEntity, MeshBasedEntityMixin} from '../../mesh-based-entity';
import {CollisionModel} from '../../../physics/collision-model';
import {applyMixins} from '../../../util/mixins';
import {GameConfig} from '../../../game-config';

export class LwoModel extends Mesh implements Entity, MeshBasedEntity {
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

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon) {
        // Do nothing
    }

    update(deltaTime: number) {
        if (!this.config.renderOnlyWireframe) {
            this.updateMaterials(this, deltaTime);
        }
        this.updateCollisionModel(this, this.collisionModel, deltaTime);
    }

    updateMaterials(_mesh: Mesh, _deltaTime: number) {
        // Implemented in MeshBasedEntityMixin
    }

    updateCollisionModel(_mesh: Mesh, _collisionModel: CollisionModel | undefined, _deltaTime: number) {
        // Implemented in MeshBasedEntityMixin
    }

    protected get config(): GameConfig {
        return this.parameters.config;
    }

    protected get collisionModel(): CollisionModel | undefined {
        return this.parameters.collisionModel;
    }

    protected doInit() {
        // Do nothing by default
    }
}

applyMixins(LwoModel, MeshBasedEntityMixin);