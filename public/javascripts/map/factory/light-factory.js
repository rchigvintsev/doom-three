import {GameWorld} from '../../game-world.js';

export class LightFactory {
    createLight(lightDef, scale=true) {
        let light;
        if (lightDef.type === 'point')
            // Light distance should be scaled anyway
            light = new THREE.PointLight(lightDef.color, lightDef.intensity, lightDef.distance * GameWorld.WORLD_SCALE);
        else if (lightDef.type === 'spot')
            light = new THREE.SpotLight(lightDef.color, lightDef.intensity, lightDef.distance * GameWorld.WORLD_SCALE,
                lightDef.angle);
        else
            throw 'Unsupported light type: ' + lightDef.type;
        light.position.fromArray(lightDef.position);
        if (scale)
            light.position.multiplyScalar(GameWorld.WORLD_SCALE);
        return light;
    }

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