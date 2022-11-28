export interface Firearm {
    ammo(): number;

    totalAmmo(): number;

    reload(): void;
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon && !!weapon.ammo && !!weapon.totalAmmo && !!weapon.reload;
}
