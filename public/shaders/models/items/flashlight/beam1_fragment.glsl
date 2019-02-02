uniform sampler2D u_texture1; // Beam texture
uniform sampler2D u_texture2; // Dust texture

varying vec2 v_uv1; // UV-mapping for beam texture
varying vec2 v_uv2; // UV-mapping for dust texture

varying float v_rotation2; // Rotation for dust texture

void main() {
    float mid = 2.0;
    vec2 rotatedUv2 = vec2(cos(v_rotation2) * (v_uv2.x - mid) + sin(v_rotation2) * (v_uv2.y - mid) + mid,
            cos(v_rotation2) * (v_uv2.y - mid) - sin(v_rotation2) * (v_uv2.x - mid) + mid);

    vec4 color1 = vec4(1.0);
    vec4 color2 = texture2D(u_texture2, rotatedUv2);
    vec4 color3 = texture2D(u_texture1, v_uv1);

    float f = color3.g * 1.5;
    color1.a *= color3.g * color2.g * f;

    gl_FragColor = mix(color1, color2, color1.a);
}
