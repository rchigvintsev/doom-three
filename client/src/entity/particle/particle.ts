import {CustomBlending, Sprite, Vector3} from 'three';
import {SpriteMaterial} from 'three/src/materials/Materials';

import {Tween} from '@tweenjs/tween.js';

import {Entity} from '../entity';
import {isUpdatableMaterial} from '../../material/updatable-material';
import {Player} from '../player/player';

export class Particle extends Sprite implements Entity {
    onShow?: (particle: Particle) => void;
    onHide?: (particle: Particle) => void;

    private readonly gravity = new Vector3();
    private readonly fadeInTween: Tween<any>;

    private showedAt = 0;

    constructor(private readonly parameters: ParticleParameters) {
        super(parameters.material);
        this.visible = false;

        const fadeOutTime = this.parameters.time * this.parameters.fadeOut;
        const hideParticle = () => {
            this.visible = false;
            if (this.onHide) {
                this.onHide(this);
            }
        };
        const scaleTo = parameters.scaleTo;
        const scaleTween = new Tween(this.scale)
            .to({x: scaleTo, y: scaleTo, z: scaleTo}, this.parameters.time);

        if (this.material.blending === CustomBlending) {
            // Change color lightness to show/hide particle smoothly
            const hsl = {h: 0, s: 0, l: 0};
            this.material.color.getHSL(hsl);

            const fadeOutTween = new Tween({l: hsl.l})
                .to({l: 0}, fadeOutTime)
                .delay(this.parameters.time - fadeOutTime)
                .onUpdate(o => this.material.color.setHSL(hsl.h, hsl.s, o.l))
                .onComplete(hideParticle);
            scaleTween.onStart(() => fadeOutTween.start());
            this.fadeInTween = new Tween({l: 0})
                .to({l: hsl.l}, this.parameters.time * this.parameters.fadeIn)
                .onStart(() => scaleTween.start())
                .onUpdate(o => this.material.color.setHSL(hsl.h, hsl.s, o.l));
        } else {
            // Change color opacity to show/hide particle smoothly
            const fadeOutTween = new Tween({opacity: 1})
                .to({opacity: 0}, fadeOutTime)
                .delay(this.parameters.time - fadeOutTime)
                .onUpdate(o => this.material.opacity = o.opacity)
                .onComplete(hideParticle);
            scaleTween.onStart(() => fadeOutTween.start());
            this.fadeInTween = new Tween(this.material)
                .to({opacity: 1}, this.parameters.time * this.parameters.fadeIn)
                .onStart(() => scaleTween.start());
        }
    }

    init() {
        // Do nothing
    }

    update(deltaTime: number) {
        if (this.visible) {
            const now = performance.now();
            const fadeInTime = this.parameters.time * this.parameters.fadeIn;
            if (now - this.showedAt > fadeInTime) {
                this.position.add(this.gravity);
            }

            if (isUpdatableMaterial(this.material)) {
                this.material.update(deltaTime);
            }
        }
    }

    show() {
        Player.INSTANCE.then(player => {
            this.gravity.setScalar(1).applyEuler(player.rotation).multiply(this.parameters.gravity);

            this.material.opacity = 0;
            this.scale.setScalar(this.parameters.scaleFrom);
            this.visible = true;
            this.showedAt = performance.now();
            this.fadeInTween.start();

            if (this.onShow) {
                this.onShow(this);
            }
        });
    }

    get interval(): number {
        return this.parameters.interval;
    }
}

export interface ParticleParameters {
    material?: SpriteMaterial;
    fadeIn: number;
    fadeOut: number;
    interval: number;
    time: number;
    scaleFrom: number;
    scaleTo: number;
    gravity: Vector3;
}