import {Event} from 'three';

export class ProgressEvent implements Event {
    static readonly TYPE = 'progress';

    constructor(readonly total: number, readonly loaded: number) {
    }

    get type(): string {
        return ProgressEvent.TYPE;
    }
}
