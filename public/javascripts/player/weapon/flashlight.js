import {Weapon} from './weapon.js';
import {GameWorld} from '../../game-world.js';


var definition = {
    name: 'flashlight',
    model: 'models/md5/items/flashlight_view/viewflashlight.md5mesh',
    materials: [
        'models/characters/player/arm2',
        'models/items/flashlight/flashlight2',
        'models/items/flashlight/bulb',
        'models/items/flashlight/beam1',
        'models/items/flashlight/flare',
        'lights/flashlight5'
    ],
    animations: [
        'models/md5/items/flashlight_view/idle.md5anim',
        'models/md5/items/flashlight_view/lower.md5anim',
        'models/md5/items/flashlight_view/raise.md5anim',
        'models/md5/items/flashlight_view/swing1.md5anim',
        'models/md5/items/flashlight_view/swing2.md5anim'
    ],
    position: [-2, 16, 7],
    sounds: {
        raise: 'fist_raise',
        woosh: 'fist_whoosh',
        impact: 'monster_zombie_fat_wrench'
    }
};

const PUNCH_FORCE = 400;

export class Flashlight extends Weapon {
    constructor(mesh, sounds, gameWorld, camera) {
        super(mesh, sounds);

        this.name = 'flashlight';
        this._vertices = mesh.geometry.vertices;

        // Force mesh to be always on top of other meshes
        // model.renderOrder = 999;
        /*model.onBeforeRender = function (renderer, scene, camera, geometry, material) {
            if (material.name === 'models/characters/player/arm2')
                renderer.clearDepth();
        };*/

        this._initSpotLight();
        this._applyTubeDeformToBeam();

        this._gameWorld = gameWorld;
        this._camera = camera;
        this._swingActions = [this._actions['swing1'], this._actions['swing2']];
        this._wooshSounds = sounds.woosh;
    }

    disable() {
        if (this._enabled) {
            this._enabled = false;
            const idleAction = this._actions['idle'];
            const lowerAction = this._actions['lower'];
            this._executeActionCrossFade(idleAction, {action: lowerAction, effectiveWeight: 10}, 0.25);
        }
    }

    attack = (() => {
        const raycaster = new THREE.Raycaster();
        raycaster.far = 20 * GameWorld.WORLD_SCALE;

        const coords = new THREE.Vector2();
        const force = new THREE.Vector3();

        return () => {
            if (!this._punching) {
                raycaster.setFromCamera(coords, this._camera);
                const currentArea = this._gameWorld.currentArea;
                const intersects = raycaster.intersectObjects(currentArea.objects, true);
                let impacts = 0;
                for (let i = 0; i < intersects.length; i++) {
                    const intersection = intersects[i];
                    let object = intersection.object;
                    if (object) {
                        while (!object.takePunch && object.parent) {
                            object = object.parent;
                        }
                        if (object.takePunch) {
                            this._camera.getWorldDirection(force);
                            force.negate().multiplyScalar(PUNCH_FORCE);
                            object.takePunch(force, intersects[i].point);
                        }
                        this._playImpactSound();
                        impacts++;
                    }
                }

                const swingAction = math.pickRandom(this._swingActions);
                const idleAction = this._actions['idle'];
                idleAction.stop();

                swingAction.setEffectiveTimeScale(1.1);
                swingAction.reset().play();
                this._executeActionCrossFade(swingAction, idleAction, 2.0);

                this._lastSwingAction = swingAction;

                if (impacts === 0) {
                    this._playWooshSound();
                }
            }
        }
    })();

    refresh(player) {
        super.refresh(player);
        this._updateSpotLight();
    }

    updateProjectionMatrix(m) {
        this._lightCamera.updateProjectionMatrix();
        this._lightCamera.position.copy(this._spotLight.position);
        this._lightCamera.lookAt(this._spotLight.target.position);
        this._lightCamera.updateMatrixWorld();

        m.set(
            0.5, 0.0, 0.0, 0.5,
            0.0, 0.5, 0.0, 0.5,
            0.0, 0.0, 0.5, 0.5,
            0.0, 0.0, 0.0, 1.0
        );
        m.multiply(this._lightCamera.projectionMatrix);
        m.multiply(this._lightCamera.matrixWorldInverse);
    }

    get _punching() {
        return this._lastSwingAction && this._lastSwingAction.isRunning();
    }

    _initSpotLight() {
        this._spotLight = new THREE.SpotLight();
        this._spotLight.intensity = 1.5;
        this._spotLight.distance = 1000 * GameWorld.WORLD_SCALE;
        this._spotLight.angle = Math.PI / 6;
        this.add(this._spotLight);
        this.add(this._spotLight.target);
        this._updateSpotLight();

        this._lightCamera = new THREE.PerspectiveCamera(2 * this._spotLight.angle * 180 / Math.PI, 1.0, 1, 1000);
        this.add(this._lightCamera);
    }

    _updateAcceleration(direction) {
        super._updateAcceleration(direction);
        const offset = this._acceleration._offset;
        if (offset.x !== 0 || offset.y !== 0) {
            this._applyTubeDeformToBeam(offset);
        }
    }

    _updateMatrixWorldRecursively(object) {
        object.updateMatrixWorld();
        const parent = object.parent;
        if (parent && parent.type !== 'Scene') {
            this._updateMatrixWorldRecursively(parent);
        }
    }

    _updateSpotLight = (() => {
        const bone5Position = new THREE.Vector3();
        const bone6Position = new THREE.Vector3();

        const direction = new THREE.Vector3();

        const lightPosition = new THREE.Vector3();
        const lightTargetPosition = new THREE.Vector3();

        return () => {
            this._updateMatrixWorldRecursively(this._mesh);

            const bones = this._mesh.skeleton.bones;

            bone5Position.setFromMatrixPosition(bones[5].matrixWorld);
            bone6Position.setFromMatrixPosition(bones[6].matrixWorld);
            direction.subVectors(bone5Position, bone6Position).normalize();

            this._spotLight.position.copy(this.worldToLocal(lightPosition.copy(bone5Position)));

            this.worldToLocal(lightTargetPosition.copy(bone5Position).add(direction.multiplyScalar(2.0)));
            this._spotLight.target.position.copy(lightTargetPosition);
        }
    })();

    _drop(time, rotationX) {
        const offset = super._drop(time, rotationX);
        if (offset) {
            this._applyTubeDeformToBeam(offset);
        }
    }

    _applyTubeDeformToBeam(offset) {
        const view = new THREE.Vector3(0, 0, -15); // Magic number
        if (offset) {
            view.z -= offset.x / GameWorld.WORLD_SCALE;
            view.y += offset.y / GameWorld.WORLD_SCALE;
        }

        // Beam vertices
        const v1 = this._vertices[520];
        const v2 = this._vertices[521];
        const v3 = this._vertices[522];
        const v4 = this._vertices[523];

        // v1 - v3 and v2 - v4 have the shortest distances

        const v1v3Len = v4.clone().sub(v2).length();
        const v2v4Len = v3.clone().sub(v1).length();

        const v1v3Mid = new THREE.Vector3(
            0.5 * (v1.x + v3.x),
            0.5 * (v1.y + v3.y),
            0.5 * (v1.z + v3.z)
        );

        const v2v4Mid = new THREE.Vector3(
            0.5 * (v2.x + v4.x),
            0.5 * (v2.y + v4.y),
            0.5 * (v2.z + v4.z)
        );

        const major = new THREE.Vector3().subVectors(v1v3Mid, v2v4Mid);
        const minor = new THREE.Vector3();

        let dir = v1v3Mid.clone().sub(view);
        minor.crossVectors(major, dir).normalize();

        minor.multiplyScalar(0.5 * v1v3Len);
        v1.copy(v1v3Mid.clone().sub(minor));
        v3.copy(v1v3Mid.clone().add(minor));

        dir = v2v4Mid.clone().sub(view);
        minor.crossVectors(major, dir).normalize();

        minor.multiplyScalar(0.5 * v2v4Len);
        v2.copy(v2v4Mid.clone().add(minor));
        v4.copy(v2v4Mid.clone().sub(minor));

        this._mesh.geometry.verticesNeedUpdate = true;
    }

    _playWooshSound() {
        if (!this._wooshSound || !this._wooshSound.playing) {
            const wooshSound = math.pickRandom(this._wooshSounds);
            wooshSound.play(100);
            this._wooshSound = wooshSound;
        }
    }

    _onShow() {
        Flashlight._visible = true;
    }

    _onHide() {
        Flashlight._visible = false;
    }
}

Flashlight._visible = false;
Flashlight.definition = Object.freeze(definition);
