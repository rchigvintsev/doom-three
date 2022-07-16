export const vertex = `
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec2 v_uv1; // UV-mapping for beam texture
varying vec2 v_uv2; // UV-mapping for dust texture

uniform mat3 uv_transform2; // Transformation matrix for dust texture

void main()	{
    #include <skinbase_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <worldpos_vertex>
    #include <clipping_planes_vertex>
    
    v_uv1 = uv;
    v_uv2 = (uv_transform2 * vec3(uv, 1)).xy;
}
`;

export const fragment = `
uniform sampler2D u_map1; // Beam texture
uniform sampler2D u_map2; // Dust texture

varying vec2 v_uv1; // UV-mapping for beam texture
varying vec2 v_uv2; // UV-mapping for dust texture

void main()	{
    vec4 color1 = vec4(1.0);
    vec4 color2 = texture2D(u_map2, v_uv2);
    vec4 color3 = texture2D(u_map1, v_uv1);

    float f = color3.g * 1.5;
    color1.a *= color3.g * color2.g * f;
    
    gl_FragColor = mix(color1, color2, color1.a);
}
`;