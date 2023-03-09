import {Mesh, MeshNormalMaterial, SphereGeometry, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {AgentBehavior} from './agent-behavior';
import {Monster} from '../entity/model/md5/monster/monster';

const MIN_STATE_CHANGE_INTERVAL_MILLIS = 2000;
const MAX_STATE_CHANGE_INTERVAL_MILLIS = 5000;

export class MonsterWanderBehavior implements AgentBehavior {
    private readonly monsterOrigin: Vector3;

    private stateChangeScheduledAt = -1;
    private outOfBoundingArea = false;
    private _boundingAreaHelper?: Mesh;

    constructor(private readonly monster: Monster, private readonly boundingRadius = Infinity) {
        this.monsterOrigin = monster.position.clone();
    }

    update(_deltaTime: number) {
        if (this.stateChangeScheduledAt === -1) {
            // First update
            this.scheduleNextStateChange(0);
        } else if (this.stateChangeScheduledAt < performance.now()) {
            if (this.monster.isIdle()) {
                if (this.outOfBoundingArea) {
                    this.monster.randomDirection(135, 225);
                } else {
                    this.monster.randomDirection();
                }
                this.monster.startWalking();
            } else {
                this.monster.stopWalking();
            }
            this.scheduleNextStateChange();
        } else if (this.boundingRadius !== Infinity && this.monster.isWalking()) {
            const distanceFromOrigin = this.monsterOrigin.distanceTo(this.monster.calculatedPosition);
            if (distanceFromOrigin >= this.boundingRadius) {
                if (!this.outOfBoundingArea) {
                    this.monster.stopWalking();
                    this.scheduleNextStateChange();
                    this.outOfBoundingArea = true;
                }
            } else {
                this.outOfBoundingArea = false;
            }
        }
    }

    get boundingAreaHelper(): Mesh | undefined {
        if (this.boundingRadius !== Infinity && !this._boundingAreaHelper) {
            this._boundingAreaHelper = this.createBoundingAreaHelper(this.boundingRadius);
            this._boundingAreaHelper.position.copy(this.monsterOrigin);
        }
        return this._boundingAreaHelper;
    }

    private scheduleNextStateChange(intervalFrom = MIN_STATE_CHANGE_INTERVAL_MILLIS,
                                    intervalTo = MAX_STATE_CHANGE_INTERVAL_MILLIS) {
        this.stateChangeScheduledAt = performance.now() + randomInt(intervalFrom, intervalTo);
    }

    private createBoundingAreaHelper(boundingRadius: number): Mesh {
        const sphereGeometry = new SphereGeometry(boundingRadius);
        const sphereMaterial = new MeshNormalMaterial({wireframe: true});
        return new Mesh(sphereGeometry, sphereMaterial);
    }
}
