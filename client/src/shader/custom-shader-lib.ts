import {CustomShaderChunk} from './custom-shader-chunk';

export const CustomShaderLib: {[shader: string]: {vertexShader: string, fragmentShader: string}} = {
    dust: {
        vertexShader: CustomShaderChunk.dustVertex,
        fragmentShader: CustomShaderChunk.dustFragment
    }
};
