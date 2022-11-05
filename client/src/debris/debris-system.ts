import {Scene} from 'three';

import {GameSystem} from '../game-system';
import {Debris} from '../entity/model/lwo/debris';
import {DebrisFactory} from '../entity/model/lwo/debris-factory';
import {PhysicsSystem} from '../physics/physics-system';

export class DebrisSystem implements GameSystem {
    private readonly debrisModels = new Map<string, Debris[]>();
    private readonly availableDebrisModels = new Map<string, Debris[]>();

    constructor(private readonly scene: Scene,
                private readonly debrisFactory: DebrisFactory,
                private readonly physicsSystem: PhysicsSystem) {
    }

    createDebris(debrisName: string): Debris {
        let debrisModel = this.getAvailableDebrisModel(debrisName);
        if (!debrisModel) {
            debrisModel = this.debrisFactory.create(debrisName);
            debrisModel.registerCollisionModels(this.physicsSystem, this.scene);
            debrisModel.onHide = () => this.setAvailableDebrisModel(debrisName, debrisModel!);
            this.scene.add(debrisModel);
            this.setDebrisModel(debrisName, debrisModel);
            console.debug(`Debris model with name "${debrisName}" is created`);
        }
        return debrisModel;
    }

    update(deltaTime: number) {
        for (const models of this.debrisModels.values()) {
            for (const model of models) {
                model.update(deltaTime);
            }
        }
    }

    private getAvailableDebrisModel(debrisName: string): Debris | undefined {
        const availableModels = this.availableDebrisModels.get(debrisName);
        if (availableModels != undefined && availableModels.length > 0) {
            return availableModels.shift();
        }
        return undefined;
    }

    private setAvailableDebrisModel(debrisName: string, debrisModel: Debris) {
        let availableModels = this.availableDebrisModels.get(debrisName);
        if (availableModels == undefined) {
            this.availableDebrisModels.set(debrisName, availableModels = []);
        }
        availableModels.push(debrisModel);
    }

    private setDebrisModel(debrisName: string, debrisModel: Debris) {
        let models = this.debrisModels.get(debrisName);
        if (models == undefined) {
            this.debrisModels.set(debrisName, models = []);
        }
        models.push(debrisModel);
    }
}