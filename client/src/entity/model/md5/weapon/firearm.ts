import {Weapon} from './weapon';

export abstract class Firearm extends Weapon {
    abstract getAmmoClip(): number;

    abstract getAmmoReserve(): number;

    abstract isLowAmmo(): boolean;

    abstract reload(): void;
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon instanceof Firearm;
}
