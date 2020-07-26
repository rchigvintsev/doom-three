import {ShaderLib} from './shader/shader-lib.js';
import {UpdatableShaderMaterial} from "./updatable-shader-material.js";

/**
 * Auxiliary material for light sources to look them more realistic. Its "lightIntensity" parameter allows to adjust
 * how bright the light source will be.
 */
export class LightBasicMaterial extends UpdatableShaderMaterial {
    constructor() {
        const lightBasicShader = ShaderLib['light_basic'];
        super({
            uniforms: THREE.UniformsUtils.clone(lightBasicShader.uniforms),
            vertexShader: lightBasicShader.vertexShader,
            fragmentShader: lightBasicShader.fragmentShader
        });

        this._color = new THREE.Color(0xffffff);
        this._opacity = 1;
        this._map = null;
        this._alphaMap = null;
        this._lightIntensity = 1;

        this._init();
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }

    get map() {
        return this._map;
    }

    set map(value) {
        this._map = value;
        if (this.uniforms)
            this.uniforms.map.value = value;
    }

    get alphaMap() {
        return this._alphaMap;
    }

    set alphaMap(value) {
        this._alphaMap = value;
        if (this.uniforms)
            this.uniforms.alphaMap.value = value;
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        this._opacity = value;
        if (this.uniforms)
            this.uniforms.opacity.value = value;
    }

    get lightIntensity() {
        return this._lightIntensity;
    }

    set lightIntensity(value) {
        this._lightIntensity = value;
        if (this.uniforms)
            this.uniforms.lightIntensity.value = value;
    }

    _init() {
        this.uniforms.opacity.value = this._opacity;
        this.uniforms.map.value = this._map;
        this.uniforms.alphaMap.value = this._alphaMap;
        this.uniforms.lightIntensity.value = this._lightIntensity;
    }
}
