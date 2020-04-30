export class AnimationSystem {
    constructor() {
        this._clock = new THREE.Clock();
        this._animationMixers = [];
    }

    registerAnimationMixer(animationMixer) {
        this._animationMixers.push(animationMixer);
    }

    update() {
        const delta = this._clock.getDelta();
        for (let i = 0; i < this._animationMixers.length; i++) {
            this._animationMixers[i].update(delta);
        }
    }
}
