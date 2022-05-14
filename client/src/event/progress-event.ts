import {BaseEvent} from 'three';

export class ProgressEvent implements BaseEvent {
    static readonly TYPE = 'progress';

    constructor(readonly percentage: number) {
    }

    get type(): string {
        return ProgressEvent.TYPE;
    }
}