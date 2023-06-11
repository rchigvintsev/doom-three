import {Bone, Euler, Intersection, MathUtils, Matrix4, Quaternion, Ray, Scene, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';
import {Sound} from '../../../sound/sound';
import {AgentBehavior} from '../../../../ai/agent-behavior';
import {Weapon} from '../weapon/weapon';
import {PhysicsManager} from '../../../../physics/physics-manager';
import {TangibleEntity} from '../../../tangible-entity';
import {CollisionModel} from '../../../../physics/collision-model';
import {PhysicsBody} from '../../../../physics/physics-body';

export abstract class Monster extends Md5Model implements TangibleEntity {
    readonly tangibleEntity = true;
    readonly behaviors: AgentBehavior[] = [];
    readonly direction = new Vector3();

    protected readonly positionOffset = new Vector3();
    protected turnAngle = 0;
    protected health = 100;

    private readonly _calculatedPosition = new Vector3();

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    protected doInit() {
        super.doInit();
        this.collisionModel.onHitCallback = (body, weapon) => this.onBodyHit(body, weapon);
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        this.collisionModel.update(deltaTime);
        this.updateBehaviors(deltaTime);
        this.updateDirection();
        if (this.isIdle()) {
            this.resetSkeletonPosition();
        }
    }

    onAttack(weapon: Weapon, force: Vector3, ray: Ray, intersection: Intersection) {
        this.collisionModel.onAttack(weapon, force, ray, intersection.point);
    }

    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.collisionModel.register(physicsManager, scene);
    }

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.collisionModel.unregister(physicsManager, scene);
    }

    abstract startWalking(): void;

    abstract stopWalking(): void;

    get calculatedPosition(): Vector3 {
        return this._calculatedPosition.copy(this.position).add(this.positionOffset);
    }

    get collisionModel(): CollisionModel {
        return this.parameters.collisionModel!;
    }

    isIdle(): boolean {
        return this.currentState === MonsterState.IDLE;
    }

    isWalking(): boolean {
        return this.currentState === MonsterState.WALKING;
    }

    turn(angle: number) {
        if (angle !== 0) {
            this.turnAngle += angle;
            this.rotateZ(MathUtils.degToRad(angle * -1));
            this.updateDirection();
            this.updateCollisionModel();
        }
    }

    randomTurn(angleFrom = 0, angleTo = 360) {
        this.turn(randomInt(angleFrom, angleTo));
    }

    testTurn = (() => {
        const q1 = new Quaternion();
        const q2 = new Quaternion();
        const zAxis = new Vector3(0, 0, 1);

        return (angle: number) => {
            q1.setFromAxisAngle(zAxis, MathUtils.degToRad(angle * -1));
            q2.copy(this.quaternion).multiply(q1);
            this.updateCollisionModel(this.calculatedPosition, q2);
        };
    })();

    protected isAttacking(): boolean {
        return this.currentState === MonsterState.ATTACKING;
    }

    protected playSound(soundName: string, delay?: number): Sound | undefined {
        const sound = super.playSound(soundName, delay);
        if (sound && !sound.parent) {
            this.add(sound);
        }
        return sound;
    }

    protected playSingleSound(soundName: string, delay?: number): Sound | undefined {
        const sound = super.playSingleSound(soundName, delay);
        if (sound && !sound.parent) {
            this.add(sound);
        }
        return sound;
    }

    protected canAttack() {
        return this.currentState === MonsterState.IDLE;
    }

    protected resetSkeletonPosition() {
        this.skeleton.bones[0].position.x = 0;
        this.skeleton.bones[0].position.z = 0;
        if (this.wireframeHelper) {
            this.wireframeHelper.skeleton.bones[0].position.x = 0;
            this.wireframeHelper.skeleton.bones[0].position.z = 0;
        }
    }

    protected updateCollisionModel(position: Vector3 = this.calculatedPosition,
                                   quaternion: Quaternion = this.quaternion) {
        this.collisionModel.position.setFromVector3(position);
        this.collisionModel.quaternion.copy(quaternion);
    }

    protected updateRagdollPart = (() => {
        const boneMatrix = new Matrix4();
        const ragdollMatrix = new Matrix4();
        const rotationMatrix = new Matrix4();
        const translationMatrix = new Matrix4();

        const v1 = new Vector3();
        const v2 = new Vector3();

        const yAxis = new Vector3(0, 1, 0);

        const position = new Vector3();
        const quaternion = new Quaternion();
        const scale = new Vector3();

        return (ragdollPart: PhysicsBody,
                parameters: {
                    boneA: Bone,
                    boneB?: Bone,
                    rotationFunc?: (rotationMatrix: Matrix4, direction: Vector3) => void,
                    translationFunc?: (translationMatrix: Matrix4, length: number) => void
                }) => {
            if (!parameters.boneB) {
                translationMatrix.identity();
                if (parameters.translationFunc) {
                    parameters.translationFunc(translationMatrix, 0);
                }

                ragdollMatrix
                    .identity()
                    .multiply(parameters.boneA.matrixWorld)
                    .multiply(translationMatrix)
                    .decompose(position, quaternion, scale);
                ragdollPart.setPosition(position);
                ragdollPart.setQuaternion(quaternion);
                return;
            }

            v1.setFromMatrixPosition(boneMatrix.identity().multiply(parameters.boneA.matrixWorld));
            v2.setFromMatrixPosition(boneMatrix.identity().multiply(parameters.boneB.matrixWorld));

            const angle = MathUtils.degToRad(this.turnAngle);
            v1.applyQuaternion(quaternion.setFromAxisAngle(yAxis, angle));
            v2.applyQuaternion(quaternion.setFromAxisAngle(yAxis, angle));

            const direction = v2.sub(v1);
            const length = direction.length() / this.config.worldScale;

            rotationMatrix.identity();
            translationMatrix.identity();

            if (parameters.rotationFunc) {
                parameters.rotationFunc(rotationMatrix, direction.normalize());
            }

            if (parameters.translationFunc) {
                parameters.translationFunc(translationMatrix, length);
            } else {
                translationMatrix.makeTranslation(0, length / 2.0, 0);
            }

            ragdollMatrix
                .identity()
                .multiply(parameters.boneA.matrixWorld)
                .multiply(rotationMatrix)
                .multiply(translationMatrix)
                .decompose(position, quaternion, scale);

            ragdollPart.setPosition(position);
            ragdollPart.setQuaternion(quaternion);
        };
    })();

    private updateBehaviors(deltaTime: number) {
        for (const behavior of this.behaviors) {
            behavior.update(deltaTime);
        }
    }

    private updateDirection = (() => {
        const directionRotation = new Euler();

        return () => {
            directionRotation.set(this.rotation.x, this.rotation.y, this.rotation.z - MathUtils.degToRad(90));
            this.getWorldDirection(this.direction).applyEuler(directionRotation).normalize();
        };
    })();

    private onBodyHit(body: PhysicsBody, weapon: Weapon) {
        this.health -= (weapon.damage * body.damageFactor);
        if (this.health <= 0) {
            console.log(`Monster "${this.name}" is dead`);
        }
    }
}

export class MonsterState extends Md5ModelState {
    static readonly IDLE = 'idle';
    static readonly WALKING = 'walking';
    static readonly ATTACKING = 'attacking';
}
