export class LwoPolygon extends THREE.Face3 {
    constructor(a, b, c) {
        super(a, b, c);
        this._vertexUv = {};
    }

    get vertexUv() {
        return this._vertexUv;
    }
}
