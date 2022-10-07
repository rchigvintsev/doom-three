import {BufferGeometry, MeshBasicMaterial, SkinnedMesh} from 'three';
import {CustomAnimationMixer} from '../../animation/custom-animation-mixer';

export class Md5ModelWireframeHelper extends SkinnedMesh {
    private animationMixer?: CustomAnimationMixer;
    private initialized = false;

    constructor(geometry: BufferGeometry) {
        super(geometry, new MeshBasicMaterial({wireframe: true}));
    }

    init() {
        if (!this.initialized) {
            if (this.animations) {
                this.animationMixer = new CustomAnimationMixer(this);
            }
            this.initialized = true;
        }
    }

    update(deltaTime: number) {
        if (this.animationMixer) {
            this.animationMixer.update(deltaTime);
        }
    }

    animateCrossFade(startActionName: string, endActionName: string, duration: number) {
        if (this.animationMixer) {
            this.animationMixer.crossFade(startActionName, endActionName, duration);
        }
    }

    animateCrossFadeAsync(startActionName: string,
                          endActionName: string,
                          fadeOutDuration: number,
                          fadeInDuration: number) {
        if (this.animationMixer) {
            this.animationMixer.crossFadeAsync(startActionName, endActionName, fadeOutDuration, fadeInDuration);
        }
    }

    animateCrossFadeDelayed(startActionName: string, endActionName: string, delay: number, duration?: number) {
        if (this.animationMixer) {
            this.animationMixer.crossFadeDelayed(startActionName, endActionName, delay, duration);
        }
    }
}