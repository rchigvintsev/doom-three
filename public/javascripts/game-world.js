import {MapArea} from './map/map-area.js';

export class GameWorld {
    static get WORLD_SCALE() {
        return 0.01;
    }

    constructor(playerOrigin, playerRotation) {
        this._playerOrigin = playerOrigin;
        this._playerRotation = playerRotation;
        this._currentArea = new MapArea();
        this._triggers = [];
    }

    get currentArea() {
        return this._currentArea;
    }

    get player() {
        return this._player;
    }

    set player(value) {
        this._player = value;
        this.updatePlayerPosition();
        this.updatePlayerRotation();
    }

    update(time) {
        // Always update player before map objects since they may need weapon world matrix to be updated
        this._player.update();
        this._currentArea.update(time);
    }

    updatePlayerPosition() {
        const position = new THREE.Vector3();
        position.fromArray(this._playerOrigin).multiplyScalar(GameWorld.WORLD_SCALE);
        position.y += (this._player.body.height / 2);
        this._player.body.position = position;
        this._player.followBodyPosition();
    }

    updatePlayerRotation() {
        this._player.rotation.fromArray(this._playerRotation);
    }

    addTrigger(trigger) {
        this._triggers.push(trigger);
    }

    activateTriggers() {
        for (let i = 0; i < this._triggers.length; i++)
            this._triggers[i].activate(this);
    }
}