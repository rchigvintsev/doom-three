var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var MouseButton = {LEFT: 1, MIDDLE: 2, RIGHT: 3};

    DT.MouseState = function () {
        this.pressedButtons = [];
        var $document = $(document);
        $document.mousedown($.proxy(this.onMouseDown, this));
        $document.mouseup($.proxy(this.onMouseUp, this));
    };

    DT.MouseState.prototype = {
        constructor: DT.MouseState,

        isButtonPressed: function (button) {
            return this.pressedButtons[button];
        },

        onMouseDown: function (e) {
            this.pressedButtons[e.which] = true;
        },

        onMouseUp: function (e) {
            this.pressedButtons[e.which] = false;
        }
    };

    DT.MouseState.MouseButton = Object.freeze(MouseButton);
})(DOOM_THREE);

export const MouseState = DOOM_THREE.MouseState;
