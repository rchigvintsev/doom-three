let _instance;

export const SystemType = Object.freeze({
    ANIMATION: 0,
    PHYSICS: 1
});

export class GameContext {
    constructor() {
        if (new.target === GameContext) {
            throw new TypeError("You cannot construct GameContext instance directly");
        }
    }

    static getInstance() {
        return _instance;
    }

    static setInstance(instance) {
        _instance = instance;
    }

    getSystem(systemType) {
        throw new Error('Method "getSystem(systemType)" is not implemented')
    }
}
