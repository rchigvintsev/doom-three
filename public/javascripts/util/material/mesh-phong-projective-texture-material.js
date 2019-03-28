import {inherit} from '../oop-utils.js';
import {ShaderLib} from './shader/shader-lib.js';
import {Flashlight} from '../../player/weapon/flashlight.js';

var DOOM_THREE = DOOM_THREE || {};

// Code below based on the solution proposed by StackOverflow user @Popov
// (see https://stackoverflow.com/questions/15665074/calculating-the-position-on-spotlight-cone-in-phong-shader)
(function (DT) {
    DT.MeshPhongProjectiveTextureMaterial = function (projTexture) {
        var phongShaderLib = THREE.ShaderLib['phong'];
        var uniforms = THREE.UniformsUtils.clone(phongShaderLib.uniforms);
        uniforms['projTex'] = {'type': 't', 'value': projTexture};
        uniforms['uProjTexMatrix'] = {'type': 'm4', 'value': new THREE.Matrix4()};
        THREE.ShaderMaterial.call(this, {
            uniforms: uniforms,
            vertexShader: ShaderLib['phong_projective_texture'].vertex,
            fragmentShader: ShaderLib['phong_projective_texture'].fragment,
            lights: true
        });
    };

    DT.MeshPhongProjectiveTextureMaterial.prototype = inherit(THREE.ShaderMaterial, {
        constructor: DT.MeshPhongProjectiveTextureMaterial,

        update: function () {
            var projMatrix = new THREE.Matrix4();

            return function () {
                if (Flashlight.visible) {
                    this._flashlight.updateProjectionMatrix(projMatrix);
                    this.uniforms.uProjTexMatrix.value = projMatrix;
                }
            };
        }(),

        get map() {
            return this.uniforms['map'].value;
        },

        set map(value) {
            this.uniforms['map'].value = value;
        },

        get normalMap() {
            return this.uniforms['normalMap'].value;
        },

        set normalMap(value) {
            this.uniforms['normalMap'].value = value;
        },

        get specularMap() {
            return this.uniforms['specularMap'].value;
        },

        set specularMap(value) {
            this.uniforms['specularMap'].value = value;
        },

        get specular() {
            return this.uniforms['specular'].value;
        },

        set specular(value) {
            this.uniforms['specular'].value = value;
        },

        get shininess() {
            return this.uniforms['shininess'].value;
        },

        set shininess(value) {
            this.uniforms['shininess'].value = value;
        }
    });
})(DOOM_THREE);

export const MeshPhongProjectiveTextureMaterial = DOOM_THREE.MeshPhongProjectiveTextureMaterial;
