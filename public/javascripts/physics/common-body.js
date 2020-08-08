export class CommonBody {
    constructor(collisionModel) {
        this._collisionModel = collisionModel;
        this._position = new THREE.Vector3();
        this._rotation = new THREE.Euler();
        this._positionInitialized = false;
    }

    get collisionModel() {
        return this._collisionModel;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(rotation) {
        this._rotation.copy(rotation);
        for (let i = 0; i < this._collisionModel.bodies.length; i++) {
            const bodyQuaternion = this._collisionModel.bodies[i].quaternion;
            bodyQuaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
        }
        const attachedMeshes = this._collisionModel.attachedMeshes;
        for (let i = 0; i < attachedMeshes.length; i++)
            attachedMeshes[i].rotation.copy(rotation);
    }

    get position() {
        return this._position;
    }

    set position(position) {
        this._position.copy(position);
        for (const body of this._collisionModel.bodies) {
            if (!body.fixedPosition || !this._positionInitialized) {
                body.position.copy(position);
            }
        }
        for (const mesh of this._collisionModel.attachedMeshes) {
            if (!mesh.userData.fixedPosition || !this._positionInitialized) {
                mesh.position.copy(position);
            }
        }
        this._positionInitialized = true;
    }
}
