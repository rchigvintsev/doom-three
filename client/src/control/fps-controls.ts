import {Vector3} from 'three';

import {KeyboardState} from './keyboard-state';
import {PointerLock} from './pointer-lock';
import {Player} from '../entity/player';
import {GameConfig} from '../game-config';
import {PointerLockEvent} from '../event/pointer-lock-event';
import {PointerUnlockEvent} from '../event/pointer-unlock-event';

export class FpsControls {
    enabled = false;

    private readonly keyboardState = new KeyboardState();
    private readonly inputVelocity = new Vector3();

    private initialized = false;

    constructor(private readonly config: GameConfig,
                private readonly player: Player,
                private readonly pointerLock: PointerLock) {
    }

    init() {
        if (!this.initialized) {
            document.addEventListener('mousemove', e => this.onMouseMove(e));
            this.keyboardState.init();
            this.pointerLock.addEventListener(PointerLockEvent.TYPE, () => this.onPointerLock());
            this.pointerLock.addEventListener(PointerUnlockEvent.TYPE, () => this.onPointerUnlock());
            this.initialized = true;
        }
    }

    update() {
        if (!this.enabled) {
            return;
        }

        let x = 0, z = 0;

        if (this.keyboardState.isKeyPressed(KeyboardState.KEY_W)) z--;
        if (this.keyboardState.isKeyPressed(KeyboardState.KEY_S)) z++;
        if (this.keyboardState.isKeyPressed(KeyboardState.KEY_A)) x--;
        if (this.keyboardState.isKeyPressed(KeyboardState.KEY_D)) x++;

        if (x !== 0 || z !== 0) {
            const a = x;
            const b = -Math.sin(this.player.pitchObject.rotation.x) * z;
            const c = Math.cos(this.player.pitchObject.rotation.x) * z;
            this.inputVelocity.set(a, b, c).normalize().multiplyScalar(this.config.playerMoveSpeed);
            this.player.move(this.inputVelocity);
        }
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.enabled) {
            return;
        }

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.player.rotation.y -= movementX * this.config.playerLookSpeed;

        const pitchObject = this.player.pitchObject;
        pitchObject.rotation.x -= movementY * this.config.playerLookSpeed;
        pitchObject.rotation.x = Math.max(-1 * Math.PI / 2, Math.min(Math.PI / 2, pitchObject.rotation.x));
    }

    private onPointerLock() {
        this.enabled = true;
    }

    private onPointerUnlock() {
        this.enabled = false;
    }
}
