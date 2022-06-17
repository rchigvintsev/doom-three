import {Audio, Object3D, PerspectiveCamera, Scene, Vector3} from 'three';

import {random, randomInt} from 'mathjs';

import {Entity} from '../entity';
import {Fists} from '../md5model/weapon/fists';
import {Weapon} from '../md5model/weapon/weapon';
import {PhysicsWorld} from '../../physics/physics-world';
import {PlayerCollisionModel} from './player-collision-model';
import {GameConfig} from '../../game-config';

export class Player extends Object3D implements Entity {
    private readonly previousMovementDirection = new Vector3();
    private readonly footstepSounds = new Map<Foot, Audio<AudioNode>[]>();
    private readonly jumpSound?: Audio<AudioNode>;
    private readonly landSounds: Audio<AudioNode>[];

    private readonly _pitchObject: Object3D;
    private readonly _movementDirection = new Vector3();

    private currentWeapon?: Weapon;
    private lastFootstepSound?: Audio<AudioNode>;
    private lastLandSound?: Audio<AudioNode>;
    private lastFoot = Foot.LEFT;
    private tookOffAt = 0;
    private landedAt = 0;

    private _airborne = false;

    constructor(camera: PerspectiveCamera,
                readonly weapons: Map<string, Weapon>,
                sounds: Map<string, Audio<AudioNode>[]>,
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

        const footstepSounds = sounds.get('footsteps');
        if (footstepSounds) {
            this.footstepSounds.set(Foot.LEFT, [footstepSounds[0], footstepSounds[1]]);
            this.footstepSounds.set(Foot.RIGHT, [footstepSounds[2], footstepSounds[3]]);
        }
        const jumpSounds = sounds.get('jumps');
        if (jumpSounds) {
            this.jumpSound = jumpSounds[0];
        }
        this.landSounds = sounds.get('landings') || [];
    }

    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene) {
        this.collisionModel.register(physicsWorld, scene);
    }

    update(deltaTime: number) {
        this.weapons.forEach(weapon => weapon.update(deltaTime));
        this.collisionModel.update(deltaTime);
        if (!this.config.ghostMode) {
            this.position.copy(this.collisionModel.headPosition);
            if (this.airborne) {
                const now = performance.now();
                const delta = now - this.tookOffAt;
                // We should give player a chance to get off the ground
                if (delta > 100 && this.collisionModel.hasGroundContacts()) {
                    this._airborne = false;
                    this.landedAt = now;
                    this.playLandSound();
                }
            }
        }
    }

    move(velocity: Vector3) {
        if (this.config.ghostMode) {
            this.translateX(velocity.x);
            this.translateY(velocity.y);
            this.translateZ(velocity.z);
        } else {
            this.collisionModel.move(velocity);
            this.playFootstepSound();
        }
    }

    jump(speed: number) {
        if (!this.config.ghostMode) {
            this.collisionModel.jump(speed);
            this.tookOffAt = performance.now();
            this._airborne = true;
            this.playJumpSound();
        }
    }

    attack() {
        if (this.currentWeapon) {
            this.currentWeapon.attack();
        }
    }

    set origin(origin: Vector3) {
        this.collisionModel.origin = origin;
        this.position.copy(this.collisionModel.headPosition);
    }

    get pitchObject(): Object3D {
        return this._pitchObject;
    }

    get fists(): Fists {
        return <Fists>this.weapons.get('fists');
    }

    get airborne(): boolean {
        return this._airborne;
    }

    set movementDirection(direction: Vector3) {
        this.previousMovementDirection.copy(this._movementDirection);
        this._movementDirection.copy(direction);
    }

    private playFootstepSound() {
        if (this.isMovementDirectionChanged() || !this.lastFootstepSound || !this.lastFootstepSound.isPlaying) {
            const nextFoot = (this.lastFoot + 1) % 2;
            const sounds = this.footstepSounds.get(nextFoot);
            if (sounds) {
                const sound = sounds[randomInt(0, sounds.length)];
                sound.play(random(0.1, 0.2));
                this.lastFootstepSound = sound;
                this.lastFoot = nextFoot;
            }
        }
    }

    playJumpSound() {
        if (this.jumpSound && !this.jumpSound.isPlaying) {
            this.jumpSound.play();
        }
    }

    playLandSound() {
        if (!this.lastLandSound || !this.lastLandSound.isPlaying) {
            const sound = this.landSounds[randomInt(0, this.landSounds.length)];
            sound.play();
            this.lastLandSound = sound;
        }
    }

    private isMovementDirectionChanged() {
        let directionChanged = this._movementDirection.x !== this.previousMovementDirection.x
            && this._movementDirection.x !== 0;
        if (!directionChanged) {
            directionChanged = this._movementDirection.z !== this.previousMovementDirection.z
                && this._movementDirection.z !== 0;
        }
        return directionChanged;
    }
}

enum Foot {
    LEFT, RIGHT
}