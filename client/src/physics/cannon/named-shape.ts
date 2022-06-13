export interface NamedShape {
    get name(): string | undefined;
}

export function isNamedShape(shape: object): shape is NamedShape {
    return (shape as NamedShape).name != undefined;
}
