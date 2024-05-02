import {Light, Mesh, MeshBasicMaterial, PointLight, SphereGeometry, SpotLight} from 'three';

import {injectable} from 'inversify';

import {GameEntityFactory} from '../game-entity-factory';
import {Game} from '../../game';

@injectable()
export class LightFactory implements GameEntityFactory<Light> {
    create(lightDef: any): Light {
        const config = Game.getContext().config;
        const worldScale = config.worldScale;
        const light = this.createLight(lightDef, lightDef.distance * worldScale);
        light.name = lightDef.name;
        light.position.fromArray(lightDef.position).multiplyScalar(worldScale);
        light.castShadow = lightDef.castShadow;

        if (config.showLightSources) {
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
        const sphereRadius = 5 * Game.getContext().config.worldScale;
        const sphereGeometry = new SphereGeometry(sphereRadius);
        const sphereMaterial = new MeshBasicMaterial();
        sphereMaterial.color.set(lightDef.color);
        return new Mesh(sphereGeometry, sphereMaterial);
    }
}