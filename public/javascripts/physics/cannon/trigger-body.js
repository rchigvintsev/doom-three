import {CannonBody} from './cannon-body.js';

export class TriggerBody extends CannonBody {
    constructor(options) {
        super(options);
        this._hasContacts = false;
    }

    update() {
        let hasContacts = false;
        for (const contact of this.world.contacts) {
            if (contact.bi.id === this.id || contact.bj.id === this.id) {
                hasContacts = true;
                break;
            }
        }

        if (hasContacts !== this._hasContacts) {
            this._hasContacts = hasContacts;
            this.dispatchEvent({type: hasContacts ? 'contactStart' : 'contactEnd'});
        }
    }

    get fixedPosition() {
        return true;
    }
}
