import {Scene, Vector3} from 'three';

import {Vec3} from 'cannon-es';

import {CollisionModel} from '../../physics/collision-model';
import {isNamedShape} from '../../physics/cannon/named-shape';
import {NamedSphere} from '../../physics/cannon/named-sphere';
import {PhysicsWorld} from '../../physics/physics-world';

export class PlayerCollisionModel extends CollisionModel {
    private readonly originOffset = new Vec3();
    private readonly headOffset = new Vec3();

    private readonly _headPosition = new Vector3();

    constructor(private readonly delegate: CollisionModel) {
        super([]);

        const body = this.delegate.bodies[0];
        for (let i = 0; i < body.shapes.length; i++) {
            const shape = body.shapes[i];
            if (isNamedShape(shape)) {
                const shapeName = shape.name;
                if (shapeName === 'head') {
                    this.headOffset.copy(body.shapeOffsets[i]);
                } else if (shapeName === 'bottom-body') {
                    this.originOffset.y = (<NamedSphere>shape).radius;
                }
            }
        }
    }

    register(physicsWorld: PhysicsWorld, scene: Scene) {
        for (const body of this.delegate.bodies) {
            physicsWorld.addBody(body);
            if (body.helper) {
                scene.add(body.helper);
            }
        }
    }

    update(deltaTime: number) {
        this.delegate.update(deltaTime);
    }

    move(velocity: Vector3) {
        const body = this.delegate.bodies[0];
        body.velocity.x = velocity.x;
        body.velocity.z = velocity.z;
    }

    set origin(origin: Vector3) {
        this.delegate.bodies[0].position = new Vec3(origin.x, origin.y, origin.z).vadd(this.originOffset);
    }

    get headPosition(): Vector3 {
        const bodyPosition = this.delegate.bodies[0].position;
        const x = bodyPosition.x + this.headOffset.x;
        const y = bodyPosition.y + this.headOffset.y;
        const z = bodyPosition.z + this.headOffset.z;
        this._headPosition.set(x, y, z);
        return this._headPosition;
    }
}