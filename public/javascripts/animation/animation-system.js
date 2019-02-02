var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.AnimationSystem = function () {
        this.clock = new THREE.Clock();
        this.animationMixers = [];
    };

    DT.AnimationSystem.prototype = {
        constructor: DT.AnimationSystem,

        registerAnimationMixer: function (animationMixer) {
            this.animationMixers.push(animationMixer);
        },

        update: function () {
            var delta = this.clock.getDelta();
            for (var i = 0; i < this.animationMixers.length; i++)
                this.animationMixers[i].update(delta);
        }
    }
})(DOOM_THREE);

export const AnimationSystem = DOOM_THREE.AnimationSystem;
