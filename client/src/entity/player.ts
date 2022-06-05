import {Object3D, PerspectiveCamera, Vector3} from 'three';
import {Entity} from './entity';
import {Md5Model} from './md5model/md5-model';
import {Fists} from './md5model/weapon/fists';

export class Player extends Object3D implements Entity {
    private readonly _pitchObject: Object3D;
    private readonly weapons = new Map<string, Md5Model>();

    constructor(camera: PerspectiveCamera) {
        super();
        this._pitchObject = new Object3D();
        this._pitchObject.add(camera);
        this.add(this._pitchObject);
    }

    init() {
        const fists = <Fists>this.weapons.get('fists');
        if (fists) {
            fists.enable();
        }
    }

    addWeapon(weapon: Md5Model) {
        this.weapons.set(weapon.name, weapon);
        this._pitchObject.add(weapon);
    }

    update(deltaTime: number): void {
        this.weapons.forEach(weapon => weapon.update(deltaTime));
    }

    move(velocity: Vector3) {
        this.translateX(velocity.x);
        this.translateY(velocity.y);
        this.translateZ(velocity.z);
    }

    get pitchObject(): Object3D {
        return this._pitchObject;
    }
}