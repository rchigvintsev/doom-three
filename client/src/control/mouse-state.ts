export class MouseState {
    static readonly BUTTON_LEFT = 0;
    static readonly BUTTON_MIDDLE = 1;
    static readonly BUTTON_RIGHT = 2;

    private readonly pressedButtons = new Map<number, boolean>();

    private initialized = false;

    init() {
        if (!this.initialized) {
            document.addEventListener('mousedown', e => this.onMouseDown(e));
            document.addEventListener('mouseup', e => this.onMouseUp(e));
            this.initialized = true;
        }
    }

    isButtonPressed(button: number): boolean {
        return !!this.pressedButtons.get(button);
    }

    private onMouseDown(e: MouseEvent) {
        this.pressedButtons.set(e.button, true);
    }

    private onMouseUp(e: MouseEvent) {
        this.pressedButtons.set(e.button, false);
    }
}
