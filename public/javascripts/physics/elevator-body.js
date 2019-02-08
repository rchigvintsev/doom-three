export class ElevatorBody {
    constructor(collisionModel) {
        this._collisionModel = collisionModel;
        this._position = new THREE.Vector3();
        this._rotation = new THREE.Euler();
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
        for (let i = 0; i < this._collisionModel.bodies.length; i++)
            this._collisionModel.bodies[i].position.copy(position);
        const attachedMeshes = this._collisionModel.attachedMeshes;
        for (let i = 0; i < attachedMeshes.length; i++)
            attachedMeshes[i].position.copy(position);
    }
}