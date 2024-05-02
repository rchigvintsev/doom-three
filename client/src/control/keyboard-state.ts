export class KeyboardState {
    static readonly KEY_ARROW_UP = 'ArrowUp';
    static readonly KEY_ARROW_LEFT = 'ArrowLeft';
    static readonly KEY_ARROW_DOWN = 'ArrowDown';
    static readonly KEY_ARROW_RIGHT = 'ArrowRight';
    static readonly KEY_ZERO = 'Digit0';
    static readonly KEY_ONE = 'Digit1';
    static readonly KEY_TWO = 'Digit2';
    static readonly KEY_THREE = 'Digit3';
    static readonly KEY_FOUR = 'Digit4';
    static readonly KEY_FIVE = 'Digit5';
    static readonly KEY_SIX = 'Digit6';
    static readonly KEY_SEVEN = 'Digit7';
    static readonly KEY_EIGHT = 'Digit8';
    static readonly KEY_NINE = 'Digit9';
    static readonly KEY_A = 'KeyA';
    static readonly KEY_B = 'KeyB';
    static readonly KEY_C = 'KeyC';
    static readonly KEY_D = 'KeyD';
    static readonly KEY_E = 'KeyE';
    static readonly KEY_F = 'KeyF';
    static readonly KEY_G = 'KeyG';
    static readonly KEY_H = 'KeyH';
    static readonly KEY_I = 'KeyI';
    static readonly KEY_J = 'KeyJ';
    static readonly KEY_K = 'KeyK';
    static readonly KEY_L = 'KeyL';
    static readonly KEY_M = 'KeyM';
    static readonly KEY_N = 'KeyN';
    static readonly KEY_O = 'KeyO';
    static readonly KEY_P = 'KeyP';
    static readonly KEY_Q = 'KeyQ';
    static readonly KEY_R = 'KeyR';
    static readonly KEY_S = 'KeyS';
    static readonly KEY_T = 'KeyT';
    static readonly KEY_U = 'KeyU';
    static readonly KEY_V = 'KeyV';
    static readonly KEY_W = 'KeyW';
    static readonly KEY_X = 'KeyX';
    static readonly KEY_Y = 'KeyY';
    static readonly KEY_Z = 'KeyZ';
    static readonly KEY_SPACE = 'Space';

    private readonly pressedKeys = new Map<string, boolean>();

    private initialized = false;

    init() {
        if (!this.initialized) {
            document.addEventListener('keydown', e => this.onKeyDown(e));
            document.addEventListener('keyup', e => this.onKeyUp(e));
            this.initialized = true;
        }
    }

    isKeyPressed(keyCode: string): boolean {
        return !!this.pressedKeys.get(keyCode);
    }

    onKeyDown(e: KeyboardEvent) {
        this.pressedKeys.set(e.code, true);
    }

    onKeyUp(e: KeyboardEvent) {
        this.pressedKeys.set(e.code, false);
    }
}
