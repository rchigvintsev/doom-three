import {Mesh, Object3D, Quaternion, Vector3} from 'three';

import {inject, injectable} from 'inversify';

import {GameManager} from '../../game-manager';
import {TYPES} from '../../types';
import {DecalFactory} from './decal-factory';
import {Decal} from './decal';
import {Game} from '../../game';

@injectable()
export class DecalManager implements GameManager {
    private _decalHelper: Object3D | undefined;

    constructor(@inject(TYPES.DecalFactory) private readonly decalFactory: DecalFactory) {
    }

    createDecal = (() => {
        const targetPosition = new Vector3();
        const targetQuaternion = new Quaternion();

        return (decalDef: { name: string, target: Mesh, position: Vector3, normal?: Vector3 }): Decal => {
            // Save target position and rotation
            targetPosition.copy(decalDef.target.position);
            targetQuaternion.copy(decalDef.target.quaternion);

            // Reset target position and rotation otherwise DecalGeometry won't be able to clip faces correctly
            decalDef.target.position.setScalar(0);
            decalDef.target.rotation.set(0, 0, 0);
            decalDef.target.updateMatrixWorld();

            const context = Game.getContext();

            const normal = decalDef.normal || new Vector3();
            const lookTarget = normal.clone().transformDirection(decalDef.target.matrixWorld).add(decalDef.position);
            this.decalHelper.position.copy(decalDef.position);
            this.decalHelper.lookAt(lookTarget);
            this.decalHelper.position.multiplyScalar(context.config.worldScale);
            const decal = this.decalFactory.create({
                name: decalDef.name,
                target: decalDef.target,
                position: this.decalHelper.position,
                orientation: this.decalHelper.rotation
            });
            decal.onHide = d => context.scene.remove(d);
            console.debug(`Decal "${decalDef.name}" is created`);

            decalDef.target.add(decal);

            // Restore target position and rotation
            decalDef.target.position.copy(targetPosition);
            decalDef.target.quaternion.copy(targetQuaternion);
            decalDef.target.updateMatrixWorld();

            return decal;
        };
    })();

    update(_deltaTime: number) {
        // Do nothing
    }

    private get decalHelper(): Object3D {
        if (!this._decalHelper) {
            this._decalHelper = new Object3D();
            Game.getContext().scene.add(this._decalHelper);
        }
        return this._decalHelper;
    }
}