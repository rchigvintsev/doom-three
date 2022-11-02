import {LwoModel} from '../lwo-model';
import {ModelParameters} from '../../model-parameters';

export class WeaponShell extends LwoModel {
    constructor(parameters: ModelParameters) {
        super(parameters);
    }

    protected doInit() {
        super.doInit();
        if (this.collisionModel) {
            this.collisionModel.bodies[0].addEventListener('collide', (e: any) => {
                const relativeVelocity = e.contact.getImpactVelocityAlongNormal();
                if (Math.abs(relativeVelocity) > 0.5) {
                    // Play bounce sound
                }
            });
        }
    }
}