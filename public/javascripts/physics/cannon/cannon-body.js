export class CannonBody extends CANNON.Body {
    constructor(options) {
        super(options);
    }

    get fixedPosition() {
        return this._fixedPosition;
    }

    set fixedPosition(fixedPosition) {
        this._fixedPosition = fixedPosition;
    }
}
