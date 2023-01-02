import {Mesh, Object3D, Quaternion, Scene, Vector3} from 'three';

import {GameSystem} from '../game-system';
import {DecalFactory} from '../entity/decal/decal-factory';
import {Decal} from '../entity/decal/decal';
import {GameConfig} from '../game-config';

export class DecalSystem implements GameSystem {
    private readonly decalHelper = new Object3D();

    constructor(private readonly config: GameConfig,
                private readonly scene: Scene,
                private readonly decalFactory: DecalFactory) {
        this.scene.add(this.decalHelper);
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

            const normal = decalDef.normal || new Vector3();
            const lookTarget = normal.clone().transformDirection(decalDef.target.matrixWorld).add(decalDef.position);
            this.decalHelper.position.copy(decalDef.position);
            this.decalHelper.lookAt(lookTarget);
            this.decalHelper.position.multiplyScalar(this.config.worldScale);
            const decal = this.decalFactory.create({
                name: decalDef.name,
                target: decalDef.target,
                position: this.decalHelper.position,
                orientation: this.decalHelper.rotation
            });
            decal.onHide = d => this.scene.remove(d);
            console.debug(`Decal with name "${decalDef.name}" is created`);

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
}