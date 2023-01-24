import {Group, Intersection, Light, Raycaster, Scene, Vector2, Vector3} from 'three';

import {Area} from '../area/area';
import {isTangibleEntity, TangibleEntity} from '../tangible-entity';
import {PhysicsSystem} from '../../physics/physics-system';
import {Player} from '../player/player';
import {Hud} from '../hud/hud';
import {Weapon} from '../model/md5/weapon/weapon';
import {AttackEvent} from '../../event/weapon-events';

const SCREEN_CENTER_COORDS = new Vector2();

export class GameMap extends Group implements TangibleEntity {
    readonly tangibleEntity = true;

    private readonly raycaster = new Raycaster();
    private readonly forceVector = new Vector3();

    constructor(readonly player: Player,
                readonly hud: Hud,
                private readonly areas: Area[],
                private readonly lights: Light[]) {
        super();

        for (const area of areas) {
            this.add(area);
        }

        for (const light of lights) {
            this.add(light);
        }

        this.add(this.player);
        this.player.weapons.forEach(weapon => {
            if (weapon.skeletonHelper) {
                this.add(weapon.skeletonHelper);
            }
        });
        this.player.addEventListener(AttackEvent.TYPE, e => this._onAttack(<AttackEvent><unknown>e));
    }

    init() {
        // Do nothing
    }

    registerCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.areas.forEach(area => area.registerCollisionModels(physicsSystem, scene));
        this.player.registerCollisionModels(physicsSystem, scene);
    }

    unregisterCollisionModels(physicsSystem: PhysicsSystem, scene: Scene) {
        this.areas.forEach(area => area.unregisterCollisionModels(physicsSystem, scene));
        this.player.unregisterCollisionModels(physicsSystem, scene);
    }

    update(deltaTime: number) {
        for (const area of this.areas) {
            area.update(deltaTime);
        }
        this.player.update(deltaTime);
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
            this.raycaster.setFromCamera(c, this.player.camera);
            this.forceVector.unproject(this.player.camera).normalize().multiplyScalar(e.force).negate();
            const intersections = this.raycaster.intersectObjects(this.areas);
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