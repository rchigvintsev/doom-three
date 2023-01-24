import {Audio, Intersection, Object3D, PerspectiveCamera, Scene, Vector3} from 'three';

import {random, randomInt} from 'mathjs';

import {TangibleEntity} from '../tangible-entity';
import {Weapon} from '../model/md5/weapon/weapon';
import {PhysicsSystem} from '../../physics/physics-system';
import {PlayerCollisionModel} from '../../physics/player/player-collision-model';
import {GameConfig} from '../../game-config';
import {AttackEvent, WeaponDisableEvent} from '../../event/weapon-events';
import {Fists} from '../model/md5/weapon/fists';
import {Flashlight} from '../model/md5/weapon/flashlight';
import {Pistol} from '../model/md5/weapon/pistol';
import {Shotgun} from '../model/md5/weapon/shotgun';
import {isFirearm} from '../model/md5/weapon/firearm';

const BOBBING_SPEED = 0.1;
const VIEW_BOBBING_MAGNITUDE = 0.002;

let playerResolve: (player: Player) => void = () => undefined;

export class Player extends Object3D implements TangibleEntity {
    static readonly INSTANCE: Promise<Player> = new Promise<Player>((resolve) => playerResolve = resolve);

    readonly tangibleEntity = true;

    private readonly previousMovementDirection = new Vector3();
    private readonly footstepSounds = new Map<Foot, Audio<AudioNode>[]>();
    private readonly jumpSound?: Audio<AudioNode>;
    private readonly landSounds: Audio<AudioNode>[];

    private readonly _pitchObject: Object3D;
    private readonly _movementDirection = new Vector3();

    private lastFootstepSound?: Audio<AudioNode>;
    private lastLandSound?: Audio<AudioNode>;
    private lastFoot = Foot.LEFT;
    private tookOffAt = 0;
    private bobbingAngle = 0;

    private _currentWeapon?: Weapon;
    private _airborne = false;
    private _landedAt = 0;

    constructor(readonly camera: PerspectiveCamera,
                readonly weapons: Map<string, Weapon>,
                sounds: Map<string, Audio<AudioNode>[]>,
                private readonly collisionModel: PlayerCollisionModel,
                private readonly config: GameConfig) {
        super();

        this._pitchObject = new Object3D();
        this._pitchObject.add(this.camera);
        this.add(this._pitchObject);

        this.weapons.forEach(weapon => {
            this._pitchObject.add(weapon);
            weapon.addEventListener(AttackEvent.TYPE, e => this.onWeaponAttack(<AttackEvent><unknown>e));
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

    init() {
        playerResolve(this);
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.collisionModel.register(physicsSystem, scene);
    }

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.collisionModel.unregister(physicsSystem, scene);
    }

    update(deltaTime: number) {
        if (this._currentWeapon) {
            this._currentWeapon.update(deltaTime, this);
        }
        this.collisionModel.update(deltaTime);
        if (!this.config.ghostMode) {
            this.position.copy(this.collisionModel.headPosition);
            if (this.airborne) {
                const now = performance.now();
                const delta = now - this.tookOffAt;
                // We should give player a chance to get off the ground
                if (delta > 100 && this.collisionModel.hasGroundContacts()) {
                    this._airborne = false;
                    this._landedAt = now;
                    this.playLandSound();
                }
            }
        }
    }

    onAttack(_intersection: Intersection, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing for now
    }

    move(velocity: Vector3) {
        if (this.config.ghostMode) {
            this.translateX(velocity.x);
            this.translateY(velocity.y);
            this.translateZ(velocity.z);
        } else {
            this.collisionModel.move(velocity);
            this.playFootstepSound();
            this.updateBobbing();
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

    getCurrentWeapon(): Weapon | undefined {
        return this._currentWeapon;
    }

    get fists(): Fists | undefined {
        return <Fists>this.weapons.get('fists');
    }

    get flashlight(): Flashlight | undefined {
        return <Flashlight>this.weapons.get('flashlight');
    }

    get pistol(): Pistol | undefined {
        return <Pistol>this.weapons.get('pistol');
    }

    get shotgun(): Shotgun | undefined {
        return <Shotgun>this.weapons.get('shotgun');
    }

    enableFists() {
        this.enableWeapon('fists');
    }

    enableFlashlight() {
        this.enableWeapon('flashlight');
    }

    enablePistol() {
        this.enableWeapon('pistol');
    }

    enableShotgun() {
        this.enableWeapon('shotgun');
    }

    reloadWeapon() {
        if (this._currentWeapon && isFirearm(this._currentWeapon)) {
            this._currentWeapon.reload();
        }
    }

    attack() {
        if (this._currentWeapon) {
            this._currentWeapon.attack();
        }
    }

    set origin(origin: Vector3) {
        this.collisionModel.origin = origin;
        this.position.copy(this.collisionModel.headPosition);
    }

    get pitchObject(): Object3D {
        return this._pitchObject;
    }

    get airborne(): boolean {
        return this._airborne;
    }

    get landedAt(): number {
        return this._landedAt;
    }

    get movementDirection(): Vector3 {
        return this._movementDirection;
    }

    set movementDirection(direction: Vector3) {
        this.previousMovementDirection.copy(this._movementDirection);
        this._movementDirection.copy(direction);
    }

    private updateBobbing() {
        if (this._currentWeapon) {
            this.bobbingAngle += BOBBING_SPEED;
            this._pitchObject.rotation.z = Math.sin(this.bobbingAngle) * VIEW_BOBBING_MAGNITUDE;
            this._currentWeapon.updateBobbing(this.bobbingAngle);
        }
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

    private playJumpSound() {
        if (this.jumpSound && !this.jumpSound.isPlaying) {
            this.jumpSound.play();
        }
    }

    private playLandSound() {
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

    private enableWeapon(weaponName: string) {
        const weapon = this.weapons.get(weaponName);
        if (!weapon) {
            console.debug(`Weapon "${weaponName}" is not found and cannot be enabled`);
            return;
        }

        if (this._currentWeapon) {
            if (this._currentWeapon.name === weaponName || !this._currentWeapon.enabled) {
                // Ignore if current weapon is already a requested weapon or player is in process of weapon switching
                return;
            }

            const disableListener = () => {
                if (this._currentWeapon) {
                    this._currentWeapon.removeEventListener(WeaponDisableEvent.TYPE, disableListener);
                }
                this._currentWeapon = weapon;
                weapon.enable();
            };
            this._currentWeapon.addEventListener(WeaponDisableEvent.TYPE, disableListener);
            this._currentWeapon.disable();
            return;
        }

        this._currentWeapon = weapon;
        weapon.enable();
    }

    private onWeaponAttack(e: AttackEvent) {
        this.dispatchEvent(e);
        if (isFirearm(this._currentWeapon)) {
            // Emulate recoil on fire
            this._currentWeapon.recoilTween.onUpdate(rotation => this.camera.rotation.x = rotation.x).start();
        }
    }
}

enum Foot {
    LEFT, RIGHT
}