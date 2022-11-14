import {degToRad} from 'three/src/math/MathUtils';

import {randomInt} from 'mathjs';

import {Particle} from '../entity/particle/particle';

export class ParticleGroup {
    visible = false;

    onShowParticle?: (particle: Particle) => void;
    onHide?: () => void;

    constructor(readonly name: string, private readonly particles: Particle[]) {
        for (let i = 0; i < this.particles.length; i++){
            const particle = this.particles[i];
            const nextParticle = this.particles[i + 1];

            particle.onShow = () => {
                if (this.onShowParticle) {
                    this.onShowParticle(particle);
                }

                if (nextParticle) {
                    setTimeout(() => nextParticle.show(), nextParticle.interval);
                }
            };

            if (i === this.particles.length - 1) {
                // Hide whole group when last particle is going to be hidden
                particle.onHide = () => {
                    this.visible = false;
                    if (this.onHide) {
                        this.onHide();
                    }
                };
            }
        }
    }

    show() {
        this.rotateParticlesRandomly();
        this.particles[0].show();
        this.visible = true;
    }

    update(deltaTime: number) {
        if (this.visible) {
            for (const particle of this.particles) {
                particle.update(deltaTime);
            }
        }
    }

    private rotateParticlesRandomly() {
        for (const particle of this.particles) {
            particle.material.rotation = degToRad(randomInt(0, 360));
        }
    }
}