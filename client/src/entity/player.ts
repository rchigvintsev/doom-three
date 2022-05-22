import {Object3D, PerspectiveCamera, Vector3} from 'three';

export class Player extends Object3D {
    private readonly _pitchObject: Object3D;

    constructor(camera: PerspectiveCamera) {
        super();
        this._pitchObject = new Object3D();
        this._pitchObject.add(camera);
        this.add(this._pitchObject);
    }

    get pitchObject(): Object3D {
        return this._pitchObject;
    }

    move(velocity: Vector3) {
        this.translateX(velocity.x);
        this.translateY(velocity.y);
        this.translateZ(velocity.z);
    }
}