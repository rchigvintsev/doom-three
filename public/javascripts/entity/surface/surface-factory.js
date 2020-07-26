import {Surface} from './surface.js';
import {SurfaceBody} from '../../physics/surface-body.js';
import {GameWorld} from '../../game-world.js';
import {Settings} from '../../settings.js';
import {MATERIALS} from '../../material/materials.js';
import {ProjectiveTextureMaterialBuilder} from '../../map/material/projective-texture-material-builder.js';
import {MeshFactory} from '../mesh-factory.js';
import {CollisionModelFactory} from '../../physics/collision-model-factory.js';

const FALLBACK_MATERIAL_DEF = {};

export class SurfaceFactory extends MeshFactory {
    constructor(assetLoader, systems) {
        super(assetLoader, new ProjectiveTextureMaterialBuilder(assetLoader));
        this._collisionModelFactory = new CollisionModelFactory(systems);
    }

    create(surfaceDef, scale=true) {
        let body = null;
        const collisionModel = this._collisionModelFactory.createCollisionModel(surfaceDef);
        if (collisionModel) {
            body = new SurfaceBody(collisionModel);
        }

        let surface, geometry = this._createGeometry(surfaceDef.geometry, scale);

        if (Settings.wireframeOnly) {
            surface = new Surface(geometry, [this._createWireframeMaterial()], body);
        } else {
            const materialName = surfaceDef.material;
            let materialDef = MATERIALS[materialName];
            if (!materialDef) {
                console.error('Definition for material ' + materialName + ' is not found');
                materialDef = FALLBACK_MATERIAL_DEF;
            }
            let materials = [];
            if (Array.isArray(materialDef)) {
                for (let md of materialDef) {
                    materials = materials.concat(this._createRegularMaterial(materialName, md));
                }
            } else {
                materials = materials.concat(this._createRegularMaterial(materialName, materialDef));
            }
            surface = new Surface(geometry, materials, body);
            if (Settings.showWireframe) {
                surface.add(new THREE.Mesh(geometry, this._createWireframeMaterial()));
            }
        }

        return surface;
    }

    _createGeometry(geometryDef, scale) {
        const vertices = [];
        geometryDef.vertices.forEach(function (vertex) {
            const v = new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
            if (scale) {
                v.multiplyScalar(GameWorld.WORLD_SCALE);
            }
            vertices.push(v);
        });

        const faces = [];
        geometryDef.faces.forEach(function (face) {
            faces.push(new THREE.Face3(face[0], face[1], face[2]));
        });

        const geometry = new THREE.Geometry();
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
}
