import {Event} from 'three';

export class PointerUnlockEvent implements Event {
    static readonly TYPE = 'pointerUnlock';

    get type(): string {
        return PointerUnlockEvent.TYPE;
    }
}