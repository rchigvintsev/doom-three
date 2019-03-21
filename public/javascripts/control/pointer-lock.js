import {MouseState} from './mouse-state.js';

export class PointerLock extends THREE.EventDispatcher {
    constructor(canvas) {
        super();
        this._canvas = canvas;
        this._enabled = false;
    }

    init() {
        $(this._canvas).mousedown($.proxy(this._onMouseDown, this));
    }

    _onMouseDown(event) {
        if (event.which === MouseState.MouseButton.RIGHT)
            this._requestPointerLock();
    }

    _onPointerLockChange() {
        if (document.pointerLockElement === this._canvas
            || document.msPointerLockElement === this._canvas
            || document.mozPointerLockElement === this._canvas
            || document.webkitPointerLockElement === this._canvas) {
            this._enabled = true;
            this.dispatchEvent({type: 'pointerLock'});
        } else {
            this._enabled = false;
            this._detachPointerLockEventHandlers();
            this.dispatchEvent({type: 'pointerUnlock'});
        }
    }

    _onPointerLockError() {
        // Do nothing
    }

    _requestPointerLock() {
        if (this._enabled)
            return;
        this._attachPointerLockEventHandlers();
        this._canvas.requestPointerLock = this._canvas.requestPointerLock
            || this._canvas.msRequestPointerLock
            || this._canvas.mozRequestPointerLock
            || this._canvas.webkitRequestPointerLock;
        this._canvas.requestPointerLock();
    }

    _attachPointerLockEventHandlers() {
        const pointerlockchangeHandler = $.proxy(this._onPointerLockChange, this);
        const pointerlockerrorHandler = $.proxy(this._onPointerLockError, this);

        const $document = $(document);

        $document.on('pointerlockchange.doom-three', pointerlockchangeHandler);
        $document.on('mozpointerlockchange.doom-three', pointerlockchangeHandler);
        $document.on('webkitpointerlockchange.doom-three', pointerlockchangeHandler);

        $document.on('pointerlockerror.doom-three', pointerlockerrorHandler);
        $document.on('mozpointerlockerror.doom-three', pointerlockerrorHandler);
        $document.on('webkitpointerlockerror.doom-three', pointerlockerrorHandler);
    }

    // noinspection JSMethodCanBeStatic
    _detachPointerLockEventHandlers() {
        const $document = $(document);

        $document.off('pointerlockchange.doom-three');
        $document.off('mozpointerlockchange.doom-three');
        $document.off('webkitpointerlockchange.doom-three');

        $document.off('pointerlockerror.doom-three');
        $document.off('mozpointerlockerror.doom-three');
        $document.off('webkitpointerlockerror.doom-three');
    }
}

// Object.assign(PointerLock.prototype, THREE.EventDispatcher.prototype);