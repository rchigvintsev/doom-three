import {DelayedTrigger} from '../delayed-trigger.js';

export class TriggerFactory {
    // noinspection JSMethodCanBeStatic
    createTrigger(triggerDef) {
        if (triggerDef.type === 'delayed')
            return new DelayedTrigger(triggerDef.name, triggerDef.delay, triggerDef.targets);
        throw 'Unsupported light type: ' + triggerDef.type;
    }
}