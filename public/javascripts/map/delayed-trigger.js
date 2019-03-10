export class DelayedTrigger {
    constructor(name, delay, targets) {
        this._name = name;
        this._delay = delay;
        this._targets = targets;
    }

    activate(gameWorld) {
        const targets = this._collectTargets(gameWorld);
        setTimeout(function () {
            for (let i = 0; i < targets.length; i++)
                targets[i].onTrigger();
        }, this._delay * 1000);
    }

    _collectTargets(gameWorld) {
        const result = [];
        for (let i = 0; i < this._targets.length; i++) {
            const targetName = this._targets[i];
            const target = gameWorld.currentArea.objectByName(targetName);
            if (target) {
                if (target.onTrigger)
                    result.push(target);
                else
                    console.warn('Target "' + targetName + '" does not support activation by trigger');
            }
        }
        return result;
    }
}