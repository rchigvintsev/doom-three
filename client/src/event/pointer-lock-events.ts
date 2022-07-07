import {Event} from 'three';

export class PointerLockEvent implements Event {
    static readonly TYPE = 'pointerLock';

    get type(): string {
        return PointerLockEvent.TYPE;
    }
}

export class PointerUnlockEvent implements Event {
    static readonly TYPE = 'pointerUnlock';

    get type(): string {
        return PointerUnlockEvent.TYPE;
    }
}
