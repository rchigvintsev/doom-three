import {Group, Light, Raycaster, Scene, Vector2, Vector3} from 'three';

import {Area} from '../area/area';
import {Entity} from '../entity';
import {PhysicsWorld} from '../../physics/physics-world';
import {Player} from '../player/player';
import {Weapon} from '../md5model/weapon/weapon';
import {AttackEvent} from '../../event/weapon-events';

export class GameMap extends Group implements Entity {
    private readonly raycaster = new Raycaster();
    private readonly mouseCoords = new Vector2();
    private readonly forceVector = new Vector3();

    constructor(readonly player: Player, private readonly areas: Area[], private readonly lights: Light[]) {
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

    registerCollisionModels(physicsWorld: PhysicsWorld, scene: Scene) {
        this.areas.forEach(area => area.registerCollisionModels(physicsWorld, scene));
        this.player.registerCollisionModels(physicsWorld, scene);
    }

    update(deltaTime: number) {
        for (const area of this.areas) {
            area.update(deltaTime);
        }
        this.player.update(deltaTime);
    }

    onAttack(_hitPoint: Vector3, _forceVector: Vector3, _weapon: Weapon): void {
        // Do nothing
    }

    private _onAttack(e: AttackEvent) {
        let hits = 0;

        this.raycaster.far = e.distance;
        this.raycaster.setFromCamera(this.mouseCoords, this.player.camera);

        this.player.camera.getWorldDirection(this.forceVector);
        this.forceVector.negate().multiplyScalar(e.force);

        const intersections = this.raycaster.intersectObjects(this.areas);
        for (const intersection of intersections) {
            let target: any = intersection.object;
            while (!target.onAttack && target.parent) {
                target = target.parent;
            }
            if (target.onAttack) {
                (<Entity>target).onAttack(intersection.point, this.forceVector, e.weapon);
                hits++;
            }
        }

        if (hits === 0) {
            e.weapon.onMiss();
        }
    }
}