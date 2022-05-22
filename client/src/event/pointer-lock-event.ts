import {Event} from 'three';

export class PointerLockEvent implements Event {
    static readonly TYPE = 'pointerLock';

    get type(): string {
        return PointerLockEvent.TYPE;
    }
}