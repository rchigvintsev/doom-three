export const FlashlightFragment = /* glsl */`
#if defined(RE_Direct)
    if (flashlightVisible) {
        getFlashlightInfo(flashlight, geometry, directLight);		
        vec3 flashlightDirection = normalize(flashlight.position - geometry.position);
        float flashlightAngleCos = dot(flashlightDirection, flashlight.direction);
        if (flashlightAngleCos > flashlight.coneCos) {
            vec4 projectedColor = texture2DProj(flashlight.projectedTexture, flashlightProjectedTextureCoords);
            directLight.color *= projectedColor.rgb;
            RE_Direct(directLight, geometry, material, reflectedLight);
        }
    }
#endif
`;
