import {Light, PointLight, SpotLight} from 'three';

import {EntityFactory} from '../entity-factory';
import {GameConfig} from '../../game-config';

// noinspection JSMethodCanBeStatic
export class LightFactory implements EntityFactory<Light> {
    constructor(private readonly config: GameConfig) {
    }

    create(lightDef: any): Light {
        const light = this.createLight(lightDef, lightDef.distance * this.config.worldScale);
        light.name = lightDef.name;
        light.position.fromArray(lightDef.position).multiplyScalar(this.config.worldScale);
        light.castShadow = lightDef.castShadow;
        return light;
    }

    private createLight(lightDef: any, lightDistance: number): PointLight | SpotLight {
        if (lightDef.type === 'point') {
            return new PointLight(lightDef.color, lightDef.intensity, lightDistance);
        }
        if (lightDef.type === 'spot') {
            return new SpotLight(lightDef.color, lightDef.intensity, lightDistance, lightDef.angle);
        }
        throw new Error(`Unsupported light type: "${lightDef.type}"`);
    }
}