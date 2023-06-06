import {Matrix4, Mesh, MeshNormalMaterial, SkinnedMesh, SphereGeometry, Vector3} from 'three';

export class SkeletonJointHelper {
    logJointPositions = false;

    private readonly jointHelpers = new Map<string, Mesh>();

    constructor(private readonly parent: SkinnedMesh, boneFilter?: (boneName: string) => boolean) {
        const helperGeometry = new SphereGeometry(1);
        const helperMaterial = new MeshNormalMaterial();
        helperMaterial.depthTest = false;
        helperMaterial.depthWrite = false;

        for (const bone of parent.skeleton.bones) {
            if (!boneFilter || boneFilter(bone.name)) {
                const helper = new Mesh(helperGeometry, helperMaterial);
                parent.add(helper);
                this.jointHelpers.set(bone.name, helper);
            }
        }
    }

    update = (() => {
        const bonePosition = new Vector3();
        const boneMatrix = new Matrix4();

        return () => {
            for (const bone of this.parent.skeleton.bones) {
                const helper = this.jointHelpers.get(bone.name);
                if (helper) {
                    bonePosition.setFromMatrixPosition(boneMatrix.identity().multiply(bone.matrixWorld));
                    if (this.logJointPositions) {
                        console.log(`Joint "${bone.name}": `
                            + `position = [${bonePosition.x}, ${bonePosition.y}, ${bonePosition.z}]`);
                    }
                    helper.position.copy(this.parent.worldToLocal(bonePosition));
                }
            }
        };
    })();
}