import {Euler, Intersection, MathUtils, Quaternion, Scene, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {Md5Model, Md5ModelParameters, Md5ModelState} from '../md5-model';
import {Sound} from '../../../sound/sound';
import {AgentBehavior} from '../../../../ai/agent-behavior';
import {Weapon} from '../weapon/weapon';
import {PhysicsManager} from '../../../../physics/physics-manager';
import {TangibleEntity} from '../../../tangible-entity';
import {CollisionModel} from '../../../../physics/collision-model';

export abstract class Monster extends Md5Model implements TangibleEntity {
    readonly behaviors: AgentBehavior[] = [];
    readonly direction = new Vector3();

    protected readonly positionOffset = new Vector3();

    private readonly _calculatedPosition = new Vector3();

    constructor(parameters: Md5ModelParameters) {
        super(parameters);
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

    onAttack(_intersection: Intersection, _forceVector: Vector3, _weapon: Weapon) {
        // Do nothing
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
        this.rotateZ(MathUtils.degToRad(angle * -1));
        this.updateDirection();
        this.updateCollisionModel();
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
}

export class MonsterState extends Md5ModelState {
    static readonly IDLE = 'idle';
    static readonly WALKING = 'walking';
    static readonly ATTACKING = 'attacking';
}
