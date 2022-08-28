export const FlashlightParsFragment = /* glsl */`
struct Flashlight {
    vec3 position;
    vec3 direction;
    vec3 color;
    float distance;
    float decay;
    float coneCos;
    float penumbraCos;
    sampler2D projectedTexture;
};

void getFlashlightInfo(const in Flashlight flashlight, const in GeometricContext geometry, out IncidentLight light) {
    vec3 lVector = flashlight.position - geometry.position;
    light.direction = normalize(lVector);
    float angleCos = dot(light.direction, flashlight.direction);
    float spotAttenuation = getSpotAttenuation(flashlight.coneCos, flashlight.penumbraCos, angleCos);
    if (spotAttenuation > 0.0) {
        float lightDistance = length(lVector);
        light.color = flashlight.color * spotAttenuation;
        light.color *= getDistanceAttenuation(lightDistance, flashlight.distance, flashlight.decay);
        light.visible = (light.color != vec3(0.0));
    } else {
        light.color = vec3(0.0);
        light.visible = false;
    }
}

uniform Flashlight flashlight;
uniform bool flashlightVisible;

varying vec4 flashlightProjectedTextureCoords;
`;