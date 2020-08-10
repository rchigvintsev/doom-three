import {CollisionModel} from './collision-model.js';
import {GameWorld} from '../game-world.js';
import {Settings} from '../settings.js';
import {SystemType} from '../game-context.js';
import {CannonBody} from './cannon/cannon-body.js';
import {TriggerBody} from './cannon/trigger-body.js';

export class CollisionModelFactory {
    constructor(systems) {
        const physicsSystem = systems[SystemType.PHYSICS];
        this.physicsMaterials = physicsSystem.materials;
    }

    createCollisionModel(collisionModelDef, contactStartListener, contactEndListener, showCollisionModel=false) {
        const collisionModel = new CollisionModel();
        for (const bodyDef of collisionModelDef.bodies) {
            const body = this.createBody(bodyDef, contactStartListener, contactEndListener);
            collisionModel.addBody(body);
            if (Settings.showCollisionModel || showCollisionModel) {
                const mesh = this.bodyToMesh(body);
                if (bodyDef.trigger) {
                    mesh.userData.fixedPosition = true;
                }
                collisionModel.attachMesh(body, mesh);
            }
        }
        return collisionModel;
    }

    createBody(bodyDef, contactStartListener, contactEndListener) {
        const material = this.physicsMaterials[bodyDef.material] || this.physicsMaterials['default'];
        const bodyOptions = {
            mass: bodyDef.mass,
            collisionFilterGroup: bodyDef.collisionFilterGroup,
            collisionFilterMask: bodyDef.collisionFilterMask,
            material: material
        };
        const body = bodyDef.trigger ? new TriggerBody(bodyOptions) : new CannonBody(bodyOptions);
        if (contactStartListener) {
            body.addEventListener('contactStart', e => {
                contactStartListener(e);
            });
        }
        if (contactEndListener) {
            body.addEventListener('contactEnd', e => {
                contactEndListener(e);
            })
        }

        if (bodyDef.position) {
            const position = new THREE.Vector3();
            position.fromArray(bodyDef.position);
            position.multiplyScalar(GameWorld.WORLD_SCALE);
            body.position.copy(position);
        }

        if (bodyDef.rotation) {
            body.quaternion.setFromEuler(bodyDef.rotation[0], bodyDef.rotation[1], bodyDef.rotation[2]);
        } else if (bodyDef.quaternion) {
            body.quaternion.set(bodyDef.quaternion[0],
                bodyDef.quaternion[1],
                bodyDef.quaternion[2],
                bodyDef.quaternion[3]);
        }

        if (bodyDef.fixedRotation !== undefined)
            body.fixedRotation = bodyDef.fixedRotation;

        if (bodyDef.mass > 0) {
            if (bodyDef.allowSleep !== undefined) {
                body.allowSleep = bodyDef.allowSleep;
            }
            if (body.allowSleep) {
                body.sleepSpeedLimit = 0.2;
            }
        }

        bodyDef.shapes.forEach(function (shapeDef) {
            let shape;
            if (shapeDef.type === 'box') {
                const halfExtents = new CANNON.Vec3(shapeDef.width / 2, shapeDef.height / 2,
                    shapeDef.depth / 2);
                shape = new CANNON.Box(halfExtents.scale(GameWorld.WORLD_SCALE));
            } else if (shapeDef.type === 'sphere') {
                shape = new CANNON.Sphere(shapeDef.radius * GameWorld.WORLD_SCALE);
            } else if (shapeDef.type === 'cylinder') {
                let size = new CANNON.Vec3(shapeDef.radiusTop, shapeDef.radiusBottom,
                    shapeDef.height);
                size = size.scale(GameWorld.WORLD_SCALE);
                shape = new CANNON.Cylinder(size.x, size.y, size.z, shapeDef.segments);
            } else if (shapeDef.type === 'trimesh') {
                const scaledVertices = [];
                for (let v = 0; v < shapeDef.vertices.length; v++)
                    scaledVertices.push(shapeDef.vertices[v] * GameWorld.WORLD_SCALE);
                shape = new CANNON.Trimesh(scaledVertices, shapeDef.indices);
            } else if (shapeDef.type === 'heightfield') {
                shape = new CANNON.Heightfield(shapeDef.matrix, {elementSize: shapeDef.elementSize});
            } else {
                throw 'Unsupported shape type: ' + shapeDef.type;
            }

            if (shapeDef.name) {
                shape.name = shapeDef.name;
            }

            let offset = null;
            if (shapeDef.offset) {
                offset = new CANNON.Vec3(shapeDef.offset[0], shapeDef.offset[1],
                    shapeDef.offset[2]);
                offset = offset.scale(GameWorld.WORLD_SCALE);
            }

            let orientation = null;
            if (shapeDef.quaternion) {
                orientation = new CANNON.Quaternion();
                orientation.set(shapeDef.quaternion[0],
                    shapeDef.quaternion[1],
                    shapeDef.quaternion[2],
                    shapeDef.quaternion[3]);
            } else if (shapeDef.rotation) {
                orientation = new CANNON.Quaternion();
                orientation.setFromEuler(THREE.Math.degToRad(shapeDef.rotation[0]),
                    THREE.Math.degToRad(shapeDef.rotation[1]),
                    THREE.Math.degToRad(shapeDef.rotation[2]));
            }

            body.addShape(shape, offset, orientation);
        });

        return body;
    }

