import {SpriteMaterial, Vector3} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {Particle} from './particle';
import {MaterialFactory} from '../../material/material-factory';
import {GameAssets} from '../../game-assets';
import {GameConfig} from '../../game-config';
import {TYPES} from '../../types';

const GRAVITY_FACTOR = 0.015;
const SCALE_FACTOR   = 2;

@injectable()
export class ParticleFactory implements GameEntityFactory<Particle[]> {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.Assets) private readonly assets: GameAssets,
                @inject(TYPES.MaterialFactory) private readonly materialFactory: MaterialFactory) {
    }

    create(particleName: string): Particle[] {
        const particleDef = this.assets.particleDefs.get(particleName);
        if (!particleDef) {
            throw new Error(`Definition of particle "${particleName}" is not found`);
        }
        const materials = this.materialFactory.create(particleDef.material);
        if (!(materials[0] instanceof SpriteMaterial)) {
            throw new Error(`Material "${particleDef.material}" is not SpriteMaterial`);
        }

        const particles: Particle[] = [];
        for (let i = 0; i < particleDef.count; i++) {
            const particleMaterial = materials[0].clone();
            particleMaterial.color.setHex(particleDef.color);

            const worldScale = this.config.worldScale;
            const gravity = new Vector3();
            if (particleDef.gravity) {
                gravity.set(
                    particleDef.gravity[0] * GRAVITY_FACTOR * worldScale,
                    -particleDef.gravity[1] * GRAVITY_FACTOR * worldScale,
                    particleDef.gravity[2] * GRAVITY_FACTOR * worldScale,
                );
            }

            particles.push(new Particle({
                material: particleMaterial,
                fadeIn: particleDef.fadeIn,
                fadeOut: particleDef.fadeOut,
                time: particleDef.time,
                interval: particleDef.interval,
                scaleFrom: particleDef.scale.from * SCALE_FACTOR * worldScale,
                scaleTo: particleDef.scale.to * SCALE_FACTOR * worldScale,
                gravity: gravity
            }));
        }
        return particles;
    }
}
