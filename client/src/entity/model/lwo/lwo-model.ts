import {Mesh, Quaternion} from 'three';

import {MeshBasedEntity, updateMaterials} from '../../mesh-based-entity';
import {ModelParameters} from '../model-parameters';
import {CollisionModel} from '../../../physics/collision-model';
import {Position} from '../../../util/position';
import {Game} from '../../../game';

export class LwoModel extends Mesh implements MeshBasedEntity {
    private initialized = false;

    constructor(protected readonly parameters: ModelParameters) {
        super(parameters.geometry, parameters.materials);
        const collisionModel = parameters.collisionModel;
        if (collisionModel && collisionModel.hasMass()) {
            collisionModel.onUpdateCallback = (position, quaternion) =>
                this.onCollisionModelUpdate(position, quaternion);
        }
    }

    init() {
        if (!this.initialized) {
            this.doInit();
            this.initialized = true;
        }
    }

    update(deltaTime: number) {
        if (this.visible) {
            if (!Game.getContext().config.renderOnlyWireframe) {
                updateMaterials(this, deltaTime);
            }
            this.collisionModel?.update(deltaTime);
        }
    }

    get collisionModel(): CollisionModel | undefined {
        return this.parameters.collisionModel;
    }

    protected doInit() {
        // Do nothing by default
    }

    private onCollisionModelUpdate(position: Position, quaternion: Quaternion) {
        this.position.set(position.x, position.y, position.z);
        this.quaternion.copy(quaternion);
    }
}
