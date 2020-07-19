import {inherit} from '../util/oop-utils.js';
import {currentTime} from '../util/time.js';
import {Settings} from '../settings.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var definition = {
        cm: {
            bodies: [{
                mass: 80,
                material: 'models/player',
                fixedRotation: true,
                allowSleep: false,
                shapes: [{
                    type: 'sphere',
                    name: 'bottom-body',
                    radius: 15
                }, {
                    type: 'sphere',
                    name: 'top-body',
                    radius: 15,
                    offset: [0, 30, 0]
                }, {
                    type: 'sphere',
                    name: 'head',
                    radius: 6,
                    offset: [0, 51, 0]
                }]
            }]
        },
        sounds: {
            footsteps: 'player_sounds_footsteps',
            jumps: 'player_sounds_jump_small',
            landings: 'player_sounds_fastlanding'
        }
    };

    var BOBBING_SPEED = 0.1;
    var VIEW_BOBBING_MAGNITUDE = 0.002;

    var Foot = {LEFT: 0, RIGHT: 1};

    DT.Player = function (weapons, sounds, body) {
        THREE.Object3D.apply(this);

        this._weapons = weapons;
        this._activeWeapon = weapons['fists'];
        this._activeWeapon.enable();

        this._footstepSounds = [
            [sounds.footsteps[0], sounds.footsteps[1]],
            [sounds.footsteps[2], sounds.footsteps[3]]
        ];
        this._jumpSound = sounds.jumps[0];
        this._landSounds = sounds.landings;

        this._lastFoot = Foot.LEFT;

        this._body = body;
        this._movementDirection = new THREE.Vector3();
        this._previousDirection = new THREE.Vector3();

        this._walking = false;
        this._airborne = false;
        this._takeoffTime = 0;
        this._landTime = 0;
        this._bobbingAngle = 0;

        this._pitchObject = new THREE.Object3D();
        var weaponNames = Object.keys(this._weapons);
        for (var i = 0; i < weaponNames.length; i++) {
            this._pitchObject.add(this._weapons[weaponNames[i]]);
        }
        this.add(this._pitchObject);

        Settings.addEventListener('ghostModeChange', $.proxy(this.onGhostModeChange, this));
    };

    DT.Player.prototype = inherit(THREE.Object3D, {
        constructor: DT.Player,

        get body() {
            return this._body;
        },

        get pitchObject() {
            return this._pitchObject;
        },

        get airborne() {
            return this._airborne;
        },

        get movementDirection() {
            return this._movementDirection;
        },

        set movementDirection(value) {
            this._previousDirection.copy(this._movementDirection);
            this._movementDirection.copy(value);
        },

        get landTime() {
            return this._landTime;
        },

        walk: function (velocity) {
            if (Settings.ghostMode) {
                this.translateX(velocity.x);
                this.translateY(velocity.y);
                this.translateZ(velocity.z);
            } else {
                this._body.walk(velocity);
                this.playFootstepSound();
                this.updateBobbing();
            }
            this._walking = true;
        },

        jump: function (jumpSpeed) {
            if (!Settings.ghostMode) {
                this._body.jump(jumpSpeed);
                this._takeoffTime = currentTime();
                this._airborne = true;
                this.playJumpSound();
            }
        },

        attack: function () {
            this._activeWeapon.attack();
        },

        enableFlashlight: function () {
            this.changeWeapon('flashlight')
        },

        enableFists: function () {
            this.changeWeapon('fists')
        },

        changeWeapon: function (weaponName) {
            if (this._activeWeapon.name !== weaponName && this._activeWeapon.enabled) {
                var scope = this;
                const enableAnotherWeapon = function () {
                    console.debug('Weapon "' + scope._activeWeapon.name + '" is disabled');
                    scope._activeWeapon.removeEventListener('disabled', enableAnotherWeapon);
                    scope._activeWeapon = scope._weapons[weaponName];
                    scope._activeWeapon.enable();
                };
                this._activeWeapon.addEventListener('disabled', enableAnotherWeapon);
                this._activeWeapon.disable();
            }
        },

        playFootstepSound: function () {
            var currDir = this._movementDirection;
            var prevDir = this._previousDirection;

            var directionChanged = (currDir.x !== prevDir.x && currDir.x !== 0);
            if (!directionChanged)
                directionChanged = (currDir.z !== prevDir.z && currDir.z !== 0);

            if (directionChanged || !this._lastFootstepSound || !this._lastFootstepSound.playing) {
                var currentFoot = (this._lastFoot + 1) % 2;
                var footstepSound = math.pickRandom(this._footstepSounds[currentFoot]);
                var delay = math.random(100, 200);
                footstepSound.play(delay);

                this._lastFootstepSound = footstepSound;
                this._lastFoot = currentFoot;
            }
        },

        playJumpSound: function () {
            if (!this._jumpSound.playing)
                this._jumpSound.play();
        },

        playLandSound: function () {
            if (!this._lastLandSound || !this._lastLandSound.playing) {
                var landSound = math.pickRandom(this._landSounds);
                landSound.play();
                this._lastLandSound = landSound;
            }
        },

        followBodyPosition: function () {
            this._body.updatePlayerPosition(this);
        },

        update: function () {
            if (!Settings.ghostMode) {
                this.followBodyPosition();

                if (this._walking)
                    this._walking = false;
                else {
                    // Reset view bobbing
                    this._pitchObject.rotation.z = 0;
                }

                if (this._airborne) {
                    var cTime = currentTime();
                    var delta = cTime - this._takeoffTime;
                    // We should give the player a chance to get off the ground
                    if (delta > 100 && this._body.groundContacts) {
                        this._airborne = false;
                        this._landTime = cTime;
                        this.playLandSound();
                    }
                }
            }
            this._activeWeapon.refresh(this);
        },

        updateBobbing: function () {
            this._bobbingAngle += BOBBING_SPEED;
            this._pitchObject.rotation.z = Math.sin(this._bobbingAngle) * VIEW_BOBBING_MAGNITUDE;
            this._activeWeapon.updateBobbing(this._bobbingAngle);
        },

        onGhostModeChange: function (event) {
            if (!event.value) { // Ghost mode is switched off
                // Assume that the player was flying
                this._airborne = true;
                this._body.setPositionFromPlayer(this);
            }
        }
    });

    DT.Player.definition = Object.freeze(definition);
})(DOOM_THREE);

export const Player = DOOM_THREE.Player;
