import {Intersection, Object3D, PerspectiveCamera, Scene, Vector3} from 'three';

import {random} from 'mathjs';

import {TangibleEntity} from '../tangible-entity';
import {Weapon} from '../model/md5/weapon/weapon';
import {PlayerCollisionModel} from '../../physics/player/player-collision-model';
import {GameConfig} from '../../game-config';
import {AttackEvent, WeaponDisableEvent} from '../../event/weapon-events';
import {Fists} from '../model/md5/weapon/fists';
import {Flashlight} from '../model/md5/weapon/flashlight';
import {Pistol} from '../model/md5/weapon/pistol';
import {Shotgun} from '../model/md5/weapon/shotgun';
import {isFirearm} from '../model/md5/weapon/firearm';
import {Sound} from '../sound/sound';
import {PhysicsManager} from '../../physics/physics-manager';

const BOBBING_SPEED = 0.1;
const VIEW_BOBBING_MAGNITUDE = 0.002;
const LEFT_FOOT = 0;

let playerResolve: (player: Player) => void = () => undefined;

export class Player extends Object3D implements TangibleEntity {
    static readonly INSTANCE: Promise<Player> = new Promise<Player>((resolve) => playerResolve = resolve);

    readonly tangibleEntity = true;

    private readonly previousMovementDirection = new Vector3();

    private readonly _pitchObject: Object3D;
    private readonly _movementDirection = new Vector3();

    private lastFoot = LEFT_FOOT;
    private tookOffAt = 0;
    private bobbingAngle = 0;

    private _currentWeapon?: Weapon;
    private _airborne = false;
    private _landedAt = 0;

    constructor(private readonly parameters: PlayerParameters) {
        super();

        this._pitchObject = new Object3D();
        this._pitchObject.add(parameters.camera);
        this.add(this._pitchObject);

        this.weapons.forEach(weapon => {
            this._pitchObject.add(weapon);
            weapon.addEventListener(AttackEvent.TYPE, e => this.onWeaponAttack(<AttackEvent><unknown>e));
        });
    }

    init() {
        playerResolve(this);
    }

    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.parameters.collisionModel.register(physicsManager, scene);
    }

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.parameters.collisionModel.unregister(physicsManager, scene);
    }

    update(deltaTime: number) {
        if (this._currentWeapon) {
            this._currentWeapon.update(deltaTime, this);
        }
        this.parameters.collisionModel.update(deltaTime);
        if (!this.parameters.config.ghostMode) {
            this.position.copy(this.parameters.collisionModel.headPosition);
            if (this.airborne) {
                const now = performance.now();
                const delta = now - this.tookOffAt;
                // We should give player a chance to get off the ground
                if (delta > 100 && this.parameters.collisionModel.hasGroundContacts()) {
                    this._airborne = false;
                    this._landedAt = now;
                    this.playLandingSound();
                }
            }
        }
    }

    onAttack(_intersection: Intersection, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing for now
    }

    move(velocity: Vector3) {
        if (this.parameters.config.ghostMode) {
            this.translateX(velocity.x);
            this.translateY(velocity.y);
            this.translateZ(velocity.z);
        } else {
            this.parameters.collisionModel.move(velocity);
            this.playFootstepSound();
            this.updateBobbing();
        }
    }

    jump(speed: number) {
        if (!this.parameters.config.ghostMode) {
            this.parameters.collisionModel.jump(speed);
            this.tookOffAt = performance.now();
            this._airborne = true;
            this.playJumpSound();
        }
    }

    get camera(): PerspectiveCamera {
        return this.parameters.camera;
    }

    get weapons(): Map<string, Weapon> {
        return this.parameters.weapons;
    }

    get currentWeapon(): Weapon | undefined {
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
        this.parameters.collisionModel.origin = origin;
        this.position.copy(this.parameters.collisionModel.headPosition);
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
        const footstepSound = this.parameters.sounds.get(this.getFootstepSoundName(this.lastFoot));
        if (this.isMovementDirectionChanged() || !footstepSound?.isPlaying()) {
            const nextFoot = (this.lastFoot + 1) % 2;
            this.parameters.sounds.get(this.getFootstepSoundName(nextFoot))?.play(random(0.1, 0.2));
            this.lastFoot = nextFoot;
        }
    }

    private playJumpSound() {
        this.parameters.sounds.get('jumps')?.play();
    }

    private playLandingSound() {
        this.parameters.sounds.get('landings')?.play();
    }

    private getFootstepSoundName(foot: number): string {
        return foot === LEFT_FOOT ? `footsteps_left` : 'footsteps_right';
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

export interface PlayerParameters {
    camera: PerspectiveCamera;
    weapons: Map<string, Weapon>;
    sounds: Map<string, Sound>;
    collisionModel: PlayerCollisionModel;
    config: GameConfig;
}
