import {
    Intersection,
    Matrix4,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    PlaneGeometry,
    Quaternion,
    Ray,
    Raycaster,
    SphereGeometry,
    Vector2,
    Vector3
} from 'three';

import {Body, Constraint, LockConstraint, Sphere} from 'cannon-es';

import {Weapon, WeaponParameters, WeaponState} from './weapon';
import {AttackEvent} from '../../../../event/weapon-events';
import {Monster} from '../monster/monster';
import {isRagdollCollisionModel} from '../../../../physics/ragdoll-collision-model';
import {PhysicsBodyHelper} from '../../../../physics/physics-body-helper';
import {Game} from '../../../../game';
import {PhysicsManager} from '../../../../physics/physics-manager';
import {isTangibleEntity} from '../../../tangible-entity';

const TELEKINESIS_DISTANCE = 150;

/**
 * Special type of weapon intended for debugging of game physics.
 */
export class TelekineticFists extends Weapon {
    private readonly telekinesisDistance: number;
    private readonly raycaster = new Raycaster();
    private readonly hitMarker: Mesh;
    private readonly movementPlane: Mesh;
    private readonly jointBody: Body;

    private jointConstraint?: Constraint;

    private dragging = false;

    constructor(parameters: TelekineticFistsParameters) {
        super(parameters);

        const context = Game.getContext();

        this.telekinesisDistance = TELEKINESIS_DISTANCE * context.config.worldScale;

        const hitMarkerGeometry = new SphereGeometry(0.02, 8, 8);
        const hitMarkerMaterial = new MeshLambertMaterial({color: 0xff0000, depthTest: false, depthWrite: false});
        this.hitMarker = new Mesh(hitMarkerGeometry, hitMarkerMaterial);
        this.hitMarker.renderOrder = 1_000;
        this.hitMarker.visible = false;
        context.scene.add(this.hitMarker);

        const movementPlaneGeometry = new PlaneGeometry(10, 10);
        const movementPlaneMaterial = new MeshLambertMaterial({color: 0x777777});
        this.movementPlane = new Mesh(movementPlaneGeometry, movementPlaneMaterial);
        this.movementPlane.visible = false;
        context.scene.add(this.movementPlane);

        this.jointBody = new Body({mass: 0});
        this.jointBody.addShape(new Sphere(0.02));
        this.jointBody.collisionFilterGroup = 0;
        this.jointBody.collisionFilterMask = 0;
        parameters.physicsManager.addBody(this.jointBody);
    }
    init() {
        super.init();
    }

    attack() {
        if (this.canAttack()) {
            this.changeState(TelekineticFistsState.MOVING_OBJECTS);
            this.dispatchEvent(new AttackEvent(this, this.telekinesisDistance, 0));
        }
    }

    onHit(target: Mesh, ray: Ray, intersection: Intersection) {
        if (target instanceof Monster && target.isDead()) {
            const monster = target as Monster;
            if (isRagdollCollisionModel(monster.collisionModel)) {
                const bodyHelpers = monster.collisionModel.deadStateBodies
                    .filter(body => !body.boundingBox && body.helper)
                    .map(body => body.helper!);

                this.raycaster.set(ray.origin, ray.direction);
                const intersections = this.raycaster.intersectObjects(bodyHelpers);
                if (intersections.length > 0) {
                    const hit = intersections[0];
                    let target: Object3D | null = hit.object;
                    while (target && !(target instanceof PhysicsBodyHelper)) {
                        target = target.parent;
                    }

                    if (target) {
                        const hitPoint = hit.point;

                        this.moveHitMarker(hitPoint);
                        this.showHitMarker();
                        this.moveMovementPlane(hitPoint, ray.direction);
                        this.addJointConstraint(hitPoint, target.body as unknown as Body);

                        requestAnimationFrame(() => this.dragging = true);
                    }
                }
            }
        } else if (isTangibleEntity(target)) {
            if ((target as any).collisionModel.hasMass()) {
                const body = (target as any).collisionModel.bodies[0];

                const hitPoint = intersection.point;

                this.moveHitMarker(hitPoint);
                this.showHitMarker();
                this.moveMovementPlane(hitPoint, ray.direction);
                this.addJointConstraint(hitPoint, body);

                requestAnimationFrame(() => this.dragging = true);
            }
        }
    }

    onMiss() {
        // Do nothing
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();

        const screenCenterCoords = new Vector2();

        window.addEventListener('pointermove', _event => {
            if (!this.dragging) {
                return;
            }

            this.raycaster.setFromCamera(screenCenterCoords, Game.getContext().camera);
            const intersections = this.raycaster.intersectObject(this.movementPlane);
            if (intersections.length > 0) {
                const intersection = intersections[0];
                this.moveHitMarker(intersection.point);
                this.moveJointBody(intersection.point);
            }
        });
        window.addEventListener('pointerup', () => {
            if (this.isMovingObjects()) {
                this.removeJointConstraint();
                this.hideHitMarker();
                this.changeState(TelekineticFistsState.IDLE);
            }
        });
    }

    protected updateState() {
        super.updateState();
    }

    private initAnimationFlows() {
        this.addAnimationFlow('enable', this.animate('raise')
            .onStart(() => this.playRaiseSound())
            .thenCrossFadeTo('idle')
            .withDuration(0.4).flow);
        this.addAnimationFlow('disable', this.animate('idle').thenCrossFadeTo('lower').withDuration(0.25).flow);
    }

    private playRaiseSound() {
        this.playSound('raise', 0.1);
    }

    private canAttack(): boolean {
        return this.currentState === TelekineticFistsState.IDLE;
    }

    private isMovingObjects(): boolean {
        return this.currentState === TelekineticFistsState.MOVING_OBJECTS;
    }

    private showHitMarker() {
        this.hitMarker.visible = true;
    }

    private moveHitMarker(position: Vector3) {
        this.hitMarker.position.copy(position);
    }

    private hideHitMarker() {
        this.hitMarker.visible = false;
    }

    private moveMovementPlane = (() => {
        const rotationMatrix = new Matrix4();
        const up = new Vector3(0, 1, 0);
        const quaternion = new Quaternion();

        return (position: Vector3, direction: Vector3) => {
            this.movementPlane.position.copy(position);
            rotationMatrix.lookAt(this.position, direction, up);
            quaternion.setFromRotationMatrix(rotationMatrix);
            this.movementPlane.quaternion.copy(quaternion);
        };
    })();

    private addJointConstraint(hitPoint: Vector3, body: Body) {
        this.jointBody.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
        this.jointConstraint = new LockConstraint(body, this.jointBody);
        this.physicsManager.addConstraint(this.jointConstraint);
    }

    private removeJointConstraint() {
        if (this.jointConstraint) {
            this.physicsManager.removeConstraint(this.jointConstraint);
            this.jointConstraint = undefined;
        }
    }

    private moveJointBody(position: Vector3) {
        this.jointBody.position.set(position.x, position.y, position.z);
        if (this.jointConstraint) {
            this.jointConstraint.update();
        }
    }

    private get physicsManager(): PhysicsManager {
        return (this.parameters as TelekineticFistsParameters).physicsManager;
    }
}

export interface TelekineticFistsParameters extends WeaponParameters {
    physicsManager: PhysicsManager;
}

export class TelekineticFistsState extends WeaponState {
    static readonly MOVING_OBJECTS = 'moving-objects';
}
