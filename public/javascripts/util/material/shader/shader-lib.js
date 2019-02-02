export const ShaderLib = {};

const PHONG_PROJECTIVE_TEXTURE_SHADER_NAME = 'phong_projective_texture';

ShaderLib[PHONG_PROJECTIVE_TEXTURE_SHADER_NAME] = {};
ShaderLib[PHONG_PROJECTIVE_TEXTURE_SHADER_NAME].fragment = [
    "#define PHONG",

    "uniform vec3 diffuse;",
    "uniform vec3 emissive;",
    "uniform vec3 specular;",
    "uniform float shininess;",
    "uniform float opacity;",

    "#include <common>",
    "#include <packing>",
    "#include <dithering_pars_fragment>",
    "#include <color_pars_fragment>",
    "#include <uv_pars_fragment>",
    "#include <uv2_pars_fragment>",
    "#include <map_pars_fragment>",
    "#include <alphamap_pars_fragment>",
    "#include <aomap_pars_fragment>",
    "#include <lightmap_pars_fragment>",
    "#include <emissivemap_pars_fragment>",
    "#include <envmap_pars_fragment>",
    "#include <gradientmap_pars_fragment>",
    "#include <fog_pars_fragment>",
    "#include <bsdfs>",
    "#include <lights_pars_begin>",
    "#include <lights_pars_maps>",
    "#include <lights_phong_pars_fragment>",
    "#include <shadowmap_pars_fragment>",
    "#include <bumpmap_pars_fragment>",
    "#include <normalmap_pars_fragment>",
    "#include <specularmap_pars_fragment>",
    "#include <logdepthbuf_pars_fragment>",
    "#include <clipping_planes_pars_fragment>",

    "uniform sampler2D projTex;",

    "varying vec4 vProjTexCoords;",

    "void main() {",
    "#include <clipping_planes_fragment>",

    "vec4 diffuseColor = vec4( diffuse, opacity );",
    "ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
    "vec3 totalEmissiveRadiance = emissive;",

    "#include <logdepthbuf_fragment>",
    "#include <map_fragment>",
    "#include <color_fragment>",
    "#include <alphamap_fragment>",
    "#include <alphatest_fragment>",
    "#include <specularmap_fragment>",
    "#include <normal_fragment_begin>",
    "#include <normal_fragment_maps>",
    "#include <emissivemap_fragment>",

    "#include <lights_phong_fragment>",

    "GeometricContext geometry;",

    "geometry.position = - vViewPosition;",
    "geometry.normal = normal;",
    "geometry.viewDir = normalize( vViewPosition );",

    "IncidentLight directLight;",

    "#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )",
    "PointLight pointLight;",

    "for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {",
    "pointLight = pointLights[ i ];",
    "getPointDirectLightIrradiance( pointLight, geometry, directLight );",

    "#ifdef USE_SHADOWMAP",
    "directLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;",
    "#endif",

    "RE_Direct( directLight, geometry, material, reflectedLight );",
    "}",
    "#endif",

    "#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )",
    "SpotLight spotLight;",

    "for ( int i = 1; i < NUM_SPOT_LIGHTS; i ++ ) {",
    "spotLight = spotLights[ i ];",
    "getSpotDirectLightIrradiance( spotLight, geometry, directLight );",

    "#ifdef USE_SHADOWMAP",
    "directLight.color *= all( bvec2( spotLight.shadow, directLight.visible ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;",
    "#endif",

    "RE_Direct( directLight, geometry, material, reflectedLight );",
    "}",

    "SpotLight flashlight = spotLights[ 0 ];",
    "getSpotDirectLightIrradiance( flashlight, geometry, directLight );",

    "vec3 lVector = flashlight.position - geometry.position;",
    "vec3 lDirection = normalize( lVector );",
    "float angleCos = dot( lDirection, flashlight.direction );",
    "if ( angleCos > flashlight.coneCos ) {",
    "vec4 projColor = texture2DProj(projTex, vProjTexCoords);",
    "directLight.color *= projColor.g;",
    "}",

    "RE_Direct( directLight, geometry, material, reflectedLight );",
    "#endif",

    "#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )",
    "DirectionalLight directionalLight;",
    "for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {",
    "directionalLight = directionalLights[ i ];",
    "getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );",
    "#ifdef USE_SHADOWMAP",
    "directLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;",
    "#endif",
    "RE_Direct( directLight, geometry, material, reflectedLight );",
    "}",
    "#endif",

    "#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )",
    "RectAreaLight rectAreaLight;",
    "for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {",
    "rectAreaLight = rectAreaLights[ i ];",
    "RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );",
    "}",
    "#endif",

    "#if defined( RE_IndirectDiffuse )",
    "vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );",

    "#ifdef USE_LIGHTMAP",
    "vec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;",

    "#ifndef PHYSICALLY_CORRECT_LIGHTS",
    "lightMapIrradiance *= PI;",
    "#endif",

    "irradiance += lightMapIrradiance;",
    "#endif",

    "#if ( NUM_HEMI_LIGHTS > 0 )",
    "for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {",
    "irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );",
    "}",
    "#endif",

    "#if defined( USE_ENVMAP ) && defined( PHYSICAL ) && defined( ENVMAP_TYPE_CUBE_UV )",
    "irradiance += getLightProbeIndirectIrradiance( geometry, 8 );",
    "#endif",

    "RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );",
    "#endif",

    "#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )",
    "vec3 radiance = getLightProbeIndirectRadiance( geometry, Material_BlinnShininessExponent( material ), 8 );",

    "#ifndef STANDARD",
    "vec3 clearCoatRadiance = getLightProbeIndirectRadiance( geometry, Material_ClearCoat_BlinnShininessExponent( material ), 8 );",
    "#else",
    "vec3 clearCoatRadiance = vec3( 0.0 );",
    "#endif",

    "RE_IndirectSpecular( radiance, clearCoatRadiance, geometry, material, reflectedLight );",
    "#endif",

    "#include <aomap_fragment>",

    "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",

    "#include <envmap_fragment>",

    "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

    "#include <tonemapping_fragment>",
    "#include <encodings_fragment>",
    "#include <fog_fragment>",
    "#include <premultiplied_alpha_fragment>",
    "#include <dithering_fragment>",
    "}"
].join("\n");
ShaderLib[PHONG_PROJECTIVE_TEXTURE_SHADER_NAME].vertex = [
    "#define PHONG",

    "varying vec3 vViewPosition;",

    "#ifndef FLAT_SHADED",
    "varying vec3 vNormal;",
    "#endif",

    "#include <common>",
    "#include <uv_pars_vertex>",
    "#include <uv2_pars_vertex>",
    "#include <displacementmap_pars_vertex>",
    "#include <envmap_pars_vertex>",
    "#include <color_pars_vertex>",
    "#include <fog_pars_vertex>",
    "#include <morphtarget_pars_vertex>",
    "#include <skinning_pars_vertex>",
    "#include <shadowmap_pars_vertex>",
    "#include <logdepthbuf_pars_vertex>",
    "#include <clipping_planes_pars_vertex>",

    "uniform mat4 uProjTexMatrix;",

    "varying vec3 vWorldPosition;",
    "varying vec4 vProjTexCoords;",

    "void main() {",
    "#include <uv_vertex>",
    "#include <uv2_vertex>",
    "#include <color_vertex>",

    "#include <beginnormal_vertex>",
    "#include <morphnormal_vertex>",
    "#include <skinbase_vertex>",
    "#include <skinnormal_vertex>",
    "#include <defaultnormal_vertex>",

    "#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED",
    "vNormal = normalize( transformedNormal );",
    "#endif",

    "#include <begin_vertex>",
    "#include <morphtarget_vertex>",
    "#include <skinning_vertex>",
    "#include <displacementmap_vertex>",
    "#include <project_vertex>",
    "#include <logdepthbuf_vertex>",
    "#include <clipping_planes_vertex>",

    "vViewPosition = - mvPosition.xyz;",

    "#include <worldpos_vertex>",
    "#include <envmap_vertex>",
    "#include <shadowmap_vertex>",
    "#include <fog_vertex>",

    "vProjTexCoords = uProjTexMatrix * modelMatrix * vec4(position, 1.0);",
    "}"
].join("\n");
