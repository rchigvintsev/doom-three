import {
    BackSide,
    Intersection,
    Mesh,
    MeshLambertMaterial,
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
import {Game} from '../../../../game';
import {PhysicsManager} from '../../../../physics/physics-manager';
import {isTangibleEntity, TangibleEntity} from '../../../tangible-entity';
import {PhysicsBody} from '../../../../physics/physics-body';

const TELEKINESIS_DISTANCE = 200;

/**
 * Special type of weapon intended for debugging of game physics.
 */
export class TelekineticFists extends Weapon {
    private readonly telekinesisDistance: number;
    private readonly raycaster = new Raycaster();
    private readonly hitMarker: Mesh;
    private readonly movementSphere: Mesh;
    private readonly jointBody: Body;

    private hitTarget?: TangibleEntity;
    private jointConstraint?: Constraint;

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

        const movementSphereGeometry = new SphereGeometry();
        const movementSphereMaterial = new MeshLambertMaterial({side: BackSide});
        this.movementSphere = new Mesh(movementSphereGeometry, movementSphereMaterial);
        this.movementSphere.visible = false;
        context.scene.add(this.movementSphere);

        this.jointBody = new Body({mass: 0});
        this.jointBody.addShape(new Sphere(0.02));
        this.jointBody.collisionFilterGroup = 0;
        this.jointBody.collisionFilterMask = 0;
        parameters.physicsManager.addBody(this.jointBody);
    }

    attack() {
        if (this.canAttack()) {
            this.changeState(TelekineticFistsState.USING_TELEKINESIS);
            this.dispatchEvent(new AttackEvent(this, this.telekinesisDistance, 0));
        }
    }

    onHit(target: Mesh, body: PhysicsBody, _ray: Ray, intersection: Intersection) {
        if (!isTangibleEntity(target) || (target instanceof Monster && !target.isDead())) {
            return;
        }

        const collisionModel = target.collisionModels[0];
        if (!collisionModel.hasMass()) {
            return;
        }

        this.hitTarget = target;

        this.moveHitMarker(intersection.point);
        this.showHitMarker();

        this.scaleMovementSphere(intersection.point);
        this.moveMovementSphere();

        this.addJointConstraint(intersection.point, body);
        this.changeState(TelekineticFistsState.STARTING_TO_DRAG_OBJECT);
    }

    onMiss() {
        // Do nothing
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        if (this.enabled) {
            if (this.isStartingToDragObject()) {
                this.changeState(TelekineticFistsState.DRAGGING_OBJECT);
            } else if (this.isDraggingObject()) {
                this.moveMovementSphere();
                this.dragObject();
            }
        }
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();

        window.addEventListener('pointermove', _event => {
            if (!this.enabled || !this.isDraggingObject()) {
                return;
            }
            this.dragObject();
        });

        window.addEventListener('pointerup', () => {
            if (!this.enabled) {
                return;
            }

            this.removeJointConstraint();
            this.hideHitMarker();
            this.hitTarget = undefined;
            this.changeState(TelekineticFistsState.IDLE);
        });
    }

    private dragObject = (() => {
        const screenCenterCoords = new Vector2();

        return () => {
            this.raycaster.setFromCamera(screenCenterCoords, Game.getContext().camera);
            const intersections = this.raycaster.intersectObject(this.movementSphere);
            if (intersections.length > 0) {
                const intersection = intersections[0];
                this.moveHitMarker(intersection.point);
                this.moveJointBody(intersection.point);
            }
        };
    })();

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

    private isStartingToDragObject(): boolean {
        return this.currentState === TelekineticFistsState.STARTING_TO_DRAG_OBJECT;
    }

    private isDraggingObject(): boolean {
        return this.currentState === TelekineticFistsState.DRAGGING_OBJECT;
    }

    private showHitMarker() {
        this.hitMarker.visible = true;
    }

    private moveHitMarker(position: Vector3) {
        this.hitMarker.position.copy(position);
    }

    private hideHitMarker() {
        if (this.hitMarker.visible) {
            this.hitMarker.visible = false;
        }
    }

    private scaleMovementSphere = (() => {
        const worldPosition = new Vector3();

        return (hitPoint: Vector3) => {
            this.localToWorld(worldPosition.copy(this.position));
            const sphereRadius = worldPosition.distanceTo(hitPoint);
            // Sphere scale matches sphere radius
            this.movementSphere.scale.setScalar(sphereRadius);
        };
    })();

    private moveMovementSphere() {
        this.movementSphere.position.copy(this.position);
        this.localToWorld(this.movementSphere.position);
    }

    private addJointConstraint(hitPoint: Vector3, body: PhysicsBody) {
        this.jointBody.position.set(hitPoint.x, hitPoint.y, hitPoint.z);
        this.jointConstraint = new LockConstraint(<Body><unknown>body, this.jointBody);
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
            this.hitTarget?.collisionModels[0].wakeUp();
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
    static readonly USING_TELEKINESIS = 'using-telekinesis';
    static readonly STARTING_TO_DRAG_OBJECT = 'starting-to-drag-object';
    static readonly DRAGGING_OBJECT = 'dragging-object';
}
