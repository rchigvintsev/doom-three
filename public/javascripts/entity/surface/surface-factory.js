import {Surface} from './surface.js';
import {SurfaceBody} from '../../physics/surface-body.js';
import {GameWorld} from '../../game-world.js';
import {Settings} from '../../settings.js';
import {Materials} from '../../map/materials.js';
import {ProjectiveTextureMaterialBuilder} from '../../map/material/projective-texture-material-builder.js';
import {MeshFactory} from '../mesh-factory.js';

const FALLBACK_MATERIAL_DEFINITION = {};

export class SurfaceFactory extends MeshFactory {
    constructor(assets, flashlight, collisionModelFactory) {
        super(assets, new ProjectiveTextureMaterialBuilder(assets, flashlight));
        this._collisionModelFactory = collisionModelFactory;
    }

    create(surfaceDef) {
        let body = null;
        const collisionModel = this._collisionModelFactory.createCollisionModel(surfaceDef);
        if (collisionModel)
            body = new SurfaceBody(collisionModel);

        let surface, geometry = this._createGeometry(surfaceDef.geometry);

        if (Settings.wireframeOnly)
            surface = new Surface(geometry, this._createWireframeMaterial(), body);
        else {
            const materialName = surfaceDef.material;
            let materialDefinition = Materials.definition[materialName];
            if (!materialDefinition) {
                console.error('Definition for material ' + materialName + ' is not found');
                materialDefinition = FALLBACK_MATERIAL_DEFINITION;
            }
            const mainMaterial = this._createRegularMaterial(materialName, materialDefinition);
            surface = new Surface(geometry, mainMaterial, body);
            if (Settings.showWireframe)
                surface.add(new THREE.Mesh(geometry, this._createWireframeMaterial()));
        }

        return surface;
    }

    _createGeometry(geometryDef) {
        const vertices = [];
        geometryDef.vertices.forEach(function (vertex) {
            const v = new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
            v.multiplyScalar(GameWorld.WORLD_SCALE);
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