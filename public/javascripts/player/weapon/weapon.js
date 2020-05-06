import {currentTime} from '../../util/common-utils.js';
import {AnimationUtils} from '../../util/animation-utils.js';
import {GameWorld} from '../../game-world.js';
import {Settings} from '../../settings.js';
import {GameContext, SystemType} from '../../game-context.js';


const BOBBING_MAGNITUDE_X = 0.40;
const BOBBING_MAGNITUDE_Y = 0.40;

const LOGGED_ACCELERATIONS_NUMBER = 16;
const WEAPON_OFFSET_TIME = 500;

const LAND_OFFSET = -8;
const LAND_DEFLECT_TIME = 150;
const LAND_RETURN_TIME = 300;

export class Weapon extends THREE.Group {
    constructor(mesh, sounds) {
        super();

        this.visible = false;

        this._mesh = this._createSkinnedMesh(mesh);
        this.add(this._mesh);

        this._initActions(this._mesh);

        this._origin = new THREE.Vector3().copy(mesh.position);
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
    }

    get enabled() {
        return this._enabled;
    }

    enable() {
        if (!this._enabled) {
            this._enabled = true;
            const raiseAction = this._actions['raise'];
            const idleAction = this._actions['idle'];
            raiseAction.reset().play();
            this._executeActionCrossFade(raiseAction, idleAction, 0.40);
            this._playRaiseSound();
        }
    }

    disable() {
        if (this._enabled) {
            this._enabled = false;
            const idleAction = this._actions['idle'];
            const lowerAction = this._actions['lower'];
            this._executeActionCrossFade(idleAction, lowerAction, 0.25);
        }
    }

    refresh(player) {
        if (this._enabled) {
            this._invokeMaterialUpdaters(this._mesh.material);
            if (!Settings.ghostMode) {
                this._updateAcceleration(player.movementDirection);
                this._drop(player.landTime, player.pitchObject.rotation.x * -1);
            }
        }
    }

    updateBobbing(bobbingAngle) {
        if (this._enabled) {
            const x = Math.sin(bobbingAngle) * BOBBING_MAGNITUDE_X;
            const y = -Math.abs(Math.sin(bobbingAngle) * BOBBING_MAGNITUDE_Y);
            this._bobbingOffset.set(x, y, 0).multiplyScalar(GameWorld.WORLD_SCALE);
            this._mesh.position.addVectors(this._origin, this._acceleration._offset).add(this._bobbingOffset);
        }
    }

    _createSkinnedMesh(sourceMesh) {
        const bufferGeometry = this._createBufferGeometry(sourceMesh.geometry);
        const skinnedMesh = new THREE.SkinnedMesh(bufferGeometry, sourceMesh.material);

        this._initSkeleton(skinnedMesh, sourceMesh.geometry);

        skinnedMesh.scale.setScalar(GameWorld.WORLD_SCALE);

        if (sourceMesh.position) {
            skinnedMesh.position.copy(sourceMesh.position);
        }
        if (sourceMesh.rotation) {
            skinnedMesh.rotation.copy(sourceMesh.rotation);
        }

        return skinnedMesh
    }

    _initSkeleton(skinnedMesh, geometry) {
        let bones = [], bone, gbone;
        let i, il;

        if (geometry && geometry.bones != null) {
            // First, create array of 'Bone' objects from geometry data
            for (i = 0, il = geometry.bones.length; i < il; i++) {
                gbone = geometry.bones[i];
                // Create new 'Bone' object
                bone = new THREE.Bone();
                bones.push(bone);

                // Apply values
                bone.name = gbone.name;
                bone.position.fromArray(gbone.pos);
                bone.quaternion.fromArray(gbone.rotq);
                if (gbone.scl != null) {
                    bone.scale.fromArray(gbone.scl);
                }
            }

            // Second, create bone hierarchy
            for (i = 0, il = geometry.bones.length; i < il; i++) {
                gbone = geometry.bones[i];
                if (gbone.parent !== -1 && gbone.parent != null && bones[gbone.parent] != null) {
                    // Subsequent bones in the hierarchy
                    bones[gbone.parent].add(bones[i]);
                } else {
                    // Topmost bone, immediate child of the skinned mesh
                    skinnedMesh.add(bones[i]);
                }
            }
        }

        skinnedMesh.bind(new THREE.Skeleton(bones));
        skinnedMesh.normalizeSkinWeights();
    }

    _createBufferGeometry(sourceGeometry) {
        const bufferGeometry = new THREE.BufferGeometry().fromGeometry(sourceGeometry);
        if (bufferGeometry.getAttribute('skinWeight') == null) {
            bufferGeometry.addAttribute('skinWeight', new THREE.Float32BufferAttribute(0, 4));
        }
        if (sourceGeometry.animations) {
            bufferGeometry.animations = sourceGeometry.animations;
        }
        if (sourceGeometry.bones) {
            bufferGeometry.bones = sourceGeometry.bones;
        }
        return bufferGeometry;
    }

    _initActions(mesh) {
        this._actions = {};

        const animationMixer = new THREE.AnimationMixer(mesh);
        const animations = mesh.geometry.animations;
        for (let i = 0; i < animations.length; i++) {
            let animation = animations[i];
            let action = AnimationUtils.extendAnimationAction(animationMixer.clipAction(animation.name));
            if (animation.name !== 'idle') {
                action.setLoop(THREE.LoopOnce);
            }
            this._actions[animation.name] = action;
        }

        animationMixer.addEventListener('started', (e) => this._onAnimationStarted(e));
        animationMixer.addEventListener('finished', (e) => this._onAnimationFinished(e));

        const context = GameContext.getInstance();
        context.getSystem(SystemType.ANIMATION).registerAnimationMixer(animationMixer);
    }

    _playRaiseSound() {
        if (!this._raiseSound.playing) {
            this._raiseSound.play(100);
        }
    }

    _playImpactSound() {
        if (!this._impactSound || !this._impactSound.playing) {
            const impactSound = math.pickRandom(this._impactSounds);
            impactSound.play();
            this._impactSound = impactSound;
        }
    }

    // TODO: call 'refresh/onRefresh' method if material supports it
    _invokeMaterialUpdaters(material) {
        if (material.__updaters) {
            for (let i = 0; i < material.__updaters.length; i++) {
                material.__updaters[i](material);
            }
        } else if (material.materials) {
            for (let j = 0; j < material.materials.length; j++) {
                this._invokeMaterialUpdaters(material.materials[j]);
            }
        } else if (material instanceof Array) {
            for (let k = 0; k < material.length; k++) {
                this._invokeMaterialUpdaters(material[k]);
            }
        }
    }

    _updateAcceleration(direction) {
        if (this._enabled) {
            if (direction.x !== this._previousDirection.x) {
                this._logAcceleration(direction.x - this._previousDirection.x, 0, 0);
            }
            if (direction.y > this._previousDirection.y) {
                this._logAcceleration(0, direction.y - this._previousDirection.y, 0);
            }
            if (direction.z !== this._previousDirection.z) {
                this._logAcceleration(0, 0, direction.z - this._previousDirection.z);
            }

            this._previousDirection.copy(direction);
            this._acceleration._offset.set(0, 0, 0);

            let stop = this._acceleration._logCounter - LOGGED_ACCELERATIONS_NUMBER;
            if (stop < 0) {
                stop = 0;
            }
            const cTime = currentTime();
            for (let i = this._acceleration._logCounter - 1; i >= stop; i--) {
                const acceleration = this._acceleration._log[i % LOGGED_ACCELERATIONS_NUMBER];
                const t = cTime - acceleration.time;
                if (t >= WEAPON_OFFSET_TIME) {
                    break;	// Remainder is too old to care about
                }
                let f = t / WEAPON_OFFSET_TIME;
                f = (Math.cos(f * 2.0 * Math.PI) - 1.0) * 0.5 * GameWorld.WORLD_SCALE;

                this._acceleration._offset.x += f * acceleration.direction.x;
                this._acceleration._offset.y += f * acceleration.direction.y;
                this._acceleration._offset.z += f * acceleration.direction.z;
            }
            this._mesh.position.addVectors(this._origin, this._bobbingOffset).add(this._acceleration._offset);
        }
    }

    _logAcceleration(x, y, z) {
        const accelerationIndex = this._acceleration._logCounter % LOGGED_ACCELERATIONS_NUMBER;
        let acceleration = this._acceleration._log[accelerationIndex];
        this._acceleration._logCounter++;
        if (!acceleration) {
            acceleration = {direction: new THREE.Vector3()};
            this._acceleration._log[accelerationIndex] = acceleration;
        }
        acceleration.time = currentTime();
        acceleration.direction.set(x, y, z);
    }

    _drop = (() => {
        const v = new THREE.Vector3(0, 1, 0);
        const e = new THREE.Euler();

        return (time, rotationX) => {
            if (this._enabled) {
                const delta = currentTime() - time;
                if (delta < LAND_DEFLECT_TIME + LAND_RETURN_TIME) {
                    v.set(0, 1, 0);
                    e.x = rotationX;
                    v.applyEuler(e);
                    let f;
                    if (delta < LAND_DEFLECT_TIME) {
                        f = LAND_OFFSET * 0.25 * delta / LAND_DEFLECT_TIME;
                    } else {
                        f = LAND_OFFSET * 0.25 * (LAND_DEFLECT_TIME + LAND_RETURN_TIME - delta) / LAND_RETURN_TIME;
                    }
                    v.multiplyScalar(f).multiplyScalar(GameWorld.WORLD_SCALE);
                    this._mesh.position.add(v);
                    return v;
                }
                return null;
            }
        };
    })();

    _executeActionCrossFade(startAction, endAction, duration) {
        let endActionParams = {};
        if (endAction.action) {
            endActionParams = endAction;
            endAction = endActionParams.action;
        }
        endAction.enabled = true;
        endAction.setEffectiveTimeScale(endActionParams.effectiveTimeScale || 1);
        endAction.setEffectiveWeight(endActionParams.effectiveWeight || 1);
        endAction.reset().play();

        startAction.crossFadeTo(endAction, duration, false);
    }

    _onAnimationStarted(e) {
        if (e.action === this._actions['raise'] && this._enabled) {
            this.visible = true;
            this._onShow();
            this.dispatchEvent({type: 'enabled'});
        }
    }

    _onAnimationFinished(e) {
        if (e.action === this._actions['lower'] && !this._enabled) {
            this.visible = false;
            this._onHide();
            this.dispatchEvent({type: 'disabled'});
        }
    }

    _onShow() {
        // Override in subclasses
    }

    _onHide() {
        // Override in subclasses
    }
}

Object.assign(Weapon, THREE.EventDispatcher.prototype);
