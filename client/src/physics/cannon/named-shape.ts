export interface NamedShape {
    get name(): string | undefined;
}

export function isNamedShape(shape: any): shape is NamedShape {
    return shape && shape.namedShape;
}
