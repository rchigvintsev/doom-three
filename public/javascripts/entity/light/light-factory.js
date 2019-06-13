import {GameWorld} from '../../game-world.js';
import {EntityFactory} from '../entity-factory.js';

export class LightFactory extends EntityFactory {
    constructor(assetLoader) {
        super(assetLoader);
    }

    create(lightDef, scale=true) {
        let light;
        const lightDistance = lightDef.distance * GameWorld.WORLD_SCALE;
        if (lightDef.type === 'point')
            light = new THREE.PointLight(lightDef.color, lightDef.intensity, lightDistance);
        else if (lightDef.type === 'spot')
            light = new THREE.SpotLight(lightDef.color, lightDef.intensity, lightDistance, lightDef.angle);
        else
            throw 'Unsupported light type: ' + lightDef.type;
        light.name = lightDef.name;
        light.position.fromArray(lightDef.position);
        if (scale)
            light.position.multiplyScalar(GameWorld.WORLD_SCALE);
        return light;
    }

    // noinspection JSMethodCanBeStatic
    createLightSphere(lightDef, scale=true) {
        let sphereRadius = 5;
        if (scale)
            sphereRadius *= GameWorld.WORLD_SCALE;
        const lightSphereGeometry = new THREE.SphereGeometry(sphereRadius);
        const lightSphereMaterial = new THREE.MeshBasicMaterial();
        lightSphereMaterial.color.set(lightDef.color);
        const lightSphereMesh = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
        lightSphereMesh.position.fromArray(lightDef.position);
        if (scale)
            lightSphereMesh.position.multiplyScalar(GameWorld.WORLD_SCALE);
        return lightSphereMesh;
    }
}