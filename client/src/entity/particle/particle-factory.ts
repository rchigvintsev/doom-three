import {SpriteMaterial, Vector2} from 'three';
import {degToRad} from 'three/src/math/MathUtils';

import {randomInt} from 'mathjs';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {Particle} from './particle';
import {MaterialFactory} from '../../material/material-factory';

const GRAVITY_FACTOR = 0.015;
const SCALE_FACTOR   = 2;

export class ParticleFactory implements EntityFactory<Particle[]> {
    constructor(private readonly parameters: ParticleFactoryParameters) {
    }

    create(particleName: string): Particle[] {
        const particleDef = this.parameters.particleDefs.get(particleName);
        if (!particleDef) {
            throw new Error(`Definition of particle "${particleName}" is not found`);
        }
        const materials = this.parameters.materialFactory.create(particleDef.material);
        if (!(materials[0] instanceof SpriteMaterial)) {
            throw new Error(`Material "${particleDef.material}" is not SpriteMaterial`);
        }

        const particles: Particle[] = [];
        for (let i = 0; i < particleDef.count; i++) {
            const particleMaterial = materials[0].clone();
            particleMaterial.rotation = degToRad(randomInt(0, 360));
            particleMaterial.color.setHex(particleDef.color);

            const worldScale = this.parameters.config.worldScale;
            const gravity = new Vector2(
                particleDef.gravity[0] * GRAVITY_FACTOR * worldScale,
                -particleDef.gravity[1] * GRAVITY_FACTOR * worldScale
            );

            particles.push(new Particle({
                material: particleMaterial,
                fadeIn: particleDef.fadeIn,
                fadeOut: particleDef.fadeOut,
                time: particleDef.time,
                interval: particleDef.interval,
                scaleFrom: particleDef.size.from * SCALE_FACTOR * worldScale,
                scaleTo: particleDef.size.to * SCALE_FACTOR * worldScale,
                gravity: gravity
            }));
        }
        return particles;
    }
}

export class ParticleFactoryParameters extends EntityFactoryParameters {
    particleDefs!: Map<string, any>;
    materialFactory!: MaterialFactory;
}