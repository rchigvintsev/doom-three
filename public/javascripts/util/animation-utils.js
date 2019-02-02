var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.AnimationUtils = {
        extendAnimationAction: function (action) {
            if (action.__started !== undefined)
                throw 'Attribute "__started" is already defined';
            action.__started = false;

            var $superUpdate = action._update;
            action._update = function (time, deltaTime, timeDirection, accuIndex) {
                $superUpdate.call(this, time, deltaTime, timeDirection, accuIndex);
                if (!this.__started && this._startTime === null && this.getEffectiveWeight() > 0) {
                    this.__started = true;
                    this._mixer.dispatchEvent({type: 'started', action: this});
                }
            };

            var $superReset = action.reset;
            action.reset = function () {
                var result = $superReset.call(this);
                this.__started = false;
                return result;
            };
            return action;
        }
    };
})(DOOM_THREE);

export const AnimationUtils = DOOM_THREE.AnimationUtils;
