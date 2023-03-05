import {Light, Mesh, MeshBasicMaterial, PointLight, SphereGeometry, SpotLight} from 'three';

import {inject, injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {GameConfig} from '../../game-config';
import {TYPES} from '../../types';

@injectable()
export class LightFactory implements GameEntityFactory<Light> {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig) {
    }

    create(lightDef: any): Light {
        const worldScale = this.config.worldScale;
        const light = this.createLight(lightDef, lightDef.distance * worldScale);
        light.name = lightDef.name;
        light.position.fromArray(lightDef.position).multiplyScalar(worldScale);
        light.castShadow = lightDef.castShadow;

        if (this.config.showLightSources) {
            const lightSphere = this.createLightSphere(lightDef);
            light.add(lightSphere);
        }

        return light;
    }

    private createLight(lightDef: any, lightDistance: number): PointLight | SpotLight {
        if (lightDef.type === 'point') {
            return new PointLight(lightDef.color, lightDef.intensity, lightDistance, 1);
        }
        if (lightDef.type === 'spot') {
            return new SpotLight(lightDef.color, lightDef.intensity, lightDistance, lightDef.angle, 0, 1);
        }
        throw new Error(`Unsupported light type: "${lightDef.type}"`);
    }

    private createLightSphere(lightDef: any) {
        const sphereRadius = 5 * this.config.worldScale;
        const sphereGeometry = new SphereGeometry(sphereRadius);
        const sphereMaterial = new MeshBasicMaterial();
        sphereMaterial.color.set(lightDef.color);
        return new Mesh(sphereGeometry, sphereMaterial);
    }
}