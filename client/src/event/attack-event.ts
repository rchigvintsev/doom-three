import {Event} from 'three';

import {Weapon} from '../entity/md5model/weapon/weapon';

export class AttackEvent implements Event {
    static readonly TYPE = 'attack';

    constructor(readonly weapon: Weapon, readonly distance: number, readonly force: number) {
    }

    get type(): string {
        return AttackEvent.TYPE;
    }
}