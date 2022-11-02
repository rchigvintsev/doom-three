export function applyMixins(derivedCtor: any, ...ctors: any) {
    ctors.forEach((baseCtor: any) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name=> {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
            );
        });
    });
}
