import {Euler, Quaternion, Vector3} from 'three';

import {KeyboardState} from './keyboard-state';
import {PointerLock} from './pointer-lock';
import {Player} from '../entity/player/player';
import {GameConfig} from '../game-config';
import {MouseState} from './mouse-state';

export class FpsControls {
    enabled = false;
    player!: Player;

    private readonly mouseState = new MouseState();
    private readonly keyboardState = new KeyboardState();

    private readonly inputVelocity = new Vector3();
    private readonly direction = new Vector3();

    private readonly e = new Euler();
    private readonly q = new Quaternion();

    private initialized = false;

    constructor(private readonly config: GameConfig, private readonly pointerLock: PointerLock) {
    }

    init() {
        if (!this.initialized) {
            document.addEventListener('mousemove', e => this.onMouseMove(e));
            this.mouseState.init();
            this.keyboardState.init();
            this.initialized = true;
        }
    }

    update() {
        if (!this.activated) {
            return;
        }

        if (!this.player.airborne) {
            let x = 0, y = 0, z = 0;

            if (this.keyboardState.isKeyPressed(KeyboardState.KEY_W)) z--;
            if (this.keyboardState.isKeyPressed(KeyboardState.KEY_S)) z++;
            if (this.keyboardState.isKeyPressed(KeyboardState.KEY_A)) x--;
            if (this.keyboardState.isKeyPressed(KeyboardState.KEY_D)) x++;
            if (this.keyboardState.isKeyPressed(KeyboardState.KEY_SPACE)) y++;

            this.player.movementDirection = this.direction.set(x, y, z);

            if (x !== 0 || z !== 0) {
                if (this.config.ghostMode) {
                    const a = x;
                    const b = -Math.sin(this.player.pitchObject.rotation.x) * z;
                    const c = Math.cos(this.player.pitchObject.rotation.x) * z;
                    this.inputVelocity.set(a, b, c)
                        .normalize()
                        .multiplyScalar(this.config.playerMoveSpeedInGhostMode);
                } else {
                    this.e.y = this.player.rotation.y;
                    this.q.setFromEuler(this.e);
                    this.inputVelocity.set(x, 0, z)
                        .applyQuaternion(this.q)
                        .normalize()
                        .multiplyScalar(this.config.playerMoveSpeed);
                }
                this.player.move(this.inputVelocity);
            }

            if (y !== 0) {
                this.player.jump(this.config.playerJumpSpeed);
            }
        }

        if (this.mouseState.isButtonPressed(MouseState.BUTTON_LEFT))
            this.player.attack();
        else {
            if (this.keyboardState.isKeyPressed(KeyboardState.KEY_G)) {
                this.player.enableFists();
            } else if (this.keyboardState.isKeyPressed(KeyboardState.KEY_F)) {
                this.player.enableFlashlight();
            }
        }
    }

    private onMouseMove(e: MouseEvent) {
        if (!this.activated) {
            return;
        }

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.player.rotation.y -= movementX * this.config.playerLookSpeed;

        const pitchObject = this.player.pitchObject;
        pitchObject.rotation.x -= movementY * this.config.playerLookSpeed;
        pitchObject.rotation.x = Math.max(-1 * Math.PI / 2, Math.min(Math.PI / 2, pitchObject.rotation.x));
    }

    private get activated(): boolean {
        return this.enabled && this.pointerLock.enabled;
    }
}
