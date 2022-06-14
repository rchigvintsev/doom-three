import {Object3D, PerspectiveCamera, Scene, Vector3} from 'three';

import {Entity} from '../entity';
import {Fists} from '../md5model/weapon/fists';
import {Weapon} from '../md5model/weapon/weapon';
import {PhysicsWorld} from '../../physics/physics-world';
import {PlayerCollisionModel} from './player-collision-model';
import {GameConfig} from '../../game-config';

export class Player extends Object3D implements Entity {
    private readonly _pitchObject: Object3D;

    private currentWeapon?: Weapon;

    constructor(camera: PerspectiveCamera,
                readonly weapons: Map<string, Weapon>,
                private readonly collisionModel: PlayerCollisionModel,
                private readonly config: GameConfig) {
        super();

        this._pitchObject = new Object3D();
        this._pitchObject.add(camera);
        this.add(this._pitchObject);

        this.weapons.forEach(weapon => {
            this._pitchObject.add(weapon);
            if (!this.currentWeapon) {
                this.currentWeapon = weapon;
            }
        });
    }

    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene) {
        this.collisionModel.register(physicsWorld, scene);
    }

    update(deltaTime: number) {
        this.weapons.forEach(weapon => weapon.update(deltaTime));
        this.collisionModel.update(deltaTime);
        if (!this.config.ghostMode) {
            this.position.copy(this.collisionModel.headPosition);
        }
    }

    set origin(origin: Vector3) {
        this.collisionModel.origin = origin;
        this.position.copy(this.collisionModel.headPosition);
    }

    move(velocity: Vector3) {
        if (this.config.ghostMode) {
            this.translateX(velocity.x);
            this.translateY(velocity.y);
            this.translateZ(velocity.z);
        } else {
            this.collisionModel.move(velocity);
        }
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