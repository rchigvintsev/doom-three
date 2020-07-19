export class ScrollingText extends THREE.Mesh {
    constructor() {
        super(undefined, undefined);
    }

    init(textSize, boundaries, windowWidth, time, pauseTime) {
        const leftClippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), boundaries.x);
        const rightClippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), boundaries.y);

        for (let child of this.children) {
            child.material.clippingPlanes = [leftClippingPlane, rightClippingPlane];
            child.userData.origin = child.position.clone();
        }

        this.userData.origin = this.position.clone();
        this._tween = new TWEEN.Tween({value: 0})
            .to({value: textSize.x + windowWidth}, time)
            .onUpdate(o => this.position.x = this.userData.origin.x - o.value)
            .repeat(Infinity)
            .repeatDelay(pauseTime);
        this._tween.start();
    }

    update(time) {
        this._tween.update(time);
    }
}
