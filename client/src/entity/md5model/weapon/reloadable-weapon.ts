export interface ReloadableWeapon {
    reload(): void;
}

export function isReloadableWeapon(weapon: any): weapon is ReloadableWeapon {
    return !!weapon.reload;
}