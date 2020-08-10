export class CannonBody extends CANNON.Body {
    constructor(options) {
        super(options);
    }

    get fixedPosition() {
        return false;
    }

    update() {
        // Do nothing
    }
}
