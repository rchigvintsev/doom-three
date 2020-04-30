import {Weapon} from './weapon.js';
import {GameWorld} from '../../game-world.js';

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
        raise: 'fist_raise',
        woosh: 'fist_whoosh',
        impact: 'fist_impact'
    }
};

const Arm = {LEFT: 0, RIGHT: 1};

const PUNCH_FORCE = 200;

export class Fists extends Weapon {
    constructor(mesh, sounds, gameWorld, camera) {
        super(mesh, sounds);

        this.name = 'fists';

        this._gameWorld = gameWorld;
        this._camera = camera;
        this._lastArm = Arm.LEFT;
        this._punchActions = [
            [this._actions['berserk_punch1'], this._actions['berserk_punch3']],
            [this._actions['berserk_punch2'], this._actions['berserk_punch4']]
        ];

        this._wooshSounds = sounds.woosh;
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

                const currentArm = (this._lastArm + 1) % 2;
                const punchAction = math.pickRandom(this._punchActions[currentArm]);
                const idleAction = this._actions['idle'];

                punchAction.reset().play();
                this._executeActionCrossFade(punchAction, idleAction, 2.0);

                this._lastArm = currentArm;
                this._lastPunchAction = punchAction;

                if (impacts === 0) {
                    this._playWooshSound();
                }
            }
        }
    })();

    get _punching() {
        return this._lastPunchAction && this._lastPunchAction.isRunning();
    }

    _playWooshSound() {
        if (!this._wooshSound || !this._wooshSound.playing) {
            const wooshSound = math.pickRandom(this._wooshSounds);
            wooshSound.play(100);
            this._wooshSound = wooshSound;
        }
    }
}

Fists.definition = Object.freeze(definition);
