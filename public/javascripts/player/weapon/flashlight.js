import {inherit} from '../../util/oop-utils.js';
import {Weapon} from './weapon.js';
import {GameWorld} from '../../game-world.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
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

    var PUNCH_FORCE = 400;

    DT.Flashlight = function (model, animationMixer, sounds, gameWorld, camera) {
        Weapon.apply(this, arguments);
        this.name = 'flashlight';

        // Force mesh to be always on top of other meshes
        model.renderOrder = 999;
        model.onBeforeRender = function (renderer, scene, camera, geometry, material) {
            if (material.name === 'models/characters/player/arm2')
                renderer.clearDepth();
        };

        this.initSpotLight();
        this.applyTubeDeformToBeam();

        this._gameWorld = gameWorld;
        this._camera = camera;
        this._swingActions = [this._actions['swing1'], this._actions['swing2']];

        this._wooshSounds = sounds.woosh;
    };

    DT.Flashlight.prototype = inherit(Weapon, {
        constructor: DT.Flashlight,

        initSpotLight: function () {
            this._spotLight = new THREE.SpotLight();
            this._spotLight.intensity = 1.5;
            this._spotLight.distance = 1000 * GameWorld.WORLD_SCALE;
            this._spotLight.angle = Math.PI / 6;
            this.add(this._spotLight);
            this.add(this._spotLight.target);
            this.updateSpotLight();

            this._lightCamera = new THREE.PerspectiveCamera(2 * this._spotLight.angle * 180 / Math.PI, 1.0, 1, 1000);
            this.add(this._lightCamera);
        },

        disable: function () {
            if (this._enabled) {
                this._enabled = false;
                var idleAction = this._actions['idle'];
                var lowerAction = this._actions['lower'];
                this.executeActionCrossFade(idleAction, {action: lowerAction, effectiveWeight: 10}, 0.25);
            }
        },

        update: function (player) {
            var $super = Object.getPrototypeOf(DT.Flashlight.prototype).update;
            $super.call(this, player);
            this.updateSpotLight();
        },

        updateAcceleration: function (direction) {
            var $super = Object.getPrototypeOf(DT.Flashlight.prototype).updateAcceleration;
            $super.call(this, direction);
            var offset = this._acceleration._offset;
            if (offset.x !== 0 || offset.y !== 0)
                this.applyTubeDeformToBeam(offset);
        },

        updateMatrixWorldRecursively: function (object) {
            object.updateMatrixWorld();
            var parent = object.parent;
            if (parent && parent.type !== 'Scene')
                this.updateMatrixWorldRecursively(parent);
        },

        updateSpotLight: function () {
            var bone5Position = new THREE.Vector3();
            var bone6Position = new THREE.Vector3();

            var direction = new THREE.Vector3();

            var lightPosition = new THREE.Vector3();
            var lightTargetPosition = new THREE.Vector3();

            return function () {
                this.updateMatrixWorldRecursively(this._model);

                var bones = this._model.skeleton.bones;

                bone5Position.setFromMatrixPosition(bones[5].matrixWorld);
                bone6Position.setFromMatrixPosition(bones[6].matrixWorld);
                direction.subVectors(bone5Position, bone6Position).normalize();

                this._spotLight.position.copy(this.worldToLocal(lightPosition.copy(bone5Position)));

                this.worldToLocal(lightTargetPosition.copy(bone5Position).add(direction.multiplyScalar(2.0)));
                this._spotLight.target.position.copy(lightTargetPosition);
            }
        }(),

        updateProjectionMatrix: function (m) {
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
        },

        drop: function (time, rotationX) {
            var $super = Object.getPrototypeOf(DT.Flashlight.prototype).drop;
            var offset = $super.call(this, time, rotationX);
            if (offset)
                this.applyTubeDeformToBeam(offset);
        },

        attack: function () {
            var raycaster = new THREE.Raycaster();
            raycaster.far = 20 * GameWorld.WORLD_SCALE;

            var coords = new THREE.Vector2();
            var force = new THREE.Vector3();

            return function () {
                if (!this.punching()) {
                    raycaster.setFromCamera(coords, this._camera);
                    var currentArea = this._gameWorld.currentArea;
                    var intersects = raycaster.intersectObjects(currentArea.objects, true);
                    var impacts = 0;
                    for (var i = 0; i < intersects.length; i++) {
                        var intersection = intersects[i];
                        var object = intersection.object;
                        if (object) {
                            this._camera.getWorldDirection(force);
                            force.negate().multiplyScalar(PUNCH_FORCE);
                            object.takePunch(force, intersects[i].point);
                            this.playImpactSound();
                            impacts++;
                        }
                    }

                    var swingAction = math.pickRandom(this._swingActions);
                    var idleAction = this._actions['idle'];
                    idleAction.stop();

                    swingAction.setEffectiveTimeScale(1.1);
                    swingAction.reset().play();
                    this.executeActionCrossFade(swingAction, idleAction, 2.0);

                    this._lastSwingAction = swingAction;

                    if (impacts === 0)
                        this.playWooshSound();
                }
            }
        }(),

        punching: function () {
            return this._lastSwingAction && this._lastSwingAction.isRunning();
        },

        applyTubeDeformToBeam: function (offset) {
            var view = new THREE.Vector3(0, 0, -15); // Magic number
            if (offset) {
                view.z -= offset.x / GameWorld.WORLD_SCALE;
                view.y += offset.y / GameWorld.WORLD_SCALE;
            }

            var vertices = this._model.geometry.vertices;

            // Beam vertices
            var v1 = vertices[520];
            var v2 = vertices[521];
            var v3 = vertices[522];
            var v4 = vertices[523];

            // v1 - v3 and v2 - v4 have the shortest distances

            var v1v3Len = v4.clone().sub(v2).length();
            var v2v4Len = v3.clone().sub(v1).length();

            var v1v3Mid = new THREE.Vector3(
                0.5 * (v1.x + v3.x),
                0.5 * (v1.y + v3.y),
                0.5 * (v1.z + v3.z)
            );

            var v2v4Mid = new THREE.Vector3(
                0.5 * (v2.x + v4.x),
                0.5 * (v2.y + v4.y),
                0.5 * (v2.z + v4.z)
            );

            var major = new THREE.Vector3().subVectors(v1v3Mid, v2v4Mid);
            var minor = new THREE.Vector3();

            var dir = v1v3Mid.clone().sub(view);
            minor.crossVectors(major, dir).normalize();

            minor.multiplyScalar(0.5 * v1v3Len);
            v1.copy(v1v3Mid.clone().sub(minor));
            v3.copy(v1v3Mid.clone().add(minor));

            dir = v2v4Mid.clone().sub(view);
            minor.crossVectors(major, dir).normalize();

            minor.multiplyScalar(0.5 * v2v4Len);
            v2.copy(v2v4Mid.clone().add(minor));
            v4.copy(v2v4Mid.clone().sub(minor));

            this._model.geometry.verticesNeedUpdate = true;
        },

        playWooshSound: function () {
            if (!this._wooshSound || !this._wooshSound.playing) {
                var wooshSound = math.pickRandom(this._wooshSounds);
                wooshSound.play(100);
                this._wooshSound = wooshSound;
            }
        }
    });

    DT.Flashlight.definition = Object.freeze(definition);
})(DOOM_THREE);

export const Flashlight = DOOM_THREE.Flashlight;
