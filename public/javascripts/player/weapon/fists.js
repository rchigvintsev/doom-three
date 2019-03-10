import {inherit} from '../../util/oop-utils.js';
import {Weapon} from './weapon.js';
import {GameWorld} from '../../game-world.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var definition = {
        name: 'fists',
        model: 'models/md5/weapons/fists_view/fists.md5mesh',
        materials: ['models/weapons/berserk/fist'],
        animations: [
            'models/md5/weapons/fists_view/idle.md5anim',
            'models/md5/weapons/fists_view/lower.md5anim',
            'models/md5/weapons/fists_view/raise.md5anim',
            'models/md5/weapons/fists_view/berserk_punch1.md5anim',
            'models/md5/weapons/fists_view/berserk_punch2.md5anim',
            'models/md5/weapons/fists_view/berserk_punch3.md5anim',
            'models/md5/weapons/fists_view/berserk_punch4.md5anim'
        ],
        position: [0, -6.5, 10],
        sounds: {
            raise: ['sound/weapons/fists/raise_fists_01.wav'],
            woosh: [
                'sound/xian/monsters/punch/whoosh_01.ogg',
                'sound/xian/monsters/punch/whoosh_02.ogg',
                'sound/xian/monsters/punch/whoosh_03.ogg',
                'sound/xian/monsters/punch/whoosh_04.ogg'
            ],
            impact: [
                'sound/weapons/fists/default_punch_01.wav',
                'sound/weapons/fists/default_punch_02.wav',
                'sound/weapons/fists/default_punch_03.wav',
                'sound/weapons/fists/default_punch_04.wav'
            ]
        }
    };

    var Arm = {LEFT: 0, RIGHT: 1};

    var PUNCH_FORCE = 200;

    DT.Fists = function (model, animationMixer, sounds, gameWorld, camera) {
        Weapon.apply(this, arguments);
        this.name = 'fists';

        this._gameWorld = gameWorld;
        this._camera = camera;
        this._lastArm = Arm.LEFT;
        this._punchActions = [
            [this._actions['berserk_punch1'], this._actions['berserk_punch3']],
            [this._actions['berserk_punch2'], this._actions['berserk_punch4']]
        ];

        this._wooshSounds = sounds.woosh;
    };

    DT.Fists.prototype = inherit(Weapon, {
        constructor: DT.Fists,

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

                    var currentArm = (this._lastArm + 1) % 2;
                    var punchAction = math.pickRandom(this._punchActions[currentArm]);
                    var idleAction = this._actions['idle'];

                    punchAction.reset().play();
                    this.executeActionCrossFade(punchAction, idleAction, 2.0);

                    this._lastArm = currentArm;
                    this._lastPunchAction = punchAction;

                    if (impacts === 0)
                        this.playWooshSound();
                }
            }
        }(),

        punching: function () {
            return this._lastPunchAction && this._lastPunchAction.isRunning();
        },

        playWooshSound: function () {
            if (!this._wooshSound || !this._wooshSound.playing) {
                var wooshSound = math.pickRandom(this._wooshSounds);
                wooshSound.play(0.1);
                this._wooshSound = wooshSound;
            }
        }
    });

    DT.Fists.definition = Object.freeze(definition);
})(DOOM_THREE);

export const Fists = DOOM_THREE.Fists;
