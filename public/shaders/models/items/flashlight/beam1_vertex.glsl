#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec2 v_uv1; // UV-mapping for beam texture
varying vec2 v_uv2; // UV-mapping for dust texture

varying float v_rotation2; // Rotation for dust texture

uniform vec4 u_offsetRepeat2;

uniform float u_rotation2;

void main() {
    #include <skinbase_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <worldpos_vertex>
    #include <clipping_planes_vertex>

    v_uv1 = uv;
    v_uv2 = uv * u_offsetRepeat2.zw + u_offsetRepeat2.xy;

    v_rotation2 = u_rotation2;
}
