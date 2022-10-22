import {Scene, Sprite, Vector2, Vector3} from 'three';
import {SpriteMaterial} from 'three/src/materials/Materials';

import {Tween} from '@tweenjs/tween.js';

import {Entity} from '../entity';
import {PhysicsSystem} from '../../physics/physics-system';
import {Weapon} from '../md5model/weapon/weapon';

export class Particle extends Sprite implements Entity {
    private readonly fadeInTween: Tween<SpriteMaterial>;

    constructor(private readonly parameters: ParticleParameters) {
        super(parameters.material);
        this.visible = false;

        const fadeOutTime = this.parameters.time * this.parameters.fadeOut;
        const fadeOutTween = new Tween({opacity: 1})
            .to({opacity: 0}, fadeOutTime)
            .delay(this.parameters.time - fadeOutTime)
            .onUpdate(o => this.material.opacity = o.opacity)
            .onComplete(() => this.visible = false);

        const scaleTo = parameters.scaleTo;
        const scaleTween = new Tween(this.scale)
            .to({x: scaleTo, y: scaleTo, z: scaleTo}, this.parameters.time)
            .onStart(() => fadeOutTween.start());

        this.fadeInTween = new Tween(this.material)
            .to({opacity: 1}, this.parameters.time * this.parameters.fadeIn)
            .onStart(() => scaleTween.start());
    }

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon) {
        // Do nothing
    }

    registerCollisionModels(_physicsWorld: PhysicsSystem, _scene: Scene) {
        // Do nothing
    }

    update(_deltaTime: number) {
        if (this.visible) {
            this.position.x += this.parameters.gravity.x;
            this.position.y += this.parameters.gravity.y;
        }
    }

    show() {
        this.visible = true;
        this.material.opacity = 0;
        this.scale.setScalar(this.parameters.scaleFrom);
        this.fadeInTween.start();
    }
}

export class ParticleParameters {
    material?: SpriteMaterial;
    fadeIn!: number;
    fadeOut!: number;
    time!: number;
    scaleFrom!: number;
    scaleTo!: number;
    gravity!: Vector2;
}