import {CollisionModel} from './collision-model.js';
import {GameWorld} from '../game-world.js';
import {Settings} from '../settings.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.CollisionModelFactory = function (physicsMaterials) {
        this.physicsMaterials = physicsMaterials;
    };

    DT.CollisionModelFactory.prototype = {
        constructor: DT.CollisionModelFactory,

        createCollisionModel: function (objectDef) {
            if (!objectDef.cm)
                return null;
            var self = this;
            var collisionModel = new CollisionModel();
            for (var i = 0; i < objectDef.cm.bodies.length; i++) {
                var body = self.createBody(objectDef.cm.bodies[i]);
                collisionModel.addBody(body);
                if (Settings.showCollisionModel) {
                    var mesh = self.bodyToMesh(body);
                    collisionModel.attachMesh(body, mesh);
                }
            }
            return collisionModel;
        },

        createBody: function (bodyDef) {
            var material = this.physicsMaterials[bodyDef.material] || this.physicsMaterials['default'];
            var body = new CANNON.Body({mass: bodyDef.mass, material: material});

            if (bodyDef.position) {
                var position = new THREE.Vector3();
                position.fromArray(bodyDef.position);
                position.multiplyScalar(GameWorld.WORLD_SCALE);
                body.position.copy(position);
            }

            if (bodyDef.rotation)
                body.quaternion.setFromEuler(bodyDef.rotation[0], bodyDef.rotation[1],
                    bodyDef.rotation[2]);
            else if (bodyDef.quaternion)
                body.quaternion.set(bodyDef.quaternion[0],
                    bodyDef.quaternion[1],
                    bodyDef.quaternion[2],
                    bodyDef.quaternion[3]);

            if (bodyDef.fixedRotation !== undefined)
                body.fixedRotation = bodyDef.fixedRotation;

            if (bodyDef.mass > 0) {
                if (bodyDef.allowSleep !== undefined)
                    body.allowSleep = bodyDef.allowSleep;
                if (body.allowSleep)
                    body.sleepSpeedLimit = 0.2;
            }

            bodyDef.shapes.forEach(function (shapeDef) {
                var shape;
                if (shapeDef.type === 'box') {
                    var halfExtents = new CANNON.Vec3(shapeDef.width / 2, shapeDef.height / 2,
                        shapeDef.depth / 2);
                    shape = new CANNON.Box(halfExtents.scale(GameWorld.WORLD_SCALE));
                } else if (shapeDef.type === 'sphere') {
                    shape = new CANNON.Sphere(shapeDef.radius * GameWorld.WORLD_SCALE);
                } else if (shapeDef.type === 'cylinder') {
                    var size = new CANNON.Vec3(shapeDef.radiusTop, shapeDef.radiusBottom,
                        shapeDef.height);
                    size = size.scale(GameWorld.WORLD_SCALE);
                    shape = new CANNON.Cylinder(size.x, size.y, size.z, shapeDef.segments);
                } else if (shapeDef.type === 'trimesh') {
                    var scaledVertices = [];
                    for (var v = 0; v < shapeDef.vertices.length; v++)
                        scaledVertices.push(shapeDef.vertices[v] * GameWorld.WORLD_SCALE);
                    shape = new CANNON.Trimesh(scaledVertices, shapeDef.indices);
                } else
                    throw 'Unsupported shape type: ' + shapeDef.type;

                if (shapeDef.name)
                    shape.name = shapeDef.name;

                var offset = null;
                if (shapeDef.offset) {
                    offset = new CANNON.Vec3(shapeDef.offset[0], shapeDef.offset[1],
                        shapeDef.offset[2]);
                    offset = offset.scale(GameWorld.WORLD_SCALE);
                }

                var orientation = null;
                if (shapeDef.quaternion) {
                    orientation = new CANNON.Quaternion();
                    orientation.set(shapeDef.quaternion[0],
                        shapeDef.quaternion[1],
                        shapeDef.quaternion[2],
                        shapeDef.quaternion[3]);
                }

                body.addShape(shape, offset, orientation);
            });

            return body;
        },

        bodyToMesh: function (body) {
            var self = this;
            var meshGroup = new THREE.Group();
            var color = Math.random() * 0xffffff;

            body.shapes.forEach(function (shape, i) {
                var geometry = self.shapeToGeometry(shape);

                var mainMaterial = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0.75,
                    side: THREE.DoubleSide
                });
                mainMaterial.color.setHex(color);

                var shapeMesh;
                if (Settings.showWireframe || Settings.wireframeOnly) {
                    shapeMesh = new THREE.Mesh(geometry, mainMaterial);
                } else {
                    var wireframeMaterial = new THREE.MeshBasicMaterial({wireframe: true});
                    shapeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry,
                        [mainMaterial, wireframeMaterial]);
                }

                var offset = body.shapeOffsets[i];
                shapeMesh.position.set(offset.x, offset.y, offset.z);

                var orientation = body.shapeOrientations[i];
                shapeMesh.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);

                meshGroup.add(shapeMesh);
            });

            meshGroup.position.copy(body.position);
            meshGroup.quaternion.copy(body.quaternion);
            return meshGroup;
        },

        shapeToGeometry: function (shape) {
            var v0, v1, v2;

            switch (shape.type) {
                case CANNON.Shape.types.SPHERE:
                    var segments = Math.round(shape.radius / GameWorld.WORLD_SCALE) * 2;
                    return new THREE.SphereGeometry(shape.radius, segments, segments);

                case CANNON.Shape.types.BOX:
                    return new THREE.BoxGeometry(shape.halfExtents.x * 2, shape.halfExtents.y * 2,
                        shape.halfExtents.z * 2);

                case CANNON.Shape.types.CONVEXPOLYHEDRON:
                    var cphGeometry = new THREE.Geometry();

                    for (var vi = 0; vi < shape.vertices.length; vi++) {
                        var v = shape.vertices[vi];
                        cphGeometry.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
                    }

                    for (var fi = 0; fi < shape.faces.length; fi++) {
                        var face = shape.faces[fi];
                        var a = face[0];
                        for (var i = 1; i < face.length - 1; i++) {
                            var b = face[i];
                            var c = face[i + 1];
                            cphGeometry.faces.push(new THREE.Face3(a, b, c));
                        }
                    }

                    cphGeometry.computeBoundingSphere();
                    cphGeometry.computeFaceNormals();
                    return cphGeometry;

                case CANNON.Shape.types.HEIGHTFIELD:
                    var hfGeometry = new THREE.Geometry();

                    v0 = new CANNON.Vec3();
                    v1 = new CANNON.Vec3();
                    v2 = new CANNON.Vec3();

                    for (var xi = 0; xi < shape.data.length - 1; xi++) {
                        for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
                            for (var k = 0; k < 2; k++) {
                                shape.getConvexTrianglePillar(xi, yi, k === 0);
                                v0.copy(shape.pillarConvex.vertices[0]);
                                v1.copy(shape.pillarConvex.vertices[1]);
                                v2.copy(shape.pillarConvex.vertices[2]);
                                v0.vadd(shape.pillarOffset, v0);
                                v1.vadd(shape.pillarOffset, v1);
                                v2.vadd(shape.pillarOffset, v2);
                                hfGeometry.vertices.push(new THREE.Vector3(v0.x, v0.y, v0.z),
                                    new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
                                var n = hfGeometry.vertices.length - 3;
                                hfGeometry.faces.push(new THREE.Face3(n, n + 1, n + 2));
                            }
                        }
                    }

                    hfGeometry.computeBoundingSphere();
                    hfGeometry.computeFaceNormals();
                    return hfGeometry;

                case CANNON.Shape.types.TRIMESH:
                    var tmGeometry = new THREE.Geometry();

                    v0 = new CANNON.Vec3();
                    v1 = new CANNON.Vec3();
                    v2 = new CANNON.Vec3();

                    for (var ti = 0; ti < shape.indices.length / 3; ti++) {
                        shape.getTriangleVertices(ti, v0, v1, v2);
                        tmGeometry.vertices.push(new THREE.Vector3(v0.x, v0.y, v0.z),
                            new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
                        var j = tmGeometry.vertices.length - 3;
                        tmGeometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
                    }

                    tmGeometry.computeBoundingSphere();
                    tmGeometry.computeFaceNormals();
                    return tmGeometry;

                default:
                    throw 'Unsupported shape type: ' + shape.type;
            }
        }
    }
})(DOOM_THREE);

export const CollisionModelFactory = DOOM_THREE.CollisionModelFactory;
