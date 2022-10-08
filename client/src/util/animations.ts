import {AnimationAction, AnimationClip, AnimationMixer, LoopOnce} from 'three';

export class Animations {
    static createAnimationActions(animationMixer: AnimationMixer,
                                  clips: AnimationClip[]): Map<string, AnimationAction> {
        const actions = new Map<string, AnimationAction>();
        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];
            const action = animationMixer.clipAction(clip);
            if (!clip.name.includes('idle')) {
                action.setLoop(LoopOnce, 1);
            }
            actions.set(clip.name, action);
        }
        return actions;
    }
}