export const FlashlightVertex = /* glsl */`
if (flashlightVisible) {
    flashlightProjectedTextureCoords = flashlightTextureProjectionMatrix * modelMatrix * vec4(position, 1.0);
}
`;
