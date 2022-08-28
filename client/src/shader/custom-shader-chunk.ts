import * as dust from './dust.glsl.js';
import * as phongFlashlight from './phong-flashlight.glsl.js';

export const CustomShaderChunk: {[shader: string]: any} = {
    dustVertex: dust.vertex,
    dustFragment: dust.fragment,

    phongFlashlightVertex: phongFlashlight.vertex,
    phongFlashlightFragment: phongFlashlight.fragment,
};
