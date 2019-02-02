import {inherit} from '../../util/oop-utils.js';
import {AbstractMeshFactory} from './abstract-mesh-factory.js';
import {Settings} from '../../settings.js';
import {Materials} from '../../materials.js';
import {GameWorld} from '../../game-world.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.AbstractModelFactory = function (materialBuilder, type) {
        AbstractMeshFactory.call(this, materialBuilder);
        this._type = type;
    };

    DT.AbstractModelFactory.prototype = inherit(AbstractMeshFactory, {
        constructor: DT.AbstractModelFactory,

        loadModel: function () {
            throw 'Function "loadModel" is not implemented'
        },

        rotateMesh: function () {
            // Override in subclasses
        },

        createModel: function (modelDef) {
            var model = this.loadModel(modelDef);
            var mesh;
            if (Settings.showWireframe || Settings.wireframeOnly)
                mesh = new THREE.SkinnedMesh(model.geometry, this.createWireframeMaterial());
            else {
                var materials = [];
                var declaredMaterials = modelDef.materials || model.materials;
                if (declaredMaterials)
                    for (var mi = 0; mi < declaredMaterials.length; mi++) {
                        var declaredMaterial = declaredMaterials[mi];
                        var materialName = typeof declaredMaterial === 'string' ? declaredMaterial
                            : declaredMaterial.name;
                        var materialDef = Materials.definition[materialName];
                        if (!materialDef) {
                            console.error('Definition for material ' + materialName + ' is not found');
                            materials.push(new THREE.MeshPhongMaterial());
                        } else
                            materials.push(this.createRegularMaterial(materialName, materialDef));
                    }

                if (materials.length === 0) {
                    console.warn('Materials are not defined for ' + this._type + ' model ' + modelDef.name);
                    materials.push(new THREE.MeshPhongMaterial());
                }

                mesh = new THREE.SkinnedMesh(model.geometry, materials);
            }

            mesh.scale.setScalar(GameWorld.WORLD_SCALE);
            mesh.position.fromArray(modelDef.position).multiplyScalar(GameWorld.WORLD_SCALE);
            this.rotateMesh(mesh);
            return mesh;
        }
    })
})(DOOM_THREE);

export const AbstractModelFactory = DOOM_THREE.AbstractModelFactory;
