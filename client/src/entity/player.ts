import {Object3D, PerspectiveCamera, Vector3} from 'three';

import {Entity} from './entity';
import {Fists} from './md5model/weapon/fists';
import {Weapon} from './md5model/weapon/weapon';

export class Player extends Object3D implements Entity {
    private readonly _pitchObject: Object3D;
    private readonly weapons = new Map<string, Weapon>();

    private currentWeapon?: Weapon;

    constructor(camera: PerspectiveCamera) {
        super();
        this._pitchObject = new Object3D();
        this._pitchObject.add(camera);
        this.add(this._pitchObject);
    }

    addWeapon(weapon: Weapon) {
        this.weapons.set(weapon.name, weapon);
        this._pitchObject.add(weapon);
        if (!this.currentWeapon) {
            this.currentWeapon = weapon;
        }
    }

    update(deltaTime: number): void {
        this.weapons.forEach(weapon => weapon.update(deltaTime));
    }

    move(velocity: Vector3) {
        this.translateX(velocity.x);
        this.translateY(velocity.y);
        this.translateZ(velocity.z);
    }

    attack() {
        if (this.currentWeapon) {
            this.currentWeapon.attack();
        }
    }

    get pitchObject(): Object3D {
        return this._pitchObject;
    }

    get fists(): Fists {
        return <Fists>this.weapons.get('fists');
    }
}