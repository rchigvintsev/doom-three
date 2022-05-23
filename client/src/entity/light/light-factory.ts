import {Light, Mesh, MeshBasicMaterial, PointLight, SphereGeometry, SpotLight} from 'three';

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

        if (this.config.showLightSources) {
            const lightSphere = this.createLightSphere(lightDef);
            light.add(lightSphere);
        }

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

    private createLightSphere(lightDef: any) {
        const sphereRadius = 5 * this.config.worldScale;
        const sphereGeometry = new SphereGeometry(sphereRadius);
        const sphereMaterial = new MeshBasicMaterial();
        sphereMaterial.color.set(lightDef.color);
        return new Mesh(sphereGeometry, sphereMaterial);
    }
}