import {DelayedTrigger} from './delayed-trigger.js';
import {EntityFactory} from '../entity-factory.js';

export class TriggerFactory extends EntityFactory {
    create(triggerDef) {
        if (triggerDef.type === 'delayed')
            return new DelayedTrigger(triggerDef.name, triggerDef.delay, triggerDef.targets);
        throw 'Unsupported light type: ' + triggerDef.type;
    }
}