import {Mesh, MeshNormalMaterial, SphereGeometry, Vector3} from 'three';

import {randomInt} from 'mathjs';

import {AgentBehavior} from './agent-behavior';
import {Monster} from '../entity/model/md5/monster/monster';
import {CollideEvent} from '../event/collide-event';

const MIN_STATE_CHANGE_INTERVAL_MILLIS = 2000;
const MAX_STATE_CHANGE_INTERVAL_MILLIS = 5000;

export class MonsterWanderBehavior implements AgentBehavior {
    private readonly monsterOrigin: Vector3;
    private readonly collideEventQueue = new CollideEventQueue();
    private readonly directionStatuses = new Map<Direction, DirectionStatus>();

    private stateChangeScheduledAt = -1;
    private obstacleDetected = false;
    private outOfBoundingArea = false;
    private _boundingAreaHelper?: Mesh;

    constructor(private readonly monster: Monster, private readonly boundingRadius = Infinity) {
        this.monsterOrigin = monster.position.clone();
        monster.collisionModel.addCollideEventListener(e => this.onCollide(e));
    }

    update(_deltaTime: number) {
        if (this.stateChangeScheduledAt === -1) {
            // First update
            this.scheduleNextStateChange(0);
            return;
        }

        if (this.stateChangeScheduledAt < performance.now()) {
            if (this.monster.isIdle()) {
                if (this.testDirections()) {
                    this.chooseNextDirection();
                    this.obstacleDetected = false;
                    this.monster.startWalking();
                    this.scheduleNextStateChange();
                }
            } else {
                this.monster.stopWalking();
                this.scheduleNextStateChange();
            }
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

    private testDirections(): boolean {
        if (this.directionStatuses.get(Direction.LEFT) == undefined) {
            this.collideEventQueue.clear();
            // Turn monster's collision model to the left
            this.monster.testTurn(-90);
            this.directionStatuses.set(Direction.LEFT, DirectionStatus.UNKNOWN);
            return false;
        }

        if (this.directionStatuses.get(Direction.LEFT) === DirectionStatus.UNKNOWN) {
            const directionStatus = this.collideEventQueue.isEmpty() ? DirectionStatus.CLEAR : DirectionStatus.BLOCKED;
            this.directionStatuses.set(Direction.LEFT, directionStatus);

            this.collideEventQueue.clear();
            // Turn monster's collision model to the right
            this.monster.testTurn(90);
            this.directionStatuses.set(Direction.RIGHT, DirectionStatus.UNKNOWN);
            return false;
        }

        if (this.directionStatuses.get(Direction.RIGHT) === DirectionStatus.UNKNOWN) {
            const directionStatus = this.collideEventQueue.isEmpty() ? DirectionStatus.CLEAR : DirectionStatus.BLOCKED;
            this.directionStatuses.set(Direction.RIGHT, directionStatus);
            // Return monster's collision model to the original position
            this.monster.testTurn(0);
            this.collideEventQueue.clear();
        }

        // Signal that test is completed
        return true;
    }

    private chooseNextDirection() {
        if (this.isDirectionBlocked(Direction.LEFT) && this.isDirectionBlocked(Direction.RIGHT)) {
            if (this.obstacleDetected || this.outOfBoundingArea || randomInt(0, 2) === 0) {
                // Turn monster back
                this.monster.turn(180);
            }
        } else if (this.isDirectionBlocked(Direction.LEFT)) {
            const angleFrom = this.outOfBoundingArea ? 135 : (this.obstacleDetected ? 90 : 0);
            this.monster.randomTurn(angleFrom, 181);
        } else if (this.isDirectionBlocked(Direction.RIGHT)) {
            const angleTo = this.outOfBoundingArea ? 226 : (this.obstacleDetected ? 271 : 361);
            this.monster.randomTurn(180, angleTo);
        } else {
            if (this.outOfBoundingArea) {
                this.monster.randomTurn(135, 226);
            } else if (this.obstacleDetected) {
                this.monster.randomTurn(90, 271);
            } else {
                this.monster.randomTurn();
            }
        }
        this.directionStatuses.clear();
    }

    private isDirectionBlocked(direction: Direction) {
        return this.directionStatuses.get(direction) === DirectionStatus.BLOCKED;
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

    private onCollide(e: CollideEvent) {
        this.collideEventQueue.push(e);

        if (this.monster.isWalking()) {
            this.monster.stopWalking();
            this.scheduleNextStateChange();
            this.obstacleDetected = true;
        }
    }
}

class CollideEventQueue {
    private readonly queue: CollideEvent[] = [];

    isEmpty(): boolean {
        return this.queue.length === 0;
    }

    push(e: CollideEvent) {
        if (this.isEmpty()) {
            this.queue.push(e);
            return;
        }

        const lastEvent = this.queue[this.queue.length - 1];
        if (e.body.name !== lastEvent.body.name || !e.contact.normal.equals(lastEvent.contact.normal)) {
            this.queue.push(e);
        }
    }

    clear() {
        this.queue.length = 0;
    }
}

enum Direction {LEFT, RIGHT}
enum DirectionStatus {UNKNOWN, CLEAR, BLOCKED}
