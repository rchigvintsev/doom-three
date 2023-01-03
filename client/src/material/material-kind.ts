export enum MaterialKind {
    METAL = 'metal', CARDBOARD = 'cardboard'
}

export function parseMaterialKind(value?: string): MaterialKind {
    if (value === MaterialKind.CARDBOARD) {
        return MaterialKind.CARDBOARD;
    }
    // Use metal by default since most of the objects on the scene are metallic
    return MaterialKind.METAL;
}