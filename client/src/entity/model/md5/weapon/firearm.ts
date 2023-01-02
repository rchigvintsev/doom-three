export interface Firearm {
    getAmmoClip(): number;

    getAmmoReserve(): number;

    isLowAmmo(): boolean;

    reload(): void;
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon && weapon.firearm;
}
