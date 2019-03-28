import {inherit} from '../../util/oop-utils.js';
import {currentTime} from '../../util/common-utils.js';
import {AnimationUtils} from '../../util/animation-utils.js';
import {GameWorld} from '../../game-world.js';
import {Settings} from '../../settings.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var BOBBING_MAGNITUDE_X = 0.40;
    var BOBBING_MAGNITUDE_Y = 0.40;

    var LOGGED_ACCELERATIONS_NUMBER = 16;
    var WEAPON_OFFSET_TIME = 500;

    var LAND_OFFSET = -8;
    var LAND_DEFLECT_TIME = 150;
    var LAND_RETURN_TIME = 300;

    DT.Weapon = function (model, animationMixer, sounds) {
        THREE.Object3D.apply(this);
        this.visible = false;

        this.add(model);
        this._model = model;
        this._origin = new THREE.Vector3().copy(model.position);

        this._actions = {};
        for (var i = 0; i < model.geometry.animations.length; i++) {
            var animation = model.geometry.animations[i];
            var action = AnimationUtils.extendAnimationAction(animationMixer.clipAction(animation.name));
            if (animation.name !== 'idle')
                action.setLoop(THREE.LoopOnce);
            this._actions[animation.name] = action;
        }

        animationMixer.addEventListener('started', $.proxy(this.onAnimationStarted, this));
        animationMixer.addEventListener('finished', $.proxy(this.onAnimationFinished, this));

        this._acceleration = {
            _offset: new THREE.Vector3(),
            _log: [],
            _logCounter: 0
        };
        this._bobbingOffset = new THREE.Vector3();
        this._previousDirection = new THREE.Vector3();

        this._raiseSound = sounds['raise'][0];
        this.add(this._raiseSound);
        this._impactSounds = sounds.impact;
    };

    DT.Weapon.prototype = inherit(THREE.Object3D, {
        constructor: DT.Weapon,

        get enabled() {
            return this._enabled;
        },

        enable: function () {
            if (!this._enabled) {
                this._enabled = true;
                var raiseAction = this._actions['raise'];
                var idleAction = this._actions['idle'];
                raiseAction.reset().play();
                this.executeActionCrossFade(raiseAction, idleAction, 0.40);
                this.playRaiseSound();
            }
        },

        disable: function () {
            if (this._enabled) {
                this._enabled = false;
                var idleAction = this._actions['idle'];
                var lowerAction = this._actions['lower'];
                this.executeActionCrossFade(idleAction, lowerAction, 0.25);
            }
        },

        playRaiseSound: function () {
            if (!this._raiseSound.playing)
                this._raiseSound.play(100);
        },

        update: function (player) {
            if (this._enabled) {
                this.invokeMaterialUpdaters(this._model.material);
                if (!Settings.ghostMode) {
                    this.updateAcceleration(player.movementDirection);
                    this.drop(player.landTime, player.pitchObject.rotation.x * -1);
                }
            }
        },

        invokeMaterialUpdaters: function (material) {
            if (material.__updaters)
                for (var i = 0; i < material.__updaters.length; i++)
                    material.__updaters[i](material);
            else if (material.materials)
                for (var j = 0; j < material.materials.length; j++)
                    this.invokeMaterialUpdaters(material.materials[j]);
            else if (material instanceof Array)
                for (var k = 0; k < material.length; k++)
                    this.invokeMaterialUpdaters(material[k]);
        },

        updateBobbing: function (bobbingAngle) {
            if (this._enabled) {
                var x = Math.sin(bobbingAngle) * BOBBING_MAGNITUDE_X;
                var y = -Math.abs(Math.sin(bobbingAngle) * BOBBING_MAGNITUDE_Y);
                this._bobbingOffset.set(x, y, 0).multiplyScalar(GameWorld.WORLD_SCALE);
                this._model.position.addVectors(this._origin, this._acceleration._offset)
                    .add(this._bobbingOffset);
            }
        },

        updateAcceleration: function (direction) {
            if (this._enabled) {
                if (direction.x !== this._previousDirection.x)
                    this.logAcceleration(direction.x - this._previousDirection.x, 0, 0);
                if (direction.y > this._previousDirection.y)
                    this.logAcceleration(0, direction.y - this._previousDirection.y, 0);
                if (direction.z !== this._previousDirection.z)
                    this.logAcceleration(0, 0, direction.z - this._previousDirection.z);

                this._previousDirection.copy(direction);
                this._acceleration._offset.set(0, 0, 0);

                var stop = this._acceleration._logCounter - LOGGED_ACCELERATIONS_NUMBER;
                if (stop < 0)
                    stop = 0;
                var cTime = currentTime();
                for (var i = this._acceleration._logCounter - 1; i >= stop; i--) {
                    var acceleration = this._acceleration._log[i % LOGGED_ACCELERATIONS_NUMBER];
                    var t = cTime - acceleration.time;
                    if (t >= WEAPON_OFFSET_TIME)
                        break;	// Remainder is too old to care about
                    var f = t / WEAPON_OFFSET_TIME;
                    f = (Math.cos(f * 2.0 * Math.PI) - 1.0) * 0.5 * GameWorld.WORLD_SCALE;

                    this._acceleration._offset.x += f * acceleration.direction.x;
                    this._acceleration._offset.y += f * acceleration.direction.y;
                    this._acceleration._offset.z += f * acceleration.direction.z;
                }
                this._model.position.addVectors(this._origin, this._bobbingOffset)
                    .add(this._acceleration._offset);
            }
        },

        logAcceleration: function (x, y, z) {
            var accelerationIndex = this._acceleration._logCounter % LOGGED_ACCELERATIONS_NUMBER;
            var acceleration = this._acceleration._log[accelerationIndex];
            this._acceleration._logCounter++;
            if (!acceleration) {
                acceleration = {direction: new THREE.Vector3()};
                this._acceleration._log[accelerationIndex] = acceleration;
            }
            acceleration.time = currentTime();
            acceleration.direction.set(x, y, z);
        },

        drop: function () {
            var v = new THREE.Vector3(0, 1, 0);
            var e = new THREE.Euler();

            return function (time, rotationX) {
                if (this._enabled) {
                    var delta = currentTime() - time;
                    if (delta < LAND_DEFLECT_TIME + LAND_RETURN_TIME) {
                        v.set(0, 1, 0);
                        e.x = rotationX;
                        v.applyEuler(e);
                        var f;
                        if (delta < LAND_DEFLECT_TIME)
                            f = LAND_OFFSET * 0.25 * delta / LAND_DEFLECT_TIME;
                        else
                            f = LAND_OFFSET * 0.25 * (LAND_DEFLECT_TIME + LAND_RETURN_TIME - delta) / LAND_RETURN_TIME;
                        v.multiplyScalar(f).multiplyScalar(GameWorld.WORLD_SCALE);
                        this._model.position.add(v);
                        return v;
                    }
                    return null;
                }
            };
        }(),

        executeActionCrossFade: function (startAction, endAction, duration) {
            var endActionParams = {};
            if (endAction.action) {
                endActionParams = endAction;
                endAction = endActionParams.action;
            }
            endAction.enabled = true;
            endAction.setEffectiveTimeScale(endActionParams.effectiveTimeScale || 1);
            endAction.setEffectiveWeight(endActionParams.effectiveWeight || 1);
            endAction.reset().play();

            startAction.crossFadeTo(endAction, duration, false);
        },

        playImpactSound: function () {
            if (!this._impactSound || !this._impactSound.playing) {
                var impactSound = math.pickRandom(this._impactSounds);
                impactSound.play();
                this._impactSound = impactSound;
            }
        },

        onAnimationStarted: function (e) {
            if (e.action === this._actions['raise'] && this._enabled) {
                this.visible = true;
                this._onShow();
                this.dispatchEvent({type: 'enabled'});
            }
        },

        onAnimationFinished: function (e) {
            if (e.action === this._actions['lower'] && !this._enabled) {
                this.visible = false;
                this._onHide();
                this.dispatchEvent({type: 'disabled'});
            }
        },

        _onShow: function () {
            // Override in subclasses
        },

        _onHide: function () {
            // Override in subclasses
        }
    });

    Object.assign(DT.Weapon, THREE.EventDispatcher.prototype);
})(DOOM_THREE);

export const Weapon = DOOM_THREE.Weapon;