    bodyToMesh(body) {
        const meshGroup = new THREE.Group();
        const color = Math.random() * 0xffffff;

        body.shapes.forEach(function (shape, i) {
            const geometry = CollisionModelFactory.shapeToGeometry(shape);

            const mainMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide
            });
            mainMaterial.color.setHex(color);

            let shapeMesh;
            if (Settings.showWireframe || Settings.wireframeOnly) {
                shapeMesh = new THREE.Mesh(geometry, mainMaterial);
            } else {
                const wireframeMaterial = new THREE.MeshBasicMaterial({wireframe: true});
                shapeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry,
                    [mainMaterial, wireframeMaterial]);
            }

            const offset = body.shapeOffsets[i];
            shapeMesh.position.set(offset.x, offset.y, offset.z);

            var orientation = body.shapeOrientations[i];
            shapeMesh.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);

            meshGroup.add(shapeMesh);
        });

        meshGroup.position.copy(body.position);
        meshGroup.quaternion.copy(body.quaternion);
        return meshGroup;
    }

    static shapeToGeometry(shape) {
        let v0, v1, v2;

        switch (shape.type) {
            case CANNON.Shape.types.SPHERE:
                const segments = Math.round(shape.radius / GameWorld.WORLD_SCALE) * 2;
                return new THREE.SphereGeometry(shape.radius, segments, segments);

            case CANNON.Shape.types.BOX:
                return new THREE.BoxGeometry(shape.halfExtents.x * 2, shape.halfExtents.y * 2,
                    shape.halfExtents.z * 2);

            case CANNON.Shape.types.CONVEXPOLYHEDRON:
                const cphGeometry = new THREE.Geometry();

                for (let i = 0; i < shape.vertices.length; i++) {
                    const v = shape.vertices[i];
                    cphGeometry.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
                }

                for (let i = 0; i < shape.faces.length; i++) {
                    const face = shape.faces[i];
                    const a = face[0];
                    for (let j = 1; j < face.length - 1; j++) {
                        const b = face[j];
                        const c = face[j + 1];
                        cphGeometry.faces.push(new THREE.Face3(a, b, c));
                    }
                }

                cphGeometry.computeBoundingSphere();
                cphGeometry.computeFaceNormals();
                return cphGeometry;

            case CANNON.Shape.types.HEIGHTFIELD:
                const hfGeometry = new THREE.Geometry();

                v0 = new CANNON.Vec3();
                v1 = new CANNON.Vec3();
                v2 = new CANNON.Vec3();

                for (let i = 0; i < shape.data.length - 1; i++) {
                    for (let j = 0; j < shape.data[i].length - 1; j++) {
                        for (let k = 0; k < 2; k++) {
                            shape.getConvexTrianglePillar(i, j, k === 0);
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
                const tmGeometry = new THREE.Geometry();

                v0 = new CANNON.Vec3();
                v1 = new CANNON.Vec3();
                v2 = new CANNON.Vec3();

                for (let i = 0; i < shape.indices.length / 3; i++) {
                    shape.getTriangleVertices(i, v0, v1, v2);
                    tmGeometry.vertices.push(new THREE.Vector3(v0.x, v0.y, v0.z),
                        new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
                    const j = tmGeometry.vertices.length - 3;
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
