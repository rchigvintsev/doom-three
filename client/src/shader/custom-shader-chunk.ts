import * as dust from './dust.glsl.js';

export const CustomShaderChunk: {[shader: string]: any} = {
    dustVertex: dust.vertex,
    dustFragment: dust.fragment
};
