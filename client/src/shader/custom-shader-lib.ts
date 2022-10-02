import {IUniform} from 'three';

import {CustomShaderChunk} from './custom-shader-chunk';

export const CustomShaderLib: { [shader: string]: { uniforms: IUniform[], vertexShader: string, fragmentShader: string } } = {
    dust: {
        uniforms: [],
        vertexShader: CustomShaderChunk.dustVertex,
        fragmentShader: CustomShaderChunk.dustFragment
    }
};