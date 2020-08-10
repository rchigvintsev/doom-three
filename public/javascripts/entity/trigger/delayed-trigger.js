export class DelayedTrigger {
    constructor(name, delay, targets) {
        this._name = name;
        this._delay = delay;
        this._targets = targets;
    }

    activate(gameWorld) {
        const targets = this._collectTargets(gameWorld);
        if (targets.length > 0)
            setTimeout(function () {
                for (let i = 0; i < targets.length; i++) {
                    targets[i].onTriggerEnter();
                }
            }, this._delay * 1000);
    }

    get name() {
        return this._name;
    }

    _collectTargets(gameWorld) {
        const result = [];
        for (let i = 0; i < this._targets.length; i++) {
            const targetName = this._targets[i];
            const target = gameWorld.currentArea.objectByName(targetName);
            if (target) {
                let team = gameWorld.currentArea.teamForObject(target);
                if (!team)
                    team = [target];
                for (let j = 0; j < team.length; j++) {
                    const member = team[j];
                    if (member.onTriggerEnter) {
                        result.push(member);
                    } else {
                        console.warn('Target "' + member.name + '" does not support activation by trigger');
                    }
                }
            }
        }
        return result;
    }
}
