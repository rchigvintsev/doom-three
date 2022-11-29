export interface Firearm {
    getAmmo(): number;

    getAmmoReserve(): number;

    reload(): void;
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon && !!weapon.getAmmo && !!weapon.getAmmoReserve && !!weapon.reload;
}
