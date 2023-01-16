import {Euler, Intersection, Mesh, Vector3} from 'three';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';
import {Player} from '../../../player/player';
import {WeaponDisableEvent} from '../../../../event/weapon-events';

const BOBBING_MAGNITUDE_X = 0.40;
const BOBBING_MAGNITUDE_Y = 0.40;
const ACCELERATION_MAX_LOG_LENGTH = 16;
const WEAPON_OFFSET_TIME = 500;
const LAND_OFFSET = -8;
const LAND_DEFLECT_TIME = 150;
const LAND_RETURN_TIME = 300;

export abstract class Weapon extends Md5Model {
    enabled = false;

    protected readonly acceleration = new Acceleration();

    private readonly origin = new Vector3();
    private readonly bobbingOffset = new Vector3();
    private readonly previousDirection = new Vector3();

    private readonly v = new Vector3(0, 1, 0);
    private readonly e = new Euler();

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
        this.visible = false;
    }

    update(deltaTime: number, player?: Player) {
        super.update(deltaTime);
        this.updateState();
        // Deferred visibility change to prevent weapon flickering when enabled
        if (this.enabled && !this.visible) {
            this.visible = true;
        }
        if (!this.config.ghostMode && player) {
            this.updateAcceleration(player.movementDirection);
            this.drop(player.landedAt, player.pitchObject.rotation.x * -1);
        }
    }

    updateBobbing(angle: number) {
        const x = Math.sin(angle) * BOBBING_MAGNITUDE_X;
        const y = -Math.abs(Math.sin(angle) * BOBBING_MAGNITUDE_Y);
        this.bobbingOffset.set(x, y, 0).multiplyScalar(this.config.worldScale);
        this.position.addVectors(this.origin, this.acceleration.offset).add(this.bobbingOffset);
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.startAnimationFlow('enable');
            this.changeState(WeaponState.RAISING);
            // Weapon visibility will be changed on next rendering step
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.startAnimationFlow('disable');
            this.changeState(WeaponState.LOWERING);
            // Weapon visibility will be changed on "put_away" animation finish
        }
    }

    abstract attack(): void;

    /**
     * Called when this weapon hit some target during the attack.
     *
     * @param target target mesh that was hit during the attack
     * @param intersection intersection of ray cast from this weapon with target mesh
     */
    abstract onHit(target: Mesh, intersection: Intersection): void;

    /**
     * Called when this weapon misses during the attack.
     */
    abstract onMiss(): void;

    protected doInit() {
        super.doInit();
        this.origin.copy(this.position);
    }

    protected updateState() {
        switch (this.currentState) {
            case WeaponState.RAISING:
                if (!this.isAnyAnimationRunning('raise')) {
                    this.changeState(WeaponState.IDLE);
                }
                break;
            case WeaponState.LOWERING:
                if (!this.isAnyAnimationRunning('lower')) {
                    this.changeState(WeaponState.INACTIVE);
                }
                break;
        }
    }

    protected changeState(newState: string) {
        super.changeState(newState);
        if (newState === WeaponState.INACTIVE) {
            this.visible = false;
            this.dispatchEvent(new WeaponDisableEvent(this));
        }
    }

    protected updateAcceleration(direction: Vector3) {
        if (direction.x !== this.previousDirection.x) {
            this.logAcceleration(direction.x - this.previousDirection.x, 0, 0);
        }
        if (direction.y > this.previousDirection.y) {
            this.logAcceleration(0, direction.y - this.previousDirection.y, 0);
        }
        if (direction.z !== this.previousDirection.z) {
            this.logAcceleration(0, 0, direction.z - this.previousDirection.z);
        }

        this.previousDirection.copy(direction);
        this.acceleration.offset.set(0, 0, 0);

        let stop = this.acceleration.logLength - ACCELERATION_MAX_LOG_LENGTH;
        if (stop < 0) {
            stop = 0;
        }
        const now = performance.now();
        for (let i = this.acceleration.logLength - 1; i >= stop; i--) {
            const acceleration = this.acceleration.log[i % ACCELERATION_MAX_LOG_LENGTH];
            const t = now - acceleration.time;
            if (t >= WEAPON_OFFSET_TIME) {
                break;	// Remainder is too old to care about
            }
            let f = t / WEAPON_OFFSET_TIME;
            f = (Math.cos(f * 2.0 * Math.PI) - 1.0) * 0.5 * this.config.worldScale;

            this.acceleration.offset.x += f * acceleration.direction.x;
            this.acceleration.offset.y += f * acceleration.direction.y;
            this.acceleration.offset.z += f * acceleration.direction.z;
        }
        this.position.addVectors(this.origin, this.bobbingOffset).add(this.acceleration.offset);
    }

    protected drop(time: number, rotationX: number): Vector3 | undefined {
        const delta = performance.now() - time;
        if (delta < LAND_DEFLECT_TIME + LAND_RETURN_TIME) {
            this.v.set(0, 1, 0);
            this.e.x = rotationX;
            this.v.applyEuler(this.e);
            let f;
            if (delta < LAND_DEFLECT_TIME) {
                f = LAND_OFFSET * 0.25 * delta / LAND_DEFLECT_TIME;
            } else {
                f = LAND_OFFSET * 0.25 * (LAND_DEFLECT_TIME + LAND_RETURN_TIME - delta) / LAND_RETURN_TIME;
            }
            this.v.multiplyScalar(f).multiplyScalar(this.config.worldScale);
            this.position.add(this.v);
            return this.v;
        }
        return undefined;
    }

    private logAcceleration(x: number, y: number, z: number) {
        const accelerationIndex = this.acceleration.logLength % ACCELERATION_MAX_LOG_LENGTH;
        let acceleration = this.acceleration.log[accelerationIndex];
        this.acceleration.logLength++;
        if (!acceleration) {
            acceleration = {direction: new Vector3(), time: 0};
            this.acceleration.log[accelerationIndex] = acceleration;
        }
        acceleration.time = performance.now();
        acceleration.direction.set(x, y, z);
    }
}

export class WeaponState extends Md5ModelState {
    static readonly RAISING = 'raising';
    static readonly IDLE = 'idle';
    static readonly LOWERING = 'lowering';
}

class Acceleration {
    offset = new Vector3();
    log: {direction: Vector3, time: number}[] = [];
    logLength = 0;

    copy(other: Acceleration): Acceleration {
        this.offset.copy(other.offset);
        this.log.length = 0;
        for (const item of other.log) {
            this.log.push({direction: item.direction.clone(), time: item.time});
        }
        this.logLength = other.logLength;
        return this;
    }
}