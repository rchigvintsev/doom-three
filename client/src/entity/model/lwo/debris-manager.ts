import {inject, injectable} from 'inversify';

import {Debris} from './debris';
import {DebrisFactory} from './debris-factory';
import {GameManager} from '../../../game-manager';
import {PhysicsManager} from '../../../physics/physics-manager';
import {TYPES} from '../../../types';
import {Game} from '../../../game';

@injectable()
export class DebrisManager implements GameManager {
    private readonly allDebrisModels = new Map<string, Debris[]>();
    private readonly availableDebrisModels = new Map<string, Debris[]>();

    constructor(@inject(TYPES.DebrisFactory) private readonly debrisFactory: DebrisFactory,
                @inject(TYPES.PhysicsManager) private readonly physicsManager: PhysicsManager) {
    }

    createDebris(debrisName: string): Debris {
        let debrisModel = this.findAvailableDebrisModel(debrisName);
        if (!debrisModel) {
            debrisModel = this.debrisFactory.create(debrisName);
            debrisModel.onShow = debris => debris.registerCollisionModels(this.physicsManager);
            debrisModel.onHide = debris => {
                debris.unregisterCollisionModels(this.physicsManager);
                this.cacheDebrisModel(this.availableDebrisModels, debrisName, debris);
            };
            Game.getContext().scene.add(debrisModel);
            this.cacheDebrisModel(this.allDebrisModels, debrisName, debrisModel);
            console.debug(`Debris model "${debrisName}" is created`);
        }
        return debrisModel;
    }

    update(deltaTime: number) {
        for (const models of this.allDebrisModels.values()) {
            for (const model of models) {
                model.update(deltaTime);
            }
        }
    }

    private findAvailableDebrisModel(debrisName: string): Debris | undefined {
        const availableModels = this.availableDebrisModels.get(debrisName);
        if (availableModels != undefined && availableModels.length > 0) {
            return availableModels.shift();
        }
        return undefined;
    }

    private cacheDebrisModel(cache: Map<string, Debris[]>, debrisName: string, debrisModel: Debris) {
        let models = cache.get(debrisName);
        if (models == undefined) {
            cache.set(debrisName, models = []);
        }
        models.push(debrisModel);
    }
}