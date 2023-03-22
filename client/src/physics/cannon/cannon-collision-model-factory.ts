import {
    BoxGeometry,
    BufferGeometry,
    CylinderGeometry,
    Group,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    Vector3
} from 'three';

import {Body, Box, Cylinder, Heightfield, Material, Quaternion, Shape, Sphere, Trimesh, Vec3} from 'cannon-es';
import {inject, injectable} from 'inversify';

import {TYPES} from '../../types';
import {GameConfig} from '../../game-config';
import {PhysicsManager} from '../physics-manager';
import {CollisionModel} from '../collision-model';
import {CannonCollisionModel} from './cannon-collision-model';
import {NamedBox} from './named-box';
import {NamedSphere} from './named-sphere';
import {CannonPhysicsBody} from './cannon-physics-body';
import {CollisionModelFactory} from '../collision-model-factory';

@injectable()
export class CannonCollisionModelFactory implements CollisionModelFactory {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.PhysicsManager) private readonly physicsManager: PhysicsManager) {
    }

    create(entityDef: any): CollisionModel {
        const bodies: CannonPhysicsBody[] = [];
        if (entityDef.collisionModel) {
            for (const bodyDef of entityDef.collisionModel.bodies) {
                const body = this.createBody(bodyDef);
                bodies.push(body);
                if (this.config.showCollisionModels) {
                    body.helper = this.bodyToMesh(body);
                }
            }
        }
        return new CannonCollisionModel(bodies);
    }

    private createBody(bodyDef: any): CannonPhysicsBody {
        /*
         * collisionFilterGroup = 1 for most objects
         * collisionFilterGroup = 2 for floor
         * collisionFilterGroup = 4 for objects that don't interact with player, since player body can only collide
         * with objects from groups 1 and 2
         */
        const body = new CannonPhysicsBody({
            name: bodyDef.name,
            mass: bodyDef.mass,
            collisionFilterGroup: bodyDef.collisionFilterGroup,
            collisionFilterMask: bodyDef.collisionFilterMask || 7,
            material: this.getBodyMaterial(bodyDef)
        });
        if (bodyDef.collisionResponse != undefined) {
            body.collisionResponse = bodyDef.collisionResponse;
        }
        if (bodyDef.position) {
            const position = new Vector3().fromArray(bodyDef.position).multiplyScalar(this.config.worldScale);
            body.position.set(position.x, position.y, position.z);
        }
        if (bodyDef.rotation) {
            body.quaternion.setFromEuler(bodyDef.rotation[0], bodyDef.rotation[1], bodyDef.rotation[2]);
        } else if (bodyDef.quaternion) {
            body.quaternion.set(
                bodyDef.quaternion[0],
                bodyDef.quaternion[1],
                bodyDef.quaternion[2],
                bodyDef.quaternion[3]
            );
        }

        if (bodyDef.fixedRotation != undefined) {
            body.fixedRotation = bodyDef.fixedRotation;
        }

        if (bodyDef.mass > 0) {
            if (bodyDef.allowSleep != undefined) {
                body.allowSleep = bodyDef.allowSleep;
            }
            if (body.allowSleep) {
                body.sleepSpeedLimit = bodyDef.sleepSpeedLimit || 0.2;
            }
        }

        for (const shapeDef of bodyDef.shapes) {
            const shape = this.createBodyShape(shapeDef);

            let offset = undefined;
            if (shapeDef.offset) {
                offset = new Vec3(shapeDef.offset[0], shapeDef.offset[1], shapeDef.offset[2])
                    .scale(this.config.worldScale);
            }

            let orientation = undefined;
            if (shapeDef.quaternion) {
                orientation = new Quaternion(
                    shapeDef.quaternion[0],
                    shapeDef.quaternion[1],
                    shapeDef.quaternion[2],
                    shapeDef.quaternion[3]
                );
            } else if (shapeDef.rotation) {
                orientation = new Quaternion();
                orientation.setFromEuler(
                    MathUtils.degToRad(shapeDef.rotation[0]),
                    MathUtils.degToRad(shapeDef.rotation[1]),
                    MathUtils.degToRad(shapeDef.rotation[2])
                );
            }

            body.addShape(shape, offset, orientation);
        }

        return body;
    }

    private getBodyMaterial(bodyDef: any): Material {
        let material = undefined;
        if (bodyDef.material) {
            material = this.physicsManager.materials.get(bodyDef.material);
        }
        if (!material) {
            material = this.physicsManager.materials.get('default');
        }
        return material!;
    }

    private createBodyShape(shapeDef: any): Shape {
        if (shapeDef.type === 'box') {
            const halfExtents = new Vec3(shapeDef.width / 2, shapeDef.height / 2, shapeDef.depth / 2)
                .scale(this.config.worldScale);
            return new NamedBox(halfExtents, shapeDef.name);
        }
        if (shapeDef.type === 'sphere') {
            return new NamedSphere(shapeDef.radius * this.config.worldScale, shapeDef.name);
        }
        if (shapeDef.type === 'cylinder') {
            const size = new Vec3(shapeDef.radiusTop, shapeDef.radiusBottom, shapeDef.height)
                .scale(this.config.worldScale);
            return new Cylinder(size.x, size.y, size.z, shapeDef.segments);
        }
        if (shapeDef.type === 'trimesh') {
            const scaledVertices = [];
            for (let i = 0; i < shapeDef.vertices.length; i++) {
                scaledVertices.push(shapeDef.vertices[i] * this.config.worldScale);
            }
            return new Trimesh(scaledVertices, shapeDef.indices);
        }
        if (shapeDef.type === 'heightfield') {
            return new Heightfield(shapeDef.matrix, {elementSize: shapeDef.elementSize});
        }
        throw new Error(`Unsupported shape type: "${shapeDef.type}"`);
    }

    private bodyToMesh(body: Body): Group {
        const shapeGroup = new Group();

        const shapeMaterial = new MeshBasicMaterial({wireframe: true});
        shapeMaterial.color.setHex(Math.random() * 0xffffff);

        body.shapes.forEach((shape, i) => {
            const shapeGeometry = this.shapeToGeometry(shape);
            const shapeMesh = new Mesh(shapeGeometry, shapeMaterial);
            const shapeOffset = body.shapeOffsets[i];
            shapeMesh.position.set(shapeOffset.x, shapeOffset.y, shapeOffset.z);
            const shapeOrientation = body.shapeOrientations[i];
            shapeMesh.quaternion.set(shapeOrientation.x, shapeOrientation.y, shapeOrientation.z, shapeOrientation.w);
            shapeGroup.add(shapeMesh);
        });

        shapeGroup.position.set(body.position.x, body.position.y, body.position.z);
        shapeGroup.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
        return shapeGroup;
    }

    private shapeToGeometry(shape: Shape): BufferGeometry {
        switch (shape.type) {
            case Shape.types.SPHERE: {
                const radius = (<Sphere>shape).radius;
                const segments = Math.round(radius / this.config.worldScale) * 2;
                return new SphereGeometry(radius, segments, segments);
            }
            case Shape.types.BOX: {
                const halfExtents = (<Box>shape).halfExtents;
                return new BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
            }
            case Shape.types.CYLINDER: {
                const radiusTop = (<Cylinder>shape).radiusTop;
                const radiusBottom = (<Cylinder>shape).radiusBottom;
                const height = (<Cylinder>shape).height;
                return new CylinderGeometry(radiusTop, radiusBottom, height);
            }
            default:
                throw new Error(`Unsupported shape type: "${shape.type}"`);
        }
    }
}
