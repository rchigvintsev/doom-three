import {KeyboardState} from './keyboard-state.js';
import {MouseState} from './mouse-state.js';
import {Settings} from '../settings.js';

const LOOK_SPEED = 0.002;
const MOVE_SPEED = 1.8;
const MOVE_SPEED_IN_GHOST_MODE = 0.05;
const JUMP_SPEED = 3.2;

export class FPSControls {
    constructor(camera, player) {
        this.enabled = false;
        this.pointerLockEnabled = false;

        this.player = player; // Player itself will be a yaw object
        player.pitchObject.add(camera);

        this.keyboardState = new KeyboardState();
        this.mouseState = new MouseState();
        this.canvas = $(document).find('#game_canvas')[0];

        this.attachMouseEventHandlers();
    }

    attachMouseEventHandlers() {
        $(document).on('mousemove.doom-three.fps-controls', $.proxy(this.onMouseMove, this));
        $(this.canvas).mousedown($.proxy(this.onMouseDown, this));
    }

    requestPointerLock() {
        if (this.pointerLockEnabled)
            return;
        this.attachPointerLockEventHandlers();
        this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
            this.canvas.msRequestPointerLock ||
            this.canvas.mozRequestPointerLock ||
            this.canvas.webkitRequestPointerLock;
        this.canvas.requestPointerLock();
    }

    attachPointerLockEventHandlers() {
        const pointerlockchangeHandler = $.proxy(this.onPointerLockChange, this);
        const pointerlockerrorHandler = $.proxy(this.onPointerLockError, this);

        const $document = $(document);

        $document.on('pointerlockchange.doom-three.fps-controls', pointerlockchangeHandler);
        $document.on('mozpointerlockchange.doom-three.fps-controls', pointerlockchangeHandler);
        $document.on('webkitpointerlockchange.doom-three.fps-controls', pointerlockchangeHandler);

        $document.on('pointerlockerror.doom-three.fps-controls', pointerlockerrorHandler);
        $document.on('mozpointerlockerror.doom-three.fps-controls', pointerlockerrorHandler);
        $document.on('webkitpointerlockerror.doom-three.fps-controls', pointerlockerrorHandler);
    }

    // noinspection JSMethodCanBeStatic
    detachPointerLockEventHandlers() {
        const $document = $(document);

        $document.off('pointerlockchange.doom-three.fps-controls');
        $document.off('mozpointerlockchange.doom-three.fps-controls');
        $document.off('webkitpointerlockchange.doom-three.fps-controls');

        $document.off('pointerlockerror.doom-three.fps-controls');
        $document.off('mozpointerlockerror.doom-three.fps-controls');
        $document.off('webkitpointerlockerror.doom-three.fps-controls');
    }

    onPointerLockChange() {
        if (document.pointerLockElement === this.canvas ||
            document.msPointerLockElement === this.canvas ||
            document.mozPointerLockElement === this.canvas ||
            document.webkitPointerLockElement === this.canvas) {
            this.enabled = true;
            this.pointerLockEnabled = true;
        } else {
            this.pointerLockEnabled = false;
            this.enabled = false;
            this.detachPointerLockEventHandlers();
        }
    }

    onPointerLockError(e) {
        // Do nothing
    }

    onMouseMove(e) {
        if (!this.enabled)
            return;

        const original = e.originalEvent;

        // webkitMovementX/webkitMovementY is deprecated
        const movementX = original.movementX || original.mozMovementX || 0;
        const movementY = original.movementY || original.mozMovementY || 0;

        this.player.rotation.y -= movementX * LOOK_SPEED;
        this.player.pitchObject.rotation.x -= movementY * LOOK_SPEED;
        this.player.pitchObject.rotation.x = Math.max(-1 * Math.PI / 2,
            Math.min(Math.PI / 2, this.player.pitchObject.rotation.x));
    }

    onMouseDown(e) {
        if (e.which === MouseState.MouseButton.RIGHT)
            this.requestPointerLock();
    }
}

FPSControls.prototype.update = function () {
    const inputVelocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const e = new THREE.Euler();
    const q = new THREE.Quaternion();

    return function () {
        if (!this.enabled || this.player.airborne)
            return;

        let x = 0, y = 0, z = 0;

        if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.W)) z--;
        if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.S)) z++;
        if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.A)) x--;
        if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.D)) x++;

        if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.SPACE)) y++;

        this.player.movementDirection = direction.set(x, y, z);

        if (x !== 0 || z !== 0) {
            if (Settings.ghostMode) {
                const a = x;
                const b = -Math.sin(this.player.pitchObject.rotation.x) * z;
                const c = Math.cos(this.player.pitchObject.rotation.x) * z;
                inputVelocity.set(a, b, c).normalize().multiplyScalar(MOVE_SPEED_IN_GHOST_MODE);
            } else {
                e.y = this.player.rotation.y;
                q.setFromEuler(e);
                inputVelocity.set(x, 0, z).applyQuaternion(q).normalize().multiplyScalar(MOVE_SPEED);
            }
            this.player.walk(inputVelocity);
        }

        if (y !== 0 && !Settings.ghostMode)
            this.player.jump(JUMP_SPEED);

        if (this.mouseState.isButtonPressed(MouseState.MouseButton.LEFT))
            this.player.attack();
        else {
            if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.F))
                this.player.enableFlashlight();
            else if (this.keyboardState.isKeyPressed(KeyboardState.KeyCode.G))
                this.player.enableFists();
        }
    }
}();