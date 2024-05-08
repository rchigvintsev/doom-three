import {Group, Light, Raycaster, Vector2, Vector3} from 'three';

import {Area} from '../area/area';
import {isTangibleEntity, TangibleEntity} from '../tangible-entity';
import {Player} from '../player/player';
import {AttackEvent} from '../../event/weapon-events';
import {Monster} from '../model/md5/monster/monster';
import {PhysicsManager} from '../../physics/physics-manager';
import {Object3D} from 'three/src/core/Object3D';
import {Game} from '../../game';
import {CollisionModel} from '../../physics/collision-model';

const SCREEN_CENTER_COORDS = new Vector2();

export class GameMap extends Group implements TangibleEntity {
    readonly tangibleEntity = true;

    private readonly raycaster = new Raycaster();
    private readonly force = new Vector3();

    private readonly areasAndMonsters: Object3D[] = [];

    constructor(readonly parameters: GameMapParameters) {
        super();

        for (const area of parameters.areas) {
            this.add(area);
            this.areasAndMonsters.push(area);
        }

        for (const light of parameters.lights) {
            this.add(light);
        }

        for (const monster of parameters.monsters) {
            this.add(monster);
            this.areasAndMonsters.push(monster);
            if (monster.skeletonHelper) {
                this.add(monster.skeletonHelper);
            }
        }

        this.add(parameters.player);
        parameters.player.weapons.forEach(weapon => {
            if (weapon.skeletonHelper) {
                this.add(weapon.skeletonHelper);
            }
        });
        parameters.player.addEventListener(AttackEvent.TYPE, e => this._onAttack(<AttackEvent><unknown>e));
    }

    init() {
        // Do nothing
    }

    get collisionModels(): CollisionModel[] {
        const collisionModels: CollisionModel[] = [];
        this.parameters.areas.forEach(area => collisionModels.push(...area.collisionModels));
        this.parameters.monsters.forEach(monster => collisionModels.push(...monster.collisionModels));
        collisionModels.push(...this.parameters.player.collisionModels);
        return collisionModels;
    }

    registerCollisionModels(physicsManager: PhysicsManager) {
        this.parameters.areas.forEach(area => area.registerCollisionModels(physicsManager));
        this.parameters.monsters.forEach(monster => monster.registerCollisionModels(physicsManager));
        this.parameters.player.registerCollisionModels(physicsManager);
    }

    unregisterCollisionModels(physicsManager: PhysicsManager) {
        this.parameters.areas.forEach(area => area.unregisterCollisionModels(physicsManager));
        this.parameters.monsters.forEach(monster => monster.unregisterCollisionModels(physicsManager));
        this.parameters.player.unregisterCollisionModels(physicsManager);
    }

    update(deltaTime: number) {
        for (const area of this.parameters.areas) {
            area.update(deltaTime);
        }
        for (const monster of this.parameters.monsters) {
            monster.update(deltaTime);
        }
    }

    private _onAttack(e: AttackEvent) {
        let missed = true;
        this.raycaster.far = e.distance;

        let coords = e.coords;
        if (coords.length === 0) {
            coords = [SCREEN_CENTER_COORDS];
        }

        const camera = Game.getContext().camera;

        for (const c of coords) {
            this.raycaster.setFromCamera(c, camera);
            this.force.unproject(camera).normalize().multiplyScalar(e.force).negate();

            const intersections = this.raycaster.intersectObjects(this.areasAndMonsters);
            for (const intersection of intersections) {
                let target: any = intersection.object;
                while (!isTangibleEntity(target) && target.parent) {
                    target = target.parent;
                }
                if (isTangibleEntity(target)) {
                    if (target.onAttack) {
                        target.onAttack(e.weapon, this.force, this.raycaster.ray, intersection);
                    }
                    missed = false;
                    break;
                }
            }
        }

        if (missed) {
            e.weapon.onMiss();
        }
    }
}

export interface GameMapParameters {
    player: Player;
    areas: Area[];
    lights: Light[];
    monsters: Monster[];
}