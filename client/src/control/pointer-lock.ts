import {EventDispatcher} from 'three';
import {PointerLockEvent} from '../event/pointer-lock-event';
import {PointerUnlockEvent} from '../event/pointer-unlock-event';

export class PointerLock extends EventDispatcher {
    enabled = false;

    private readonly pointerLockChangeEventListener = () => this.onPointerLockChange();
    private readonly pointerLockErrorEventListener = () => this.onPointerLockError();

    constructor(private readonly target: HTMLElement) {
        super();
    }

    init() {
        this.target.addEventListener('auxclick', () => this.request());
    }

    request() {
        if (this.enabled) {
            return;
        }
        this.attachPointerLockEventListeners();
        this.target.requestPointerLock();
    }

    private onPointerLockChange() {
        if (document.pointerLockElement === this.target) {
            this.enabled = true;
            this.dispatchEvent(new PointerLockEvent());
        } else {
            this.enabled = false;
            this.detachPointerLockEventListeners();
            this.dispatchEvent(new PointerUnlockEvent());
        }
    }

    private onPointerLockError() {
        // Do nothing
    }

    private attachPointerLockEventListeners() {
        document.addEventListener('pointerlockchange', this.pointerLockChangeEventListener);
        document.addEventListener('pointerlockerror', this.pointerLockErrorEventListener);
    }

    private detachPointerLockEventListeners() {
        document.removeEventListener('pointerlockchange', this.pointerLockChangeEventListener);
        document.removeEventListener('pointerlockerror', this.pointerLockErrorEventListener);
    }
}
