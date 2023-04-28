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
        const constraints: Constraint[] = [];
        if (entityDef.collisionModel) {
            if (entityDef.collisionModel.ragdoll) {
                bodies.push(this.createBody({name: 'root', mass: 0, material: 'models/monster'}));

                const ankleRadius = 3.5;
                const kneeRadius = 3.5;
                const feetDistance = 11;
                const lowerLegSize = new Vector3(7, 15.4, 7);
                const upperLegSize = new Vector3(8, 20.3, 9);
                const pelvisSize = new Vector3(12, 12, 12);
                const upperBodySize = new Vector3(16, 12, 9);
                const neckLength = 2.3;
                const headRadius = 5.5;
                const upperArmSize = new Vector3(12, 6, 6);
                const lowerArmSize = new Vector3(12, 6, 6);

                const lowerLegShape = new Box(new Vec3(lowerLegSize.x * 0.5, lowerLegSize.y * 0.5, lowerLegSize.z * 0.5)
                    .scale(this.config.worldScale));

                const leftLowerLegPosition = new Vec3(-pelvisSize.x * 0.5, ankleRadius * 2.0 + lowerLegSize.y * 0.5, 0);
                const leftLowerLeg = this.createBody({
                    name: 'leftLowerLeg',
                    mass: 1,
                    material: 'models/monster',
                    position: leftLowerLegPosition.toArray()
                });
                leftLowerLeg.addShape(lowerLegShape);
                bodies.push(leftLowerLeg);
                if (this.config.showCollisionModels) {
                    leftLowerLeg.helper = this.bodyToMesh(leftLowerLeg);
                }

                /*const lowerRightLeg = new CannonPhysicsBody({
                    mass: 1,
                    position: new Vec3(feetDistance * 0.5, lowerLegSize.y * 0.5, 0).scale(this.config.worldScale),
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                lowerRightLeg.addShape(lowerLegShape);
                bodies.push(lowerRightLeg);
                if (this.config.showCollisionModels) {
                    lowerRightLeg.helper = this.bodyToMesh(lowerRightLeg);
                }*/

                /*const upperLegShape = new Box(new Vec3(upperLegSize.x * 0.5, upperLegSize.y * 0.5, upperLegSize.z * 0.5)
                    .scale(this.config.worldScale));

                const leftUpperLegPosition = new Vec3(-pelvisSize.x * 0.5 + upperLegSize.x * 0.5, lowerLegSize.y * 0.5 + upperLegSize.y * 0.5, 0)
                    .scale(this.config.worldScale);
                leftUpperLegPosition.y += leftLowerLeg.position.y;
                const leftUpperLeg = new CannonPhysicsBody({
                    name: 'leftUpperLeg',
                    mass: 1,
                    position: leftUpperLegPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                leftUpperLeg.addShape(upperLegShape);
                bodies.push(leftUpperLeg);
                if (this.config.showCollisionModels) {
                    leftUpperLeg.helper = this.bodyToMesh(leftUpperLeg);
                }*/

                /*const upperRightLegPosition = new Vec3(pelvisSize.x * 0.5  - upperLegSize.x * 0.5, lowerLegSize.y * 0.5 + upperLegSize.y * 0.5, 0).scale(this.config.worldScale);
                upperRightLegPosition.y += lowerRightLeg.position.y;
                const upperRightLeg = new CannonPhysicsBody({
                    mass: 1,
                    position: upperRightLegPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                upperRightLeg.addShape(upperLegShape);
                bodies.push(upperRightLeg);
                if (this.config.showCollisionModels) {
                    upperRightLeg.helper = this.bodyToMesh(upperRightLeg);
                }

                const pelvisPosition = new Vec3(0, upperLegSize.y * 0.5 + pelvisSize.y * 0.5, 0).scale(this.config.worldScale);
                pelvisPosition.y += leftUpperLeg.position.y;
                const pelvis = new CannonPhysicsBody({
                    mass: 1,
                    position: pelvisPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                pelvis.addShape(new Box(new Vec3(pelvisSize.x * 0.5, pelvisSize.y * 0.5, pelvisSize.z * 0.5).scale(this.config.worldScale)));
                bodies.push(pelvis);
                if (this.config.showCollisionModels) {
                    pelvis.helper = this.bodyToMesh(pelvis);
                }

                const upperBodyPosition = new Vec3(0, pelvisSize.y * 0.5 + upperBodySize.y * 0.5, -3).scale(this.config.worldScale);
                upperBodyPosition.y += pelvis.position.y;
                const upperBody = new CannonPhysicsBody({
                    mass: 1,
                    position: upperBodyPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                upperBody.addShape(new Box(new Vec3(upperBodySize.x * 0.5, upperBodySize.y * 0.5, upperBodySize.z * 0.5).scale(this.config.worldScale)));
                bodies.push(upperBody);
                if (this.config.showCollisionModels) {
                    upperBody.helper = this.bodyToMesh(upperBody);
                }

                const headPosition = new Vec3(0, upperBodySize.y * 0.5 + headRadius + neckLength, -1.3).scale(this.config.worldScale);
                headPosition.y += upperBody.position.y;
                const head = new CannonPhysicsBody({
                    mass: 1,
                    position: headPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                head.addShape(new Sphere(headRadius * this.config.worldScale));
                bodies.push(head);
                if (this.config.showCollisionModels) {
                    head.helper = this.bodyToMesh(head);
                }

                const upperArmShape = new Box(new Vec3(upperArmSize.x * 0.5, upperArmSize.y * 0.5, upperArmSize.z * 0.5).scale(this.config.worldScale));

                const upperLeftArmPosition = new Vec3(-upperBodySize.x * 0.5 - upperArmSize.x * 0.5, upperBodySize.y * 0.5 - upperArmSize.y * 0.5 + 1, -3).scale(this.config.worldScale);
                upperLeftArmPosition.y += upperBody.position.y;
                const upperLeftArm = new CannonPhysicsBody({
                    mass: 1,
                    position: upperLeftArmPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                upperLeftArm.addShape(upperArmShape);
                bodies.push(upperLeftArm);
                if (this.config.showCollisionModels) {
                    upperLeftArm.helper = this.bodyToMesh(upperLeftArm);
                }

                const upperRightArmPosition = new Vec3(upperBodySize.x * 0.5 + upperArmSize.x * 0.5, upperBodySize.y * 0.5 - upperArmSize.y * 0.5 + 1, -3).scale(this.config.worldScale);
                upperRightArmPosition.y += upperBody.position.y;
                const upperRightArm = new CannonPhysicsBody({
                    mass: 1,
                    position: upperRightArmPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                upperRightArm.addShape(upperArmShape);
                bodies.push(upperRightArm);
                if (this.config.showCollisionModels) {
                    upperRightArm.helper = this.bodyToMesh(upperRightArm);
                }

                const lowerArmShape = new Box(new Vec3(lowerArmSize.x * 0.5, lowerArmSize.y * 0.5, lowerArmSize.z * 0.5).scale(this.config.worldScale));

                const lowerLeftArmPosition = new Vec3(lowerArmSize.x * 0.5 + upperArmSize.x * 0.5, 0, -3).scale(this.config.worldScale);
                lowerLeftArmPosition.x = upperLeftArm.position.x - lowerLeftArmPosition.x;
                lowerLeftArmPosition.y = upperLeftArm.position.y;
                const lowerLeftArm = new CannonPhysicsBody({
                    mass: 1,
                    position: lowerLeftArmPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                lowerLeftArm.addShape(lowerArmShape);
                bodies.push(lowerLeftArm);
                if (this.config.showCollisionModels) {
                    lowerLeftArm.helper = this.bodyToMesh(lowerLeftArm);
                }

                const lowerRightArmPosition = new Vec3(lowerArmSize.x * 0.5 + upperArmSize.x * 0.5, 0, -3).scale(this.config.worldScale);
                lowerRightArmPosition.x += upperRightArm.position.x;
                lowerRightArmPosition.y = upperRightArm.position.y;
                const lowerRightArm = new CannonPhysicsBody({
                    mass: 1,
                    position: lowerRightArmPosition,
                    material: this.physicsManager.materials.get('default'),
                    collisionFilterMask: 7
                });
                lowerRightArm.addShape(lowerArmShape);
                bodies.push(lowerRightArm);
                if (this.config.showCollisionModels) {
                    lowerRightArm.helper = this.bodyToMesh(lowerRightArm);
                }*/

                const angleA = Math.PI / 4.0;
                const angleB = Math.PI / 3.0;
                const twistAngle = Math.PI / 8.0;

                /*const neckJoint = new ConeTwistConstraint(head, upperBody, {
                    pivotA: new Vec3(0, -headRadius - neckLength * 0.5, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(0, upperBodySize.y * 0.5, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_Y,
                    axisB: Vec3.UNIT_Y,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                constraints.push(neckJoint);*/

                /*const leftKneeJoint = new ConeTwistConstraint(leftUpperLeg, leftLowerLeg, {
                    pivotA: new Vec3(0, -kneeRadius, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(0, lowerLegSize.y * 0.5, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_Y,
                    axisB: Vec3.UNIT_Y,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                constraints.push(leftKneeJoint);*/

                /*const rightKneeJoint= new ConeTwistConstraint(lowerRightLeg, upperRightLeg, {
                    pivotA: new Vec3(0, lowerLegSize.y * 0.5, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(0, -upperLegSize.y * 0.5, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_Y,
                    axisB: Vec3.UNIT_Y,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                constraints.push(rightKneeJoint);

                const leftHipJoint = new ConeTwistConstraint(leftUpperLeg, pelvis, {
                    pivotA: new Vec3(0, upperLegSize.y * 0.5, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(-upperBodySize.x * 0.5 + upperLegSize.x * 0.5, -pelvisSize.y * 0.5, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_Y,
                    axisB: Vec3.UNIT_Y,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                const rightHipJoint = new ConeTwistConstraint(upperRightLeg, pelvis, {
                    pivotA: new Vec3(0, upperLegSize.y * 0.5, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(upperBodySize.x * 0.5 - upperLegSize.x * 0.5, -pelvisSize.y * 0.5, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_Y,
                    axisB: Vec3.UNIT_Y,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                constraints.push(leftHipJoint);
                constraints.push(rightHipJoint);

                const spineJoint = new ConeTwistConstraint(pelvis, upperBody, {
                    pivotA: new Vec3(0, pelvisSize.y * 0.5, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(0,-upperBodySize.y * 0.5, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_Y,
                    axisB: Vec3.UNIT_Y,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                constraints.push(spineJoint);

                const leftShoulder = new ConeTwistConstraint(upperBody, upperLeftArm, {
                    pivotA: new Vec3(-upperBodySize.x * 0.5, upperBodySize.y * 0.5,0).scale(this.config.worldScale),
                    pivotB: new Vec3(upperArmSize.y * 0.5, 0, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_X,
                    axisB: Vec3.UNIT_X,
                    angle: angleB
                });
                const rightShoulder= new ConeTwistConstraint(upperBody, upperRightArm, {
                    pivotA: new Vec3(upperBodySize.x * 0.5,  upperBodySize.y * 0.5, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(-upperArmSize.y * 0.5, 0, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_X,
                    axisB: Vec3.UNIT_X,
                    angle: angleB,
                    twistAngle: twistAngle
                });
                constraints.push(leftShoulder);
                constraints.push(rightShoulder);

                const leftElbowJoint = new ConeTwistConstraint(lowerLeftArm, upperLeftArm, {
                    pivotA: new Vec3(lowerArmSize.x * 0.5, 0, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(-upperArmSize.x * 0.5, 0, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_X,
                    axisB: Vec3.UNIT_X,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                const rightElbowJoint= new ConeTwistConstraint(lowerRightArm, upperRightArm, {
                    pivotA: new Vec3(-lowerArmSize.x * 0.5, 0, 0).scale(this.config.worldScale),
                    pivotB: new Vec3(upperArmSize.x * 0.5, 0, 0).scale(this.config.worldScale),
                    axisA: Vec3.UNIT_X,
                    axisB: Vec3.UNIT_X,
                    angle: angleA,
                    twistAngle: twistAngle
                });
                constraints.push(leftElbowJoint);
                constraints.push(rightElbowJoint);*/
            } else {
                for (const bodyDef of entityDef.collisionModel.bodies) {
                    const body = this.createBody(bodyDef);
                    bodies.push(body);
                    if (this.config.showCollisionModels) {
                        body.helper = this.bodyToMesh(body);
                    }
                }
            }
        }
        return new CannonCollisionModel(bodies, constraints);
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
