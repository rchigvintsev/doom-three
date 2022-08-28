import {IUniform, Matrix4, ShaderLib, UniformsUtils} from 'three';

import {CustomShaderChunk} from './custom-shader-chunk';

export const CustomShaderLib: { [shader: string]: { uniforms: IUniform[], vertexShader: string, fragmentShader: string } } = {
    dust: {
        uniforms: [],
        vertexShader: CustomShaderChunk.dustVertex,
        fragmentShader: CustomShaderChunk.dustFragment
    },

    phongFlashlight: {
        uniforms: UniformsUtils.merge([
            ShaderLib.phong.uniforms,
            {
                flashlightVisible: {value: false},
                flashlightTextureProjectionMatrix: {value: new Matrix4()},
                flashlight: {
                    value: {},
                    properties: {
                        color: {},
                        position: {},
                        direction: {},
                        distance: {},
                        coneCos: {},
                        penumbraCos: {},
                        decay: {},
                        projectedTexture: {}
                    }
                }
            }
        ]),
        vertexShader: CustomShaderChunk.phongFlashlightVertex,
        fragmentShader: CustomShaderChunk.phongFlashlightFragment
    }
};