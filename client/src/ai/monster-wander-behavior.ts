import {Mesh, MeshNormalMaterial, SphereGeometry, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {AgentBehavior} from './agent-behavior';
import {Monster} from '../entity/model/md5/monster/monster';

const MIN_STATE_CHANGE_INTERVAL_MILLIS = 2000;
const MAX_STATE_CHANGE_INTERVAL_MILLIS = 5000;

export class MonsterWanderBehavior implements AgentBehavior {
    private readonly monsterOrigin: Vector3;

    private stateChangeScheduledAt = -1;
    private _boundingAreaHelper?: Mesh;

    constructor(private readonly monster: Monster, private readonly boundingRadius = Infinity) {
        this.monsterOrigin = monster.position.clone();
    }

    update(_deltaTime: number) {
        const now = performance.now();
        if (this.stateChangeScheduledAt === -1) {
            this.stateChangeScheduledAt = now + randomInt(0, MAX_STATE_CHANGE_INTERVAL_MILLIS);
        } else if (this.stateChangeScheduledAt < now) {
            if (this.monster.isIdle()) {
                this.monster.randomDirection();
                this.monster.startWalking();
            } else {
                this.monster.stopWalking();
            }
            this.stateChangeScheduledAt = now + randomInt(MIN_STATE_CHANGE_INTERVAL_MILLIS,
                MAX_STATE_CHANGE_INTERVAL_MILLIS);
        }
    }

    get boundingAreaHelper(): Mesh | undefined {
        if (this.boundingRadius !== Infinity && !this._boundingAreaHelper) {
            this._boundingAreaHelper = this.createBoundingAreaHelper(this.boundingRadius);
            this._boundingAreaHelper.position.copy(this.monsterOrigin);
        }
        return this._boundingAreaHelper;
    }

    private createBoundingAreaHelper(boundingRadius: number): Mesh {
        const sphereGeometry = new SphereGeometry(boundingRadius);
        const sphereMaterial = new MeshNormalMaterial({wireframe: true});
        return new Mesh(sphereGeometry, sphereMaterial);
    }
}
