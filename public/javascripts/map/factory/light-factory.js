import {GameWorld} from '../../game-world.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.LightFactory = function () {
    };

    DT.LightFactory.prototype = {
        constructor: DT.LightFactory,

        createLight: function (lightDef) {
            var light;
            if (lightDef.type === 'point')
                light = new THREE.PointLight(lightDef.color, lightDef.intensity,
                    lightDef.distance * GameWorld.WORLD_SCALE);
            else
                throw 'Unsupported light type: ' + lightDef.type;
            light.position.fromArray(lightDef.position);
            light.position.multiplyScalar(GameWorld.WORLD_SCALE);
            return light;
        },

        createLightSphere: function (lightDef) {
            var lightSphereGeometry = new THREE.SphereGeometry(5 * GameWorld.WORLD_SCALE);
            var lightSphereMaterial = new THREE.MeshBasicMaterial();
            lightSphereMaterial.color.set(lightDef.color);
            var lightSphereMesh = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
            lightSphereMesh.position.fromArray(lightDef.position);
            lightSphereMesh.position.multiplyScalar(GameWorld.WORLD_SCALE);
            return lightSphereMesh;
        }
    }
})(DOOM_THREE);

export const LightFactory = DOOM_THREE.LightFactory;
