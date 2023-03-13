import {Group, Intersection, Light, Raycaster, Scene, Vector2, Vector3} from 'three';

import {Area} from '../area/area';
import {isTangibleEntity, TangibleEntity} from '../tangible-entity';
import {Player} from '../player/player';
import {Weapon} from '../model/md5/weapon/weapon';
import {AttackEvent} from '../../event/weapon-events';
import {Monster} from '../model/md5/monster/monster';
import {PhysicsManager} from '../../physics/physics-manager';

const SCREEN_CENTER_COORDS = new Vector2();

export class GameMap extends Group implements TangibleEntity {
    readonly tangibleEntity = true;

    private readonly raycaster = new Raycaster();
    private readonly forceVector = new Vector3();

    constructor(readonly parameters: GameMapParameters) {
        super();

        for (const area of parameters.areas) {
            this.add(area);
        }

        for (const light of parameters.lights) {
            this.add(light);
        }

        for (const monster of parameters.monsters) {
            this.add(monster);
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

    registerCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.parameters.areas.forEach(area => area.registerCollisionModels(physicsManager, scene));
        this.parameters.monsters.forEach(monster => monster.registerCollisionModels(physicsManager, scene));
        this.parameters.player.registerCollisionModels(physicsManager, scene);
    }

    unregisterCollisionModels(physicsManager: PhysicsManager, scene: Scene) {
        this.parameters.areas.forEach(area => area.unregisterCollisionModels(physicsManager, scene));
        this.parameters.monsters.forEach(monster => monster.unregisterCollisionModels(physicsManager, scene));
        this.parameters.player.unregisterCollisionModels(physicsManager, scene);
    }

    update(deltaTime: number) {
        for (const area of this.parameters.areas) {
            area.update(deltaTime);
        }
        for (const monster of this.parameters.monsters) {
            monster.update(deltaTime);
        }
    }

    onAttack(_intersection: Intersection, _forceVector: Vector3, _weapon: Weapon) {
        // Do nothing
    }

    private _onAttack(e: AttackEvent) {
        let missed = true;
        this.raycaster.far = e.distance;

        let coords = e.coords;
        if (coords.length === 0) {
            coords = [SCREEN_CENTER_COORDS];
        }

        for (const c of coords) {
            this.raycaster.setFromCamera(c, this.parameters.player.camera);
            this.forceVector.unproject(this.parameters.player.camera).normalize().multiplyScalar(e.force).negate();
            const intersections = this.raycaster.intersectObjects(this.parameters.areas);
            for (const intersection of intersections) {
                let target: any = intersection.object;
                while (!isTangibleEntity(target) && target.parent) {
                    target = target.parent;
                }
                if (isTangibleEntity(target)) {
                    target.onAttack(intersection, this.forceVector, e.weapon);
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