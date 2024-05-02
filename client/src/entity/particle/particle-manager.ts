import {inject, injectable} from 'inversify';

import {ParticleFactory} from './particle-factory';
import {ParticleGroup} from './particle-group';
import {GameManager} from '../../game-manager';
import {TYPES} from '../../types';
import {Game} from '../../game';

@injectable()
export class ParticleManager implements GameManager {
    private readonly particleGroups = new Map<string, ParticleGroup[]>();
    private readonly availableParticleGroups = new Map<string, ParticleGroup[]>();

    constructor(@inject(TYPES.ParticleFactory) private readonly particleFactory: ParticleFactory) {
    }

    createParticles(particleName: string): ParticleGroup {
        let particleGroup = this.getAvailableParticleGroup(particleName);
        if (!particleGroup) {
            const particles = this.particleFactory.create(particleName);
            for (const particle of particles) {
                Game.getContext().scene.add(particle);
            }

            particleGroup = new ParticleGroup(particleName, particles);
            particleGroup.onHide = () => this.setAvailableParticleGroup(particleName, particleGroup!);
            this.setParticleGroup(particleName, particleGroup);

            console.debug(`Group of particles "${particleName}" is created`);
        }
        return particleGroup;
    }

    update(deltaTime: number) {
        for (const groups of this.particleGroups.values()) {
            for (const group of groups) {
                group.update(deltaTime);
            }
        }
    }

    private getAvailableParticleGroup(particleName: string): ParticleGroup | undefined {
        const availableGroups = this.availableParticleGroups.get(particleName);
        if (availableGroups != undefined && availableGroups.length > 0) {
            return availableGroups.shift();
        }
        return undefined;
    }

    private setAvailableParticleGroup(particleName: string, particleGroup: ParticleGroup) {
        let availableGroups = this.availableParticleGroups.get(particleName);
        if (availableGroups == undefined) {
            this.availableParticleGroups.set(particleName, availableGroups = []);
        }
        availableGroups.push(particleGroup);
    }

    private setParticleGroup(particleName: string, particleGroup: ParticleGroup) {
        let groups = this.particleGroups.get(particleName);
        if (groups == undefined) {
            this.particleGroups.set(particleName, groups = []);
        }
        groups.push(particleGroup);
    }
}