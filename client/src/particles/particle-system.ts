import {Scene} from 'three';

import {ParticleFactory} from '../entity/particle/particle-factory';
import {Particle} from '../entity/particle/particle';
import {GameSystem} from '../game-system';

export class ParticleSystem implements GameSystem {
    private readonly particles: Particle[] = [];

    constructor(private readonly scene: Scene, private readonly particleFactory: ParticleFactory) {
    }

    createParticles(particleName: string): Particle[] {
        const particles = this.particleFactory.create(particleName);
        for (const particle of particles) {
            this.scene.add(particle);
            this.particles.push(particle);
        }
        return particles;
    }

    update(deltaTime: number) {
        for (const particle of this.particles) {
            particle.update(deltaTime);
        }
    }
}