import {inherit} from '../../util/oop-utils.js';
import {AbstractMeshFactory} from './abstract-mesh-factory.js';
import {Surface} from '../surface.js';
import {SurfaceBody} from '../../physics/surface-body.js';
import {GameWorld} from '../../game-world.js';
import {Settings} from '../../settings.js';
import {Materials} from '../../materials.js';
import {ProjectiveTextureMaterialBuilder} from '../material/projective-texture-material-builder.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var fallbackMaterialDefinition = {};

    DT.SurfaceFactory = function (assets, collisionModelFactory, flashlight) {
        AbstractMeshFactory.call(this, new ProjectiveTextureMaterialBuilder(assets, flashlight));
        this._collisionModelFactory = collisionModelFactory;
    };

    DT.SurfaceFactory.prototype = inherit(AbstractMeshFactory, {
        constructor: DT.SurfaceFactory,

        createSurface: function (surfaceDef) {
            var body = null;
            var collisionModel = this._collisionModelFactory.createCollisionModel(surfaceDef);
            if (collisionModel)
                body = new SurfaceBody(collisionModel);

            var surface, geometry = this.createGeometry(surfaceDef.geometry);

            if (Settings.wireframeOnly)
                surface = new Surface(geometry, this.createWireframeMaterial(), body);
            else {
                var materialName = surfaceDef.material;
                var materialDefinition = Materials.definition[materialName];
                if (!materialDefinition) {
                    console.error('Definition for material ' + materialName + ' is not found');
                    materialDefinition = fallbackMaterialDefinition;
                }
                var mainMaterial = this.createRegularMaterial(materialName, materialDefinition);
                surface = new Surface(geometry, mainMaterial, body);
                if (Settings.showWireframe)
                    surface.add(new THREE.Mesh(geometry, this.createWireframeMaterial()));
            }

            return surface;
        },

        createGeometry: function (geometryDef) {
            var vertices = [];
            geometryDef.vertices.forEach(function (vertex) {
                var v = new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
                v.multiplyScalar(GameWorld.WORLD_SCALE);
                vertices.push(v);
            });

            var faces = [];
            geometryDef.faces.forEach(function (face) {
                faces.push(new THREE.Face3(face[0], face[1], face[2]));
            });

            var geometry = new THREE.Geometry();
            geometry.vertices = vertices;
            geometry.faces = faces;

            geometryDef.uvs.forEach(function (uv, i) {
                geometry.faceVertexUvs[0][i] = [
                    new THREE.Vector2(uv[0][0], uv[0][1] * -1),
                    new THREE.Vector2(uv[1][0], uv[1][1] * -1),
                    new THREE.Vector2(uv[2][0], uv[2][1] * -1)
                ];
            });

            geometry.mergeVertices();
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            return geometry;
        }
    });
})(DOOM_THREE);

export const SurfaceFactory = DOOM_THREE.SurfaceFactory;
