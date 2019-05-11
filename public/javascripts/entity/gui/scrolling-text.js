export class ScrollingText {
    constructor(textLayer, boundaries, windowWidth, time, pauseTime) {
        const leftClippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), boundaries.x);
        const rightClippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), boundaries.y);

        for (let child of textLayer.children) {
            child.material.clippingPlanes = [leftClippingPlane, rightClippingPlane];
            child.userData.origin = child.position.clone();
        }

        textLayer.userData.origin = textLayer.position.clone();
        this._tween = new TWEEN.Tween({value: 0})
            .to({value: textLayer.size.x + windowWidth}, time)
            .onUpdate((o) => {textLayer.position.x = textLayer.userData.origin.x - o.value})
            .repeat(Infinity)
            .repeatDelay(pauseTime);
        this._tween.start();
    }

    update(time) {
        this._tween.update(time);
    }
}
