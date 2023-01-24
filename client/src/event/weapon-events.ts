import {Event, Vector2} from 'three';

import {Weapon} from '../entity/model/md5/weapon/weapon';

export class AttackEvent implements Event {
    static readonly TYPE = 'attack';

    constructor(readonly weapon: Weapon,
                readonly distance: number,
                readonly force: number,
                readonly coords: Vector2[] = []) {
    }

    get type(): string {
        return AttackEvent.TYPE;
    }
}

export class WeaponDisableEvent implements Event {
    static readonly TYPE = 'weaponDisable';

    constructor(readonly weapon: Weapon) {
    }

    get type(): string {
        return WeaponDisableEvent.TYPE;
    }
}