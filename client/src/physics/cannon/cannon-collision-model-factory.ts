import {
    BoxGeometry,
    BufferGeometry,
    CylinderGeometry,
    Group,
    Material,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    SphereGeometry,
    Vector3
} from 'three';

import {
    Body,
    BodyType,
    Box,
    ConeTwistConstraint,
    Constraint,
    Cylinder,
    Heightfield,
    Material as Mat,
    Quaternion,
    Shape,
    Sphere,
    Trimesh,
    Vec3
} from 'cannon-es';
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
import {CannonRagdollCollisionModel} from './cannon-ragdoll-collision-model';

@injectable()
export class CannonCollisionModelFactory implements CollisionModelFactory {
    constructor(@inject(TYPES.Config) private readonly config: GameConfig,
                @inject(TYPES.PhysicsManager) private readonly physicsManager: PhysicsManager) {
    }

    create(collisionModelDef: any): CollisionModel {
        if (collisionModelDef.ragdoll) {
            return this.createRagdollCollisionModel(collisionModelDef);
        }
        return this.createRegularCollisionModel(collisionModelDef);
    }

    private createRegularCollisionModel(collisionModelDef: any): CannonCollisionModel {
        const bodies: CannonPhysicsBody[] = [];
        const constraints: Constraint[] = [];
        if (collisionModelDef) {
            let helperMaterial;
            if (this.config.showCollisionModels) {
                helperMaterial = this.createMaterialWithRandomColor();
            }

            for (const bodyDef of collisionModelDef.bodies) {
                const body = this.createBody(bodyDef);
                bodies.push(body);
                if (this.config.showCollisionModels) {
                    body.helper = this.bodyToMesh(body, helperMaterial);
                }
            }

            if (collisionModelDef.constraints) {
                for (const constraintDef of collisionModelDef.constraints) {
                    constraints.push(this.createConstraint(constraintDef, bodies));
                }
            }
        }
        return new CannonCollisionModel({bodies, constraints});
    }

    private createRagdollCollisionModel(collisionModelDef: any): CannonRagdollCollisionModel {
        const bodies: CannonPhysicsBody[] = [];
        const deadStateBodies: CannonPhysicsBody[] = [];
        const deadStateConstraints: Constraint[] = [];
        if (collisionModelDef) {
            let helperMaterial;
            if (this.config.showCollisionModels) {
                helperMaterial = this.createMaterialWithRandomColor();
            }

            for (const bodyDef of collisionModelDef.bodies) {
                const body = this.createBody(bodyDef);
                bodies.push(body);
                if (this.config.showCollisionModels) {
                    body.helper = this.bodyToMesh(body, helperMaterial);
                }

                // Create mirroring body for dead state
                if (body.type === Body.KINEMATIC) {
                    const deadBody = this.createBody(bodyDef, {type: Body.DYNAMIC});
                    deadStateBodies.push(deadBody);
                    deadBody.helper = body.helper;
                }
            }

            if (collisionModelDef.constraints) {
                for (const constraintDef of collisionModelDef.constraints) {
                    deadStateConstraints.push(this.createConstraint(constraintDef, deadStateBodies));
                }
            }
        }
        return new CannonRagdollCollisionModel({
            bodies,
            constraints: [],
            deadStateBodies,
            deadStateConstraints,
            physicsManager: this.physicsManager,
            worldScale: this.config.worldScale
        });
    }

    private createBody(bodyDef: any, options?: BodyOptions): CannonPhysicsBody {
        /*
         * collisionFilterGroup = 1 for most of the objects
         *
         * collisionFilterGroup = 2 for objects (like floor or monster ragdoll model) that don't interact with monster
         * bounding bodies
         *
         * collisionFilterGroup = 4 for objects (like ammo shells) that don't interact with player's body
         */
        const body = new CannonPhysicsBody({
            name: bodyDef.name,
            type: this.getBodyType(bodyDef, options),
            mass: bodyDef.mass,
            collisionFilterGroup: bodyDef.collisionFilterGroup || 1,
            collisionFilterMask: bodyDef.collisionFilterMask || 7,
            material: this.getBodyMaterial(bodyDef),
            damageFactor: bodyDef.damageFactor
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

        if (bodyDef.shapes) {
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
        }

        return body;
    }

    private createConstraint(constraintDef: any, bodies: CannonPhysicsBody[]): Constraint {
        if (constraintDef.type === 'cone-twist') {
            const bodyA = bodies.find(e => e.name === constraintDef.bodyA);
            if (!bodyA) {
                throw Error(`Body with name "${constraintDef.bodyA}" is not found`);
            }
            const bodyB = bodies.find(e => e.name === constraintDef.bodyB);
            if (!bodyB) {
                throw Error(`Body with name "${constraintDef.bodyB}" is not found`);
            }
            const pivotA = new Vec3(constraintDef.pivotA[0], constraintDef.pivotA[1], constraintDef.pivotA[2])
                .scale(this.config.worldScale);
            const pivotB = new Vec3(constraintDef.pivotB[0], constraintDef.pivotB[1], constraintDef.pivotB[2])
                .scale(this.config.worldScale);
            const axisA = constraintDef.axisA === 'X'
                ? Vec3.UNIT_X
                : (constraintDef.axisA === 'Y' ? Vec3.UNIT_Y : Vec3.UNIT_Z);
            const axisB = constraintDef.axisB === 'X'
                ? Vec3.UNIT_X
                : (constraintDef.axisB === 'Y' ? Vec3.UNIT_Y : Vec3.UNIT_Z);
            return new ConeTwistConstraint(bodyA, bodyB, {
                pivotA, pivotB,
                axisA, axisB,
                angle: constraintDef.angle,
                twistAngle: constraintDef.twistAngle
            });
        }
        throw new Error('Unsupported constraint type: ' + constraintDef.type);
    }

    private getBodyMaterial(bodyDef: any): Mat {
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

    private bodyToMesh(body: Body, material?: Material): Group {
        const shapeGroup = new Group();

        if (!material) {
            material = this.createMaterialWithRandomColor();
        }

        body.shapes.forEach((shape, i) => {
            const shapeGeometry = this.shapeToGeometry(shape);
            const shapeMesh = new Mesh(shapeGeometry, material);
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

    private createMaterialWithRandomColor() {
        const result = new MeshBasicMaterial({wireframe: true});
        result.color.setHex(Math.random() * 0xffffff);
        return result;
    }

    private getBodyType(bodyDef: any, options?: BodyOptions): BodyType {
        if (options && options.type != undefined) {
            return options.type;
        }

        if (bodyDef.type === 'static' || bodyDef.mass === 0) {
            return Body.STATIC;
        }
        if (bodyDef.type === 'kinematic') {
            return Body.KINEMATIC;
        }
        return Body.DYNAMIC;
    }
}

interface BodyOptions {
    type?: BodyType;
}
