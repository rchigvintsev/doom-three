var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var KeyCode = {
        ARROW_UP: 38, ARROW_LEFT: 37, ARROW_DOWN: 40, ARROW_RIGHT: 39,
        ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
        W: 87, A: 65, S: 83, D: 68, F: 70, G: 71,
        SPACE: 32
    };

    DT.KeyboardState = function () {
        this.pressedKeys = [];
        var $document = $(document);
        $document.keydown($.proxy(this.onKeyDown, this));
        $document.keyup($.proxy(this.onKeyUp, this));
    };

    DT.KeyboardState.prototype = {
        constructor: DT.KeyboardState,

        isKeyPressed: function (keyCode) {
            return this.pressedKeys[keyCode];
        },

        onKeyDown: function (e) {
            this.pressedKeys[e.keyCode] = true;
        },

        onKeyUp: function (e) {
            this.pressedKeys[e.keyCode] = false;
        }
    };

    DT.KeyboardState.KeyCode = Object.freeze(KeyCode);
})(DOOM_THREE);

export const KeyboardState = DOOM_THREE.KeyboardState;
