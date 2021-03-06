export const MATERIALS = {
    'lights/flashlight5': {
        diffuseMap: 'lights/flashlight5'
    },
    'models/items/flashlight/flare': {
        type: 'basic',
        alphaMap: 'models/items/flashlight/flare',
        transparent: true,
        side: 'double',
        depthWrite: false
    },
    /*'models/items/flashlight/beam1': {
        type: 'shader',
        textures: [
            'models/items/flashlight/beam1',
            {
                name: 'models/items/flashlight/dust',
                repeat: [4, 4],
                rotate: 'time * -0.02'
            }
        ],
        transparent: true,
        side: 'double',
        depthWrite: false
    },*/
    'models/items/flashlight/bulb': {
        type: 'basic',
        alphaMap: 'models/items/flashlight/bulb',
        transparent: true,
        side: 'front',
        depthWrite: false
    },
    'models/items/flashlight/flashlight2': {
        diffuseMap: 'models/items/flashlight/flashlight2',
        specularMap: 'models/items/flashlight/flashlight2_s',
        normalMap: 'models/items/flashlight/flashlight2_local',
        side: 'front'
    },
    'models/characters/player/arm2': {
        diffuseMap: 'models/characters/player/arm2',
        specularMap: 'models/characters/player/arm2_s',
        normalMap: 'models/characters/player/arm2_local',
        side: 'front'
    },
    'models/weapons/berserk/fist': {
        diffuseMap: 'models/weapons/berserk/fist',
        specularMap: 'models/weapons/berserk/fist_s',
        normalMap: 'models/weapons/berserk/fist_local',
        side: 'front'
    },
    'textures/base_wall/snpanel3': {
        diffuseMap: 'textures/base_wall/snpanel3_d',
        specularMap: 'textures/base_wall/snpanel3_s',
        normalMap: 'textures/base_wall/snpanel3_local'
    },
    'textures/rock/sharprock': {
        diffuseMap: 'textures/rock/sharprock',
        specularMap: 'textures/rock/sharprock_s',
        normalMap: 'textures/rock/sharprock_local'
    },
    'textures/base_trim/strim': {
        diffuseMap: 'textures/base_trim/strim_d',
        specularMap: 'textures/base_trim/strim_s'
    },
    'textures/outside/a_redskybuilding2_d01': {
        diffuseMap: 'textures/outside/a_redskybuilding2_d01',
        specularMap: 'textures/outside/a_redskybuilding2_s01',
        normalMap: 'textures/outside/a_redskybuilding2_local'
    },
    'textures/enpro/enwall19d': {
        diffuseMap: 'textures/enpro/enwall19d',
        specularMap: 'textures/enpro/enwall19_s',
        normalMap: 'textures/base_wall/stepanel5_local'
    },
    'textures/outside/track': {
        diffuseMap: 'textures/outside/track',
        specularMap: 'textures/outside/track_s',
        normalMap: 'textures/outside/track_local'
    },
    'textures/base_wall/lfwall13f3': {
        diffuseMap: 'textures/base_wall/lfwall13f3',
        normalMap: 'textures/base_wall/lfwall13f_local',
        specularMap: 'textures/base_wall/lfwall13f3_s',
        specular: 0xbbbbbb,
        shininess: 40
    },
    'textures/base_floor/grill_floor5': {
        diffuseMap: 'textures/base_floor/grill_floor5_d',
        specularMap: 'textures/base_floor/grill_floor5_s',
        normalMap: {
            name: 'textures/base_floor/grill_floor3_local+grill_floor5_b',
            addNormals: {
                normalMap: 'textures/base_floor/grill_floor3_local',
                bumpMap: 'textures/base_floor/grill_floor5_b',
                scale: 5
            }
        }
    },
    'textures/caves/cavwarcol1': {
        diffuseMap: 'textures/caves/cavwarcol1_d',
        specularMap: 'textures/caves/cavwarcol1_s',
        normalMap: {
            name: 'textures/caves/cavwarcol1_local+cavwarcol1_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavwarcol1_local',
                bumpMap: 'textures/caves/cavwarcol1_bmp',
                scale: 1
            }
        }
    },
    'textures/mcity/mcitypipe2': {
        diffuseMap: 'textures/mcity/mcitypipe2',
        specularMap: 'textures/mcity/mcitypipe2_s',
        normalMap: {
            name: 'textures/mcity/mcitypipe1_local+mcitypipe1_bmp',
            addNormals: {
                normalMap: 'textures/mcity/mcitypipe1_local',
                bumpMap: 'textures/mcity/mcitypipe1_bmp',
                scale: 4
            }
        }
    },
    'textures/base_wall/lfwall27d': {
        diffuseMap: 'textures/base_wall/lfwall27d',
        normalMap: 'textures/base_wall/lfwall27d_local',
        specularMap: 'textures/base_wall/lfwall27d_s',
        specular: 0xaaaaaa,
        shininess: 40
    },
    'textures/enpro/enwall7': {
        diffuseMap: 'textures/enpro/enwall7',
        specularMap: 'textures/enpro/enwall7_s',
        normalMap: 'textures/enpro/enwall7_local'
    },
    'textures/outside/outpipe1': {
        diffuseMap: 'textures/outside/outpipe1',
        specularMap: 'textures/outside/outpipe1_s',
        normalMap: 'textures/outside/outpipe1_local'
    },
    'textures/enpro/enwall18': {
        diffuseMap: 'textures/enpro/enwall18',
        specularMap: 'textures/enpro/enwall18_s',
        normalMap: 'textures/enpro/enwall18_local'
    },
    'textures/base_wall/lfwall27b': {
        diffuseMap: 'textures/base_wall/lfwall27b',
        normalMap: 'textures/base_wall/lfwall27b_local',
        specularMap: 'textures/base_wall/lfwall27b_s',
        specular: 0xffffff,
        shininess: 40
    },
    'textures/base_trim/rustrim': {
        diffuseMap: 'textures/base_trim/rustrim_d',
        specularMap: 'textures/base_trim/rustrim_s',
        normalMap: {
            name: 'textures/base_trim/rustrim_local+rustrim_b',
            addNormals: {
                normalMap: 'textures/base_trim/rustrim_local',
                bumpMap: 'textures/base_trim/rustrim_b',
                scale: 4
            }
        }
    },
    'textures/outside/outerpipe': {
        diffuseMap: 'textures/outside/outerpipe_d',
        normalMap: {
            name: 'textures/outside/outerpipe_local+outerpipe_bmp',
            addNormals: {
                normalMap: 'textures/outside/outerpipe_local',
                bumpMap: 'textures/outside/outerpipe_bmp',
                scale: 4
            }
        }
    },
    'textures/base_floor/a_sofloor1_d01a': {
        diffuseMap: 'textures/base_floor/a_sofloor1_d01a',
        specularMap: 'textures/base_floor/a_sofloor1_s01a',
        normalMap: 'textures/base_floor/a_sofloor1_local'
    },
    'textures/outside/outfactory8': {
        diffuseMap: 'textures/outside/outfactory8_d',
        normalMap: {
            name: 'textures/outside/outfactory8_local+outfactory8_bmp',
            addNormals: {
                normalMap: 'textures/outside/outfactory8_local',
                bumpMap: 'textures/outside/outfactory8_bmp',
                scale: 4
            }
        }
    },
    'textures/outside/outfactory7': {
        diffuseMap: 'textures/outside/outfactory7_d',
        normalMap: {
            name: 'textures/outside/outfactory7_local+outfactory7_bmp',
            addNormals: {
                normalMap: 'textures/outside/outfactory7_local',
                bumpMap: 'textures/outside/outfactory7_bmp',
                scale: 4
            }
        }
    },
    'textures/decals/a_pipecap2a_d': {
        diffuseMap: 'textures/decals/a_pipecap2a_d',
        specularMap: 'textures/decals/a_pipecap2a_s',
        normalMap: 'textures/decals/a_pipecap2a_local',
        transparent: true,
        depthWrite: false
    },
    'textures/base_wall/a_rib_panel_04_fin': {
        diffuseMap: 'textures/base_wall/a_rib_panel_d04_fin',
        specularMap: 'textures/base_wall/a_rib_panel_s04_fin',
        normalMap: {
            name: 'textures/base_wall/a_rib_panel_local_fin+a_rib_panel_b04_fin',
            addNormals: {
                normalMap: 'textures/base_wall/a_rib_panel_local_fin',
                bumpMap: 'textures/base_wall/a_rib_panel_b04_fin',
                scale: 2
            }
        }
    },
    'textures/base_trim/dangertrim01': {
        diffuseMap: 'textures/base_trim/dangertrim_d',
        specularMap: 'textures/base_trim/dangertrim_s',
        normalMap: 'textures/base_trim/dangertrim_b_3'
    },
    'textures/outside/redskyroadwall2': {
        diffuseMap: 'textures/outside/redskyroadwall2_d',
        specularMap: 'textures/outside/redskyroadwall2_s',
        normalMap: 'textures/outside/textures_outside_redskyroadwall2_bmp_4'
    },
    'textures/outside/outfactory10': {
        diffuseMap: 'textures/outside/outfactory10_d',
        specularMap: 'textures/outside/outfactory10_s',
        normalMap: 'textures/outside/outfactory10_local'
    },
    'textures/outside/outfactory15a': {
        diffuseMap: 'textures/outside/outfactory15a_d',
        specularMap: 'textures/outside/outfactory15_s',
        normalMap: 'textures/outside/textures_outside_outfactory15a_d_2'
    },
    'textures/rock/skysandnew': {
        diffuseMap: 'textures/rock/skysand2',
        normalMap: {
            name: 'textures/rock/skysand1_local+skysand2_bmp',
            addNormals: {
                normalMap: 'textures/rock/skysand1_local',
                bumpMap: 'textures/rock/skysand2_bmp',
                scale: 4
            }
        }
    },
    'textures/enpro/enwall16c': {
        diffuseMap: 'textures/enpro/enwall16c',
        specularMap: 'textures/enpro/enwall16_s',
        normalMap: 'textures/enpro/textures_enpro_enwall16_bmp_4'
    },
    'textures/outside/outfactory4': {
        diffuseMap: 'textures/outside/outfactory4_d',
        normalMap: 'textures/outside/outfactory4_local'
    },
    'textures/outside/outfactory1': {
        diffuseMap: 'textures/outside/outfactory1_d',
        normalMap: {
            name: 'textures/outside/outfactory1_local+outfactory1_bmp',
            addNormals: {
                normalMap: 'textures/outside/outfactory1_local',
                bumpMap: 'textures/outside/outfactory1_bmp',
                scale: 4
            }
        }
    },
    'textures/base_trim/gotrustcol1': {
        diffuseMap: 'textures/base_trim/gotrustcol1_d',
        specularMap: 'textures/base_trim/gotsilvercol1_s',
        normalMap: 'textures/base_trim/gotsilvercol1_local'
    },
    'textures/base_floor/a_ghoceiling1_04': {
        diffuseMap: 'textures/base_floor/a_ghoceiling1_d04',
        specularMap: 'textures/base_floor/a_ghoceiling1_s04',
        normalMap: {
            name: 'textures/base_floor/a_ghoceiling1_local+a_ghoceiling1_b04',
            addNormals: {
                normalMap: 'textures/base_floor/a_ghoceiling1_local',
                bumpMap: 'textures/base_floor/a_ghoceiling1_b04',
                scale: 2
            }
        }
    },
    'textures/caves/metalswatch1': {
        diffuseMap: 'textures/caves/metalswatch1_d',
        specularMap: 'textures/caves/metalswatch1_s',
        normalMap: {
            name: 'textures/caves/metalswatch1_local+metalswatch1_bmp',
            addNormals: {
                normalMap: 'textures/caves/metalswatch1_local',
                bumpMap: 'textures/caves/metalswatch1_bmp',
                scale: 3
            }
        }
    },
    'textures/base_trim/a_bluetex4j_01': {
        diffuseMap: 'textures/base_trim/a_bluetex4j_d01',
        specularMap: 'textures/base_trim/a_bluetex4j_s01',
        normalMap: {
            name: 'textures/base_trim/a_bluetex4j_local+a_bluetex4j_b01',
            addNormals: {
                normalMap: 'textures/base_trim/a_bluetex4j_local',
                bumpMap: 'textures/base_trim/a_bluetex4j_b01',
                scale: 3
            }
        }
    },
    'textures/enpro/enwall8a3': {
        diffuseMap: 'textures/enpro/enwall8a3',
        specularMap: 'textures/enpro/enwall8a3_s',
        normalMap: 'textures/enpro/enwall8a_local'
    },
    'textures/base_trim/a_reactorpipe_02blackb_fin': {
        diffuseMap: 'textures/base_trim/a_reactorpipe_d02blackb_fin',
        specularMap: 'textures/base_trim/a_reactorpipe_s02blackb_fin',
        normalMap: 'textures/base_trim/a_reactorpipe_local_fin'
    },
    'textures/enpro/enwall8a4': {
        diffuseMap: 'textures/enpro/enwall8a4',
        specularMap: 'textures/enpro/enwall8a4_s',
        normalMap: 'textures/enpro/enwall8a_local'
    },
    'textures/base_floor/textest': {
        diffuseMap: 'textures/base_floor/textestdif',
        normalMap: 'textures/base_floor/textestbmp'
    },
    'textures/base_wall/skpanel11_dirt': {
        diffuseMap: 'textures/base_wall/skpanel11_dirt',
        specularMap: 'textures/base_wall/skpanel11_dirt_s',
        normalMap: 'textures/base_wall/skpanel11_local'
    },
    'textures/base_floor/a_sflgrate2_01_fin': {
        diffuseMap: 'textures/base_floor/a_sflgrate2_d01_fin',
        specularMap: 'textures/base_floor/a_sflgrate2_s01_fin',
        normalMap: {
            name: 'textures/base_floor/a_sflgrate2_local01_fin+a_sflgrate2_b01_fin',
            addNormals: {
                normalMap: 'textures/base_floor/a_sflgrate2_local01_fin',
                bumpMap: 'textures/base_floor/a_sflgrate2_b01_fin',
                scale: 3
            }
        }
    },
    'textures/enpro/enwall13a': {
        diffuseMap: 'textures/enpro/enwall13a',
        specularMap: 'textures/enpro/enwall13a_s',
        normalMap: 'textures/enpro/enwall13_local'
    },
    'textures/base_trim/bluetex4r_danger_d': {
        diffuseMap: 'textures/base_trim/bluetex4r_danger_d',
        specularMap: 'textures/base_trim/bluetex4rspec'
    },
    'textures/base_light/sterlightdecalred': {
        diffuseMap: 'textures/base_light/sterlightdecal_d',
        specularMap: 'textures/base_light/sterlightdecal_s',
        normalMap: 'textures/base_light/sterlightdecal_local',
        transparent: true,
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_light/sterlightdecalred_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_floor/grill_floor2': {
        diffuseMap: 'textures/base_floor/grill_floor_d',
        specularMap: 'textures/base_floor/grill_floor_s',
        normalMap: 'textures/base_floor/grill_floor_local',
        transparent: true
    },
    'textures/base_wall/a_sopanel2c_d01f': {
        diffuseMap: 'textures/base_wall/a_sopanel2c_d01f',
        specularMap: 'textures/base_wall/a_sopanel2c_d01f',
        normalMap: 'textures/base_wall/a_sopanel2c_local'
    },
    'textures/base_wall/snpanel2c': {
        diffuseMap: 'textures/base_wall/snpanel2c',
        specularMap: 'textures/base_wall/snpanel2a_s',
        normalMap: 'textures/base_wall/snpanel2_local'
    },
    'textures/enpro/enwall20f': {
        diffuseMap: 'textures/enpro/enwall20f',
        specularMap: 'textures/enpro/enwall20f_s',
        normalMap: 'textures/enpro/enwall20_local'
    },
    'textures/base_wall/a_superpipes_02': {
        diffuseMap: 'textures/base_wall/a_superpipes_d02',
        specularMap: 'textures/base_wall/a_superpipes_s02',
        normalMap: 'textures/base_wall/a_superpipes_local'
    },
    'textures/base_wall/lfwall15a': {
        diffuseMap: 'textures/base_wall/lfwall15a',
        specularMap: 'textures/base_wall/lfwall15_s',
        normalMap: 'textures/base_wall/lfwall15_local'
    },
    'textures/base_light/trimlight': {
        diffuseMap: 'textures/base_light/trimlight_d',
        specularMap: 'textures/base_light/trimlight_s',
        normalMap: 'textures/base_light/trimlight_local'
    },
    'textures/object/metalshelve_front': {
        diffuseMap: 'models/seneca/textures/metalshelve_front_d',
        transparent: true
    },
    'textures/caves/cavfgirder1': {
        diffuseMap: 'textures/caves/cavfgirder1_d',
        specularMap: 'textures/caves/cavfgirder1_s',
        normalMap: {
            name: 'textures/caves/cavfgirder1_local+cavfgirder1_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavfgirder1_local',
                bumpMap: 'textures/caves/cavfgirder1_bmp',
                scale: 1
            }
        }
    },
    'textures/decals/hangingwires2': {
        diffuseMap: 'textures/decals/hangingwires2_d',
        specularMap: 'textures/decals/hangingwires2_s',
        transparent: true,
        depthWrite: false,
        normalMap: {
            name: 'textures/decals/hangingwires_local+hangingwires2_b',
            addNormals: {
                normalMap: 'textures/decals/hangingwires_local',
                bumpMap: 'textures/decals/hangingwires2_b',
                scale: 2
            }
        }
    },
    'textures/base_trim/a_sgirder2cav': {
        diffuseMap: 'textures/base_trim/a_sgirder2cav_d',
        specularMap: 'textures/base_trim/a_sgirder2cav_s',
        transparent: true,
        normalMap: {
            name: 'textures/base_trim/a_sgirder2_local+a_sgirder2cav_bmp',
            addNormals: {
                normalMap: 'textures/base_trim/a_sgirder2_local',
                bumpMap: 'textures/base_trim/a_sgirder2cav_bmp',
                scale: 4
            }
        }
    },
    'textures/object/a_metalshelve_side': {
        diffuseMap: 'textures/object/a_metalshelve_side_d',
        specularMap: 'textures/object/a_metalshelve_side_s',
        normalMap: 'models/seneca/textures/metalshelve_side'
    },
    'textures/caves/cavwafpanel1': {
        diffuseMap: 'textures/caves/cavwafpanel1_d',
        specularMap: 'textures/caves/cavwafpanel1_s',
        normalMap: {
            name: 'textures/caves/cavwafpanel1_local+cavwafpanel1_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavwafpanel1_local',
                bumpMap: 'textures/caves/cavwafpanel1_bmp',
                scale: 1
            }
        }
    },
    'textures/base_wall/a_outfactory9_d01': {
        diffuseMap: 'textures/base_wall/a_outfactory9_d01',
        specularMap: 'textures/base_wall/a_outfactory9_s01',
        normalMap: 'textures/base_wall/a_outfactory9_local'
    },
    'textures/object/a_conpanel4blk': {
        diffuseMap: 'textures/object/a_conpanel4blk_d',
        specularMap: 'textures/object/a_conpanel4_s',
        normalMap: 'textures/object/a_conpanel4_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/object/a_conpanel4_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_floor/floorvent02': {
        diffuseMap: 'textures/base_floor/floorvent02_d',
        specularMap: 'textures/morgue/floorvent01_s',
        normalMap: {
            name: 'textures/morgue/floorvent01_local+floorvent01_h',
            addNormals: {
                normalMap: 'textures/morgue/floorvent01_local',
                bumpMap: 'textures/morgue/floorvent01_h',
                scale: 3
            }
        }
    },
    'textures/enpro/enwall9': {
        diffuseMap: 'textures/enpro/enwall9',
        specularMap: 'textures/enpro/enwall9_s',
        normalMap: 'textures/enpro/enwall9_local'
    },
    'textures/object/a_metalshelve_post': {
        diffuseMap: 'textures/object/a_metalshelve_post_d',
        transparent: true
    },
    'textures/hell/wires2_d': {
        diffuseMap: 'textures/hell/wires2_d',
        specularMap: 'textures/hell/wires2_s',
        normalMap: 'textures/hell/wires2_local'
    },
    'textures/base_floor/a_sflgrate2diag': {
        diffuseMap: 'textures/base_floor/a_sflgrate2diag_d',
        specularMap: 'textures/base_floor/a_sflgrate2diag_s',
        normalMap: {
            name: 'textures/base_floor/a_sflgrate2diag_local+a_sflgrate2diag_b',
            addNormals: {
                normalMap: 'textures/base_floor/a_sflgrate2diag_local',
                bumpMap: 'textures/base_floor/a_sflgrate2diag_b',
                scale: 3
            }
        }
    },
    'textures/outside/outfactory3': {
        diffuseMap: 'textures/outside/outfactory3_d',
        normalMap: 'textures/outside/outfactory3_local',
        transparent: true,
        alphaTest: 0.35
    },
    'textures/base_trim/ghoventtrim2': {
        diffuseMap: 'textures/base_trim/ghoventtrim2_d',
        specularMap: 'textures/base_trim/ghoventtrim2_s',
        normalMap: 'textures/base_trim/ghoventtrim1_local'
    },
    'textures/decals/cam_base': {
        diffuseMap: 'textures/decals/cam_base_d',
        specularMap: 'textures/decals/cam_base_s',
        normalMap: 'textures/decals/cam_base_local',
        transparent: true,
        depthWrite: false
    },
    'textures/object/a_conpanel3blk_01': {
        diffuseMap: 'textures/object/a_conpanel3blk_d01',
        specularMap: 'textures/object/a_conpanel3_s01',
        normalMap: 'textures/object/a_conpanel3_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/object/a_conpanel3_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/caves/cavwafpanel1win': {
        diffuseMap: 'textures/caves/cavwafpanel1win_d',
        specularMap: 'textures/caves/cavwafpanel1win_s',
        normalMap: {
            name: 'textures/caves/cavwafpanel1win_local+cavwafpanel1win_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavwafpanel1win_local',
                bumpMap: 'textures/caves/cavwafpanel1win_bmp',
                scale: 1
            }
        }
    },
    'textures/object/tecpipe2sil': {
        diffuseMap: 'textures/object/tecpipe2sil_d',
        specularMap: 'textures/object/tecpipe2_s',
        normalMap: 'textures/object/tecpipe2sil_local'
    },
    'textures/object/a_conpanel2blk_01': {
        diffuseMap: 'textures/object/a_conpanel2blk_d01',
        specularMap: 'textures/object/a_conpanel2_s01',
        normalMap: 'textures/object/a_conpanel2_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/object/a_conpanel2_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/enpro/enwall14': {
        diffuseMap: 'textures/enpro/enwall14',
        specularMap: 'textures/enpro/enwall14_s',
        normalMap: 'textures/enpro/enwall14_local'
    },
    'textures/lab/whiteroof_d': {
        diffuseMap: 'textures/lab/whiteroof_d'
    },
    'textures/caves/cavpanel1': {
        diffuseMap: 'textures/caves/cavpanel1_d',
        specularMap: 'textures/caves/cavpanel1_s',
        normalMap: {
            name: 'textures/caves/cavpanel1_local+cavpanel1_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavpanel1_local',
                bumpMap: 'textures/caves/cavpanel1_bmp',
                scale: 1
            }
        }
    },
    'textures/enpro/enwall11': {
        diffuseMap: 'textures/enpro/enwall11',
        specularMap: 'textures/enpro/enwall11_s',
        normalMap: 'textures/enpro/enwall11_local'
    },
    'textures/base_wall/skpanel20d': {
        diffuseMap: 'textures/base_wall/skpanel20d',
        specularMap: 'textures/base_wall/skpanel20c_s',
        normalMap: 'textures/base_wall/skpanel20_local',
        specular: 0x808080
    },
    'textures/base_wall/lfwall25': {
        diffuseMap: 'textures/base_wall/lfwall25',
        specularMap: 'textures/base_wall/lfwall25_s',
        normalMap: 'textures/base_wall/lfwall25_local'
    },
    'textures/base_light/tltrim': {
        diffuseMap: 'textures/base_light/tltrim_d',
        specularMap: 'textures/base_light/trimlightrim_s',
        normalMap: {
            name: 'textures/base_light/trimlightrim_local+tltrim_b',
            addNormals: {
                normalMap: 'textures/base_light/trimlightrim_local',
                bumpMap: 'textures/base_light/tltrim_b',
                scale: 3
            }
        }
    },
    'textures/object/a_tecpipe1red': {
        diffuseMap: 'textures/object/a_tecpipe1red_d',
        specularMap: 'textures/object/a_tecpipe1red_s',
        normalMap: 'textures/object/a_tecpipe1blkdirty_local'
    },
    'textures/caves/cavgrate1dust': {
        diffuseMap: 'textures/caves/cavgrate1dust_d',
        specularMap: 'textures/caves/cavgrate1dust_s',
        normalMap: {
            name: 'textures/caves/cavgrate1_local+cavgrate1_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavgrate1_local',
                bumpMap: 'textures/caves/cavgrate1_bmp',
                scale: 1
            }
        }
    },
    'textures/decals/lightgrate': {
        diffuseMap: 'textures/decals/lightgrate_d',
        specularMap: 'textures/decals/lightgrate_s',
        normalMap: 'textures/decals/lightgrate_local',
        transparent: true,
        depthWrite: false
    },
    'textures/base_floor/a_diafloor_1b_fin': {
        diffuseMap: 'textures/base_floor/a_diafloor_d1b_fin',
        specularMap: 'textures/base_floor/a_diafloor_s1_fin',
        normalMap: {
            name: 'textures/base_floor/a_diafloor_local_fin+a_diafloor_b1_fin',
            addNormals: {
                normalMap: 'textures/base_floor/a_diafloor_local_fin',
                bumpMap: 'textures/base_floor/a_diafloor_b1_fin',
                scale: 4
            }
        },
        specular: 0x808080
    },
    'textures/base_wall/lfwall19': {
        diffuseMap: 'textures/base_wall/lfwall19',
        specularMap: 'textures/base_wall/lfwall19_s',
        normalMap: 'textures/base_wall/lfwall19_local'
    },
    'textures/base_trim/a_bluetex3k2_01': {
        diffuseMap: 'textures/base_trim/a_bluetex3k2_d01',
        specularMap: 'textures/base_trim/a_bluetex3k2_s01',
        normalMap: {
            name: 'textures/base_trim/a_bluetex3k2_local+a_bluetex3k2_b01',
            addNormals: {
                normalMap: 'textures/base_trim/a_bluetex3k2_local',
                bumpMap: 'textures/base_trim/a_bluetex3k2_b01',
                scale: 3
            }
        }
    },
    'textures/base_floor/a_coldstairs_02_fin': {
        diffuseMap: 'textures/base_floor/a_coldstairs_d02_fin',
        specularMap: 'textures/base_floor/a_coldstairs_s02_fin',
        normalMap: {
            name: 'textures/base_floor/a_coldstairs_local01+a_coldstairs_b02_fin',
            addNormals: {
                normalMap: 'textures/base_floor/a_coldstairs_local01',
                bumpMap: 'textures/base_floor/a_coldstairs_b02_fin',
                scale: 3
            }
        }
    },
    'textures/object/a_conpanel6blk': {
        diffuseMap: 'textures/object/a_conpanel6blk_d',
        specularMap: 'textures/object/a_conpanel6_s',
        normalMap: 'textures/object/a_conpanel6_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/object/a_conpanel6_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_trim/steslashtrim2': {
        diffuseMap: 'textures/base_trim/steslashtrim2_d',
        specularMap: 'textures/base_trim/steslashtrim2_s',
        normalMap: 'textures/base_trim/steslashtrim_local'
    },
    'textures/base_light/whiteblock': {
        diffuseMap: 'textures/base_light/whiteblock'
    },
    'textures/object/a_tecpipe1yel': {
        diffuseMap: 'textures/object/a_tecpipe1yel_d',
        specularMap: 'textures/object/a_tecpipe1red_s',
        normalMap: 'textures/object/a_tecpipe1blkdirty_local'
    },
    'textures/decals/danger_author_person': {
        diffuseMap: 'textures/decals/danger_author_person_d',
        specularMap: 'textures/decals/danger_author_person_s',
        normalMap: 'textures/decals/danger_electric_shock_local',
        transparent: true,
        depthWrite: false
    },
    'textures/object/a_conmonitorxl1blk': {
        diffuseMap: 'textures/object/a_conmonitorxl1blk_d',
        specularMap: 'textures/object/a_conmonitorxl1_s',
        normalMap: 'textures/object/a_conmonitorxl1_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/object/a_conmonitorxl1_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_floor/a_skpanel5_03': {
        diffuseMap: 'textures/base_floor/a_skpanel5_d03',
        specularMap: 'textures/base_floor/a_skpanel5_s03',
        normalMap: {
            name: 'textures/base_floor/a_skpanel5_local+a_skpanel5_b03',
            addNormals: {
                normalMap: 'textures/base_floor/a_skpanel5_local',
                bumpMap: 'textures/base_floor/a_skpanel5_b03',
                scale: 2
            }
        }
    },
    'textures/base_light/striplight5a_ed': {
        diffuseMap: 'textures/base_light/striplight5a_d',
        specularMap: 'textures/base_light/striplight5a_s',
        normalMap: {
            name: 'textures/base_light/striplight2_local+striplight5a_b',
            addNormals: {
                normalMap: 'textures/base_light/striplight2_local',
                bumpMap: 'textures/base_light/striplight5a_b',
                scale: 3
            }
        },
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_light/striplight5aadd',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_floor/sflgratetrans2': {
        diffuseMap: 'textures/base_floor/sflgratetrans2_d',
        specularMap: 'textures/base_floor/sflgratetrans2_s',
        transparent: true,
        depthWrite: false,
        side: 'double',
        normalMap: {
            name: 'textures/base_floor/sflgratetrans1_local+sflgratetrans2_b',
            addNormals: {
                normalMap: 'textures/base_floor/sflgratetrans1_local',
                bumpMap: 'textures/base_floor/sflgratetrans2_b',
                scale: 3
            }
        }
    },
    'textures/base_floor/a_insettrim_d01a': {
        diffuseMap: 'textures/base_floor/a_insettrim_d01a',
        specularMap: 'textures/base_floor/a_insettrim_s01a',
        normalMap: 'textures/base_floor/a_insettrim_local'
    },
    'textures/base_trim/stetrim2': {
        diffuseMap: 'textures/base_trim/stetrim2_d',
        specularMap: 'textures/base_trim/stetrim2_s',
        normalMap: {
            name: 'textures/base_trim/stetrim2_local+stetrim2_b',
            addNormals: {
                normalMap: 'textures/base_trim/stetrim2_local',
                bumpMap: 'textures/base_trim/stetrim2_b',
                scale: 2
            }
        }
    },
    'textures/object/metalshelve_floor': {
        diffuseMap: 'models/seneca/textures/metalshelve_floor_d',
        specularMap: 'models/seneca/textures/metalshelve_floor_d',
        normalMap: 'models/seneca/textures/metalshelve_floor'
    },
    'textures/base_wall/skpanelt2': {
        diffuseMap: 'textures/base_wall/skpanelt2',
        specularMap: 'textures/base_wall/skpanelt2_s',
        normalMap: {
            name: 'textures/base_wall/skpanelt2_local+skpanelt2_b',
            addNormals: {
                normalMap: 'textures/base_wall/skpanelt2_local',
                bumpMap: 'textures/base_wall/skpanelt2_b',
                scale: 3
            }
        }
    },
    'textures/object/a_sopbox2_d01': {
        diffuseMap: 'textures/object/a_sopbox2_d01',
        specularMap: 'textures/object/a_sopbox2_s01',
        normalMap: {
            name: 'textures/object/a_sopbox2_local+textures/object/a_sopbox2_b01',
            addNormals: {
                normalMap: 'textures/object/a_sopbox2_local',
                bumpMap: 'textures/object/a_sopbox2_b01',
                scale: 2
            }
        }
    },
    'textures/base_wall/gotendo1': {
        diffuseMap: 'textures/base_wall/gotendo1_d',
        specularMap: 'textures/base_wall/gotendo1_s',
        normalMap: {
            name: 'textures/base_wall/gotendo1_local+textures/base_wall/gotendo1_bmp',
            addNormals: {
                normalMap: 'textures/base_wall/gotendo1_local',
                bumpMap: 'textures/base_wall/gotendo1_bmp',
                scale: 4
            }
        }
    },
    'textures/enpro/enwall18d': {
        diffuseMap: 'textures/enpro/enwall18d',
        specularMap: 'textures/enpro/enwall18_s',
        normalMap: 'textures/enpro/enwall18_local'
    },
    'textures/base_trim/sgirder1a': {
        diffuseMap: 'models/seneca/textures/sgirder1a_d',
        normalMap: 'models/seneca/textures/models_seneca_textures_sgirder1a_bmp_2',
        transparent: true
    },
    'textures/object/a_conpanel7blk': {
        diffuseMap: 'textures/object/a_conpanel7blk_d',
        specularMap: 'textures/object/a_conpanel7_s',
        normalMap: 'textures/object/a_conpanel7_local'
    },
    'textures/base_trim/a_sfltrim7_d01': {
        diffuseMap: 'textures/base_trim/a_sfltrim7_d01',
        specularMap: 'textures/base_trim/a_sfltrim7_s01',
        normalMap: {
            name: 'textures/base_trim/a_sfltrim7_local+a_sfltrim7_b01',
            addNormals: {
                normalMap: 'textures/base_trim/a_sfltrim7_local',
                bumpMap: 'textures/base_trim/a_sfltrim7_b01',
                scale: 2
            }
        }
    },
    'textures/base_trim/sfltrim3': {
        diffuseMap: 'textures/base_trim/sfltrim3_d',
        specularMap: 'textures/base_trim/sfltrim3_s',
        normalMap: {
            name: 'textures/base_trim/sfltrim3_local+sfltrim3_bmp',
            addNormals: {
                normalMap: 'textures/base_trim/sfltrim3_local',
                bumpMap: 'textures/base_trim/sfltrim3_bmp',
                scale: 5
            }
        }
    },
    'textures/base_trim/sfltrim4': {
        diffuseMap: 'textures/base_trim/sfltrim3_d',
        specularMap: 'textures/base_trim/sfltrim3_s',
        normalMap: {
            name: 'textures/base_trim/sfltrim4_local+sfltrim3_bmp',
            addNormals: {
                normalMap: 'textures/base_trim/sfltrim4_local',
                bumpMap: 'textures/base_trim/sfltrim3_bmp',
                scale: 5
            }
        }
    },
    'textures/base_light/stehalllight': {
        diffuseMap: 'textures/base_light/stehalllight_d',
        specularMap: 'textures/base_light/stehalllight_s',
        normalMap: 'textures/base_light/stehalllight_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_light/stehalllight_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/glass/outdoor_glass1': {
        color: 0xa3a3a3,
        diffuseMap: 'textures/glass/glass1',
        alpha_map: 'textures/glass/outdoor_glass1fx',
        transparent: true,
        opacity: 0.5,
        side: 'double'
    },
    'textures/enpro/enwall10': {
        diffuseMap: 'textures/enpro/enwall10',
        specularMap: 'textures/enpro/enwall10_s',
        normalMap: 'textures/enpro/enwall10_local'
    },
    'models/mapobjects/guiobjects/recconpanel1/recconpanel1': {
        diffuseMap: 'models/mapobjects/guiobjects/recconpanel1/recconpanel1_d',
        specularMap: 'models/mapobjects/guiobjects/recconpanel1/recconpanel1_s',
        normalMap: {
            name: 'models/mapobjects/guiobjects/recconpanel1/recconpanel1_local+recconpanel1_bmp',
            addNormals: {
                normalMap: 'models/mapobjects/guiobjects/recconpanel1/recconpanel1_local',
                bumpMap: 'models/mapobjects/guiobjects/recconpanel1/recconpanel1_bmp',
                scale: 3
            }
        }
    },
    'textures/decals/splat2': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat2',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        depthWrite: false
    },
    'textures/decals/sdirt11': {
        type: 'basic',
        diffuseMap: 'textures/decals/sdirt11',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        depthWrite: false
    },
    'textures/sfx/black': {
        diffuseMap: 'textures/sfx/black_2'
    },
    'textures/decals/stain02': {
        type: 'basic',
        diffuseMap: 'textures/decals/stain02',
        transparent: true,
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        depthWrite: false
    },
    'textures/decals/splat16': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat16',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        depthWrite: false
    },
    'textures/decals/smear01': {
        type: 'basic',
        diffuseMap: 'textures/decals/smear01_d',
        transparent: true,
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        depthWrite: false
    },
    'textures/decals/splat11': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat11',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        depthWrite: false
    },
    'textures/decals/splat15': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat15',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        depthWrite: false
    },
    'textures/decals/sdirt12': {
        type: 'basic',
        diffuseMap: 'textures/decals/sdirt12',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        depthWrite: false
    },
    'textures/hell/wrinklewall_tile': {
        diffuseMap: {
            name: 'textures/hell/wrinklewall_tile',
            translate: ['-0.01 * sin(time)', '0.02 * sin(time)']
        },
        specularMap: 'textures/hell/wrinklewall_tile_s',
        normalMap: 'textures/hell/wrinklewall_tile_local',
        transparent: true,
        opacity: 0.3,
        specular: 0xffffff,
        shininess: 68,
        /*additionalMap: {
            name: 'textures/hell/wrinklewall_tile_ss',
            translate: ['-0.005 * sin(time)', '0.01 * sin(time)'],
            transparent: false
        }*/
    },
    'textures/common/shadow': {
        type: 'basic',
        color: 0x000000
    },
    'textures/decals/splat18': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat18',
        transparent: true,
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        depthWrite: false
    },
    'textures/hell/bacteria_6': {
        diffuseMap: {
            name: 'textures/hell/bacteria_6',
            translate: ['time * -0.01', 'time * -0.05']
        },
        normalMap: 'textures/hell/bacteria_6_local',
        specularMap: 'textures/hell/bacteria_6_s',
        specular: 0xffffff,
        shininess: 68,
        cast_shadow: false
    },
    'textures/decals/dirty_frame': {
        type: 'basic',
        diffuseMap: 'textures/decals/dirty_frame',
        transparent: true,
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        cast_shadow: false,
        depthWrite: false
    },
    'textures/caves/cavwarhaz1': {
        diffuseMap: 'textures/caves/cavwarhaz1_d',
        specularMap: 'textures/caves/cavwarhaz1_s',
        normalMap: {
            name: 'textures/caves/cavwarhaz1_local+cavwarhaz1_bmp',
            addNormals: {
                normalMap: 'textures/caves/cavwarhaz1_local',
                bumpMap: 'textures/caves/cavwarhaz1_bmp',
                scale: 1
            }
        }
    },
    'textures/base_door/airdoor_enpro': {
        diffuseMap: 'textures/base_door/airdoor_enpro',
        specularMap: 'textures/base_door/airdoor_enpro_s',
        normalMap: 'textures/base_door/airdoor_enpro_local'
    },
    'textures/decals/pressurepanel': {
        diffuseMap: 'textures/decals/pressurepanel_d',
        specularMap: 'textures/decals/pressurepanel_s',
        transparent: true,
        cast_shadow: false,
        depthWrite: false,
        normalMap: {
            name: 'textures/decals/pressurepanel_local+pressurepanel_h',
            addNormals: {
                normalMap: 'textures/decals/pressurepanel_local',
                bumpMap: 'textures/decals/pressurepanel_h',
                scale: 6
            }
        }
    },
    'textures/decals/hangingwires2sided': {
        diffuseMap: 'textures/decals/hangingwires_d',
        specularMap: 'textures/decals/hangingwires_s',
        normalMap: 'textures/decals/hangingwires_local',
        transparent: true,
        cast_shadow: false,
        side: 'double',
        depthWrite: false
    },
    'textures/base_wall/skpanel7': {
        diffuseMap: 'textures/base_wall/skpanel7_d',
        specularMap: 'textures/base_wall/skpanel7_s',
        normalMap: 'textures/base_wall/skpanel7_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_wall/skpanel7_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_trim/hose01': {
        diffuseMap: 'textures/base_trim/hose01_d',
        specularMap: 'textures/base_trim/hose01_s',
        normalMap: {
            name: 'textures/base_trim/hose01_local+hose01_b',
            addNormals: {
                normalMap: 'textures/base_trim/hose01_local',
                bumpMap: 'textures/base_trim/hose01_b',
                scale: 4
            }
        }
    },
    'textures/object/elec_box1': {
        diffuseMap: 'textures/base_trim/elec_box1_d',
        normalMap: 'textures/base_trim/elec_box1_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_trim/elec_box1_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/object/elec_box1s': {
        diffuseMap: 'textures/base_trim/elec_box1s_d',
        normalMap: 'textures/base_trim/elec_box1s_local'
    },
    'textures/decals/splat3': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat3',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        cast_shadow: false,
        depthWrite: false
    },
    'textures/base_trim/a_reactorpipe_03c_fin': {
        diffuseMap: 'textures/base_trim/a_reactorpipe_d03c_fin',
        specularMap: 'textures/base_trim/a_reactorpipe_s03c_fin',
        normalMap: 'textures/base_trim/elec_box1_local'
    },
    'textures/base_wall/sopanel6': {
        diffuseMap: 'textures/base_wall/sopanel6_d',
        specularMap: 'textures/base_wall/sopanel6_s',
        normalMap: 'textures/base_wall/sopanel6_local',
        transparent: true,
        cast_shadow: false
    },
    'textures/base_trim/ridbeam': {
        diffuseMap: 'textures/base_trim/ridbeam_d',
        specularMap: 'textures/base_trim/ridbeam_s',
        normalMap: 'textures/base_trim/ridbeam_local',
        repeat: [1, 32]
    },
    'textures/base_floor/doortrim': {
        diffuseMap: 'textures/base_floor/doortrim_d',
        specularMap: 'textures/base_floor/doortrim_s',
        normalMap: 'textures/base_floor/doortrim_local'
    },
    'textures/base_wall/skpanel4': {
        diffuseMap: 'textures/base_wall/skpanel4_d',
        specularMap: 'textures/base_wall/skpanel4_s',
        normalMap: 'textures/base_wall/skpanel4_local'
    },
    'textures/base_wall/bluetex1b_ed': {
        diffuseMap: 'textures/base_wall/bluetex1bdif',
        specularMap: 'textures/base_wall/bluetex1bspec',
        normalMap: {
            name: 'textures/base_wall/bluetex1b_local+bluetex1bbmp',
            addNormals: {
                normalMap: 'textures/base_wall/bluetex1b_local',
                bumpMap: 'textures/base_wall/bluetex1bbmp',
                scale: 6
            }
        }
    },
    'textures/decals/labcoat': {
        diffuseMap: 'textures/decals/labcoat_d',
        specularMap: 'textures/decals/labcoat_s',
        normalMap: 'textures/decals/danger_electric_shock_local',
        transparent: true,
        cast_shadow: false,
        depthWrite: false
    },
    'textures/decals/wirejumble': {
        diffuseMap: 'textures/decals/wirejumble_d',
        specularMap: 'textures/decals/wirejumble_s',
        normalMap: 'textures/decals/wirejumble_local',
        transparent: true,
        cast_shadow: false,
        side: 'double',
        depthWrite: false
    },
    'textures/decals/splat10': {
        type: 'basic',
        diffuseMap: 'textures/decals/splat10',
        transparent: true,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color',
        cast_shadow: false,
        depthWrite: false
    },
    'textures/base_wall/sopanel18': {
        diffuseMap: 'textures/base_wall/sopanel18_d',
        specularMap: 'textures/base_wall/sopanel18_s',
        normalMap: 'textures/base_wall/sopanel18_local',
        transparent: true,
        cast_shadow: false
    },
    'textures/base_wall/sopanel18_shadow': {
        type: 'basic',
        diffuseMap: 'textures/base_wall/sopanel18_shadow',
        transparent: true,
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        cast_shadow: false
    },
    'textures/base_light/striplight6_ed': [
        {
            diffuseMap: 'textures/base_light/striplight6_d',
            specularMap: 'textures/base_light/striplight5a_s',
            normalMap: {
                name: 'textures/base_light/striplight2_local+striplight5a_b',
                addNormals: {
                    normalMap: 'textures/base_light/striplight2_local',
                    bumpMap: 'textures/base_light/striplight5a_b',
                    scale: 2
                }
            }
        },
        {
            type: 'light_basic',
            diffuseMap: 'textures/base_light/striplight6add',
            alphaMap: 'textures/base_light/striplight6add',
            lightIntensity: 2.0,
            transparent: true,
            side: 'double'
        }
    ],
    'textures/enpro/enwall18e': {
        diffuseMap: 'textures/enpro/enwall18e',
        specularMap: 'textures/enpro/enwall18e_s',
        normalMap: 'textures/enpro/enwall18_local'
    },
    'textures/decals/report_injuries': {
        diffuseMap: 'textures/decals/report_injuries_d',
        specularMap: 'textures/decals/report_injuries_s',
        normalMap: 'textures/decals/danger_electric_shock_local',
        transparent: true,
        cast_shadow: false,
        depthWrite: false
    },
    'textures/decals/stain01bwet': {
        diffuseMap: 'textures/decals/stain01b',
        specularMap: 'textures/decals/stain01b_s',
        transparent: true,
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        cast_shadow: false,
        depthWrite: false
    },
    'textures/base_wall/a_boxpanel_06': {
        diffuseMap: 'textures/base_wall/a_boxpanel_d06',
        specularMap: 'textures/base_wall/a_boxpanel_s06',
        normalMap: {
            name: 'textures/base_wall/boxpanel_local+a_boxpanel_b06',
            addNormals: {
                normalMap: 'textures/base_wall/boxpanel_local',
                bumpMap: 'textures/base_wall/a_boxpanel_b06',
                scale: 4
            }
        }
    },
    'textures/base_trim/a_reactorpipe_01_fin': {
        diffuseMap: 'textures/base_trim/a_reactorpipe_d01_fin',
        specularMap: 'textures/base_trim/a_reactorpipe_s01_fin',
        normalMap: 'textures/base_trim/a_reactorpipe_local01_fin'
    },
    'textures/decals/wheel': {
        diffuseMap: 'textures/decals/wheel_d',
        specularMap: 'textures/decals/wheel_s',
        transparent: true,
        cast_shadow: false,
        depthWrite: false,
        normalMap: {
            name: 'textures/decals/wheel_local+wheel_h',
            addNormals: {
                normalMap: 'textures/decals/wheel_local',
                bumpMap: 'textures/decals/wheel_h',
                scale: 6
            }
        }
    },
    'textures/base_light/snpanel15light': {
        diffuseMap: 'textures/base_light/snpanel15light_d',
        normalMap: 'textures/base_light/snpanel15light_local',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_light/snpanel15light_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'src_alpha',
                blendDst: 'one_minus_src_color',
            }
        ]
    },
    'textures/base_wall/a_sopanel2a_d01b': {
        diffuseMap: 'textures/base_wall/a_sopanel2a_d01b',
        specularMap: 'textures/base_wall/a_sopanel2a_s01b',
        normalMap: 'textures/base_wall/a_sopanel2a_local'
    },
    'textures/hell/anustubescroll': {
        diffuseMap: 'textures/hell/anustubescroll',
        specularMap: 'textures/hell/anustubescroll_s',
        normalMap: 'textures/hell/anustubescroll_local',
        translate: ['time * 0.01', 'time * 0.025'],
        specular: 0xffffff,
        shininess: 68,
        cast_shadow: false
    },
    'textures/hell/bacteria_5': {
        diffuseMap: {
            name: 'textures/hell/bacteria_5',
            translate: ['time * -0.01', 'time * -0.05']
        },
        specularMap: 'textures/hell/bacteria_3_s',
        normalMap: 'textures/hell/bacteria_3_local',
        specular: 0xffffff,
        shininess: 68,
        cast_shadow: false
    },
    'models/mapobjects/hell/Site3/archviletemple/candle_b': {
        diffuseMap: 'models/mapobjects/hell/Site3/archviletemple/candle_b',
        specularMap: 'models/mapobjects/hell/Site3/archviletemple/candle_b_s',
        normalMap: 'models/mapobjects/hell/Site3/archviletemple/candle_b_local',
        specular: 0xffffff,
        shininess: 100,
        /*additionalMap: {
            name: 'models/mapobjects/hell/Site3/archviletemple/candle_b_add',
            rgb: {
                expr: 'now * 0.006',
                table: 'candle'
            },
            transparent: true,
            opacity: 0.90,
            side: 'double'
        },*/
        cast_shadow: false,
        side: 'double'
    },
    'textures/particles/candlefire': {
        sprite: true,
        diffuseMap: {
            name: 'textures/particles/candlefire',
            translate: ['round(now * 2) % 16 / 16', '0']
        },
        repeat: [0.0625, 1]
    },
    'textures/decals/candleglow': {
        type: 'basic',
        diffuseMap: 'textures/decals/candleglow',
        transparent: true,
        rgb: {
            expr: 'now * 0.006',
            table: 'candle'
        },
        depthWrite: false
    },
    'textures/decals/blood_drip1': {
        type: 'basic',
        diffuseMap: 'textures/decals/blood_drip1',
        blending: 'custom',
        blendSrc: 'dst_color',
        blendDst: 'zero',
        transparent: true,
        translate: ['1', 'time * 0.1'],
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/decals/blood_drip1a',
                transparent: true,
                blending: 'custom',
                blendSrc: 'dst_color',
                blendDst: 'zero',
                translate: ['1', 'time * 0.02']
            }
        ]
    },
    'textures/hell/scowall': {
        diffuseMap: 'textures/hell/scowall',
        specularMap: 'textures/hell/scowall_s',
        normalMap: 'textures/hell/scowall_local'
    },
    'textures/decals/bulletglass2': {
        type: 'basic',
        diffuseMap: 'textures/decals/bulletglass2_d',
        transparent: true,
        side: 'double',
        depthWrite: false,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color'
    },
    'textures/decals/bulletglass1': {
        type: 'basic',
        diffuseMap: 'textures/decals/bulletglass1_d',
        transparent: true,
        side: 'double',
        depthWrite: false,
        blending: 'custom',
        blendSrc: 'zero',
        blendDst: 'one_minus_src_color'
    },
    'textures/base_floor/sflgrate2mini': {
        diffuseMap: 'textures/base_floor/sflgrate2mini_d',
        specularMap: 'textures/base_floor/sflgrate2mini_s',
        normalMap: 'textures/base_floor/sflgrate2mini_local'
    },
    'textures/rock/skysandnew_sharprock': {
        diffuseMap: 'textures/rock/skysand2',
        normalMap: {
            name: 'textures/rock/skysand1_local+textures/rock/skysand2_bmp',
            addNormals: {
                normalMap: 'textures/rock/skysand1_local',
                bumpMap: 'textures/rock/skysand2_bmp',
                scale: 4
            }
        }
    },
    'textures/hell/treerootsgrey': {
        diffuseMap: 'textures/hell/treerootsgrey',
        specularMap: 'textures/hell/treeroots_s',
        normalMap: {
            name: 'textures/hell/treeroots_local+textures/hell/treeroots_h',
            addNormals: {
                normalMap: 'textures/hell/treeroots_local',
                bumpMap: 'textures/hell/treeroots_h',
                scale: 10
            }
        },
        translate: ['0', 'time * -0.025'],
        specular: 0xffffff,
        shininess: 100,
        cast_shadow: false
    },
    'textures/glass/glass1_nvp': {
        type: 'basic',
        transparent: true,
        opacity: 0.0
    },
    'textures/decals/military_logo': {
        type: 'basic',
        transparent: true,
        diffuseMap: 'textures/decals/military_logo',
        blending: 'additive'
    },
    'textures/base_light/striplight3_broken': {
        diffuseMap: 'textures/base_light/striplight3break_d',
        specularMap: 'textures/base_light/striplight3break_s',
        normalMap: {
            name: 'textures/base_light/striplight3_local+striplight6break_b',
            addNormals: {
                normalMap: 'textures/base_light/striplight3_local',
                bumpMap: 'textures/base_light/striplight6break_b',
                scale: 2
            }
        }
    },
    'textures/sfx/flare': {
    },
    'textures/skies/desert': {
        cubeMap: 'env/desert'
    },
    'textures/base_floor/diafloor': {
        diffuseMap: 'textures/base_floor/diafloor_d',
        normalMap: 'textures/base_floor/diafloor_local',
        specularMap: 'textures/base_floor/diafloor_s'
    },
    'textures/base_wall/skpanelt': {
        diffuseMap: 'textures/base_wall/skpanelT_d',
        normalMap: 'textures/base_wall/skpanelT_local',
        specularMap: 'textures/base_wall/skpanelT_s'
    },
    'models/mapobjects/elevators/elevator': {
        diffuseMap: 'models/mapobjects/elevators/elevator',
        normalMap: 'models/mapobjects/elevators/elevator_local',
        specularMap: 'models/mapobjects/elevators/elevator_s2',
        specular: 0x808080
    },
    'models/mapobjects/elevators/elevator_cop': {
        diffuseMap: 'models/mapobjects/elevators/elevator_cop',
        normalMap: 'models/mapobjects/elevators/elevator_local',
        specularMap: 'models/mapobjects/elevators/elevator_cop_s',
        specular: 0x808080
    },
    'textures/base_wall/skpanel1a': {
        diffuseMap: 'textures/base_wall/skpanel1a',
        normalMap: 'textures/base_wall/skpanel1_local',
        specularMap: 'textures/base_wall/skpanel1_s'
    },
    'textures/base_light/striplight3': {
        normalMap: 'textures/base_light/striplight3_local',
        diffuseMap: 'textures/base_light/striplight3_d',
        specularMap: 'textures/base_light/striplight3_s',
        children: [
            {
                type: 'basic',
                diffuseMap: 'textures/base_light/striplight3_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'dst_color',
                blendDst: 'zero',
                translate: ['1', 'time * 0.02']
            }
        ]
    },
    'gui/faces5': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/faces',
            repeat: [3.8, 2],
            translate: ['time * 0.05', 'time * 0.03'],
            rotate: 'time * -0.02',
            color: 0x4d8080,
            transparent: true
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/common/blood',
            repeat: [1.5, 1.5],
            scroll: ['time * 0.01', 'time * 0.07'],
            color: 0x999999,
            transparent: true,
            opacity: {expression: 'table("pdStarTable", time * 0.2)'}
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/facesov3',
            repeat: [3.8, 2.0],
            translate: ['time * 0.05', 'time * 0.03'],
            rotate: 'time * -0.01',
            color: 0x80b3b3,
            transparent: true
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/common/blood',
            color: 0x333333,
            transparent: true,
            opacity: {expression: 'table("pdhalffade", time * 0.2)'},
            translate: ['time * 0.5', 'time * 0.03'],
            rotate: 'time * -0.01',
            repeat: [1, 1]
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/facesov3',
            scroll: ['time * -0.1', 'time * -0.1'],
            color: {expression: 'table("pdhalffade", time * 2)'},
            transparent: true,
            opacity: {expression: 'table("pdfullfade", time * 0.02)'},
            rotate: 'time * -0.01',
            repeat: [{expression: 'table("pdscaleTable2", time * 0.01)'}, 2]
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/facesov3',
            scroll: ['time * -0.1', 'time * -0.1'],
            color: {expression: 'table("pdhalffade", time * 0.2)'},
            rotate: 'time * -0.005',
            repeat: [{expression: 'table("pdStarTable", time * 0.01)'}, 2]
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/facesov3',
            scroll: ['time * -0.1', 'time * -0.1'],
            color: {expression: 'table("pdhalffade", time * 2)'},
            transparent: true,
            opacity: {expression: 'table("pdcomm2Table", time * 0.1)'},
            rotate: 'time * -0.005',
            repeat: [{expression: 'table("pdStarTable", time * 0.01)'}, 2]
        }
    ],
    'gui/warp/static': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/warp',
            repeat: [1, {expression: 'table("pdscaleTable2", time * 0.3)'}],
            scroll: ['time * -.2', 'time * -0.8'],
            transparent: true,
            opacity: 0.15
        },
        {
            type: 'shader',
            diffuseMap: 'textures/sfx/monitor_glass2',
            repeat: [5, 5],
            translate: ['time * 0.1', 'time * 1'],
            transparent: true,
            opacity: 0.1
        },
        {
            type: 'shader',
            diffuseMap: 'textures/sfx/monitor_glass2',
            repeat: [5, 5],
            translate: ['time * -0.1', 'time * -0.1'],
            transparent: true,
            opacity: 0.1
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/static',
            repeat: [1, {expression: 'table("pdscaleTable4", time * 0.5)'}],
            scroll: ['0', 'time * 2'],
            transparent: true
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/test/static',
            repeat: [1, 2],
            scroll: ['0', 'time * -0.8'],
            transparent: true,
            opacity: 0.7
        }
    ],
    'gui/static': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/cpuserver/bg',
            transparent: true,
            opacity: 0.15
        },
        {
            type: 'shader',
            diffuseMap: 'textures/sfx/monitor_glass2',
            repeat: [2, 2],
            translate: [
                'table("staticatable", time * 20) * time',
                'table("staticatable", time) * time',
            ],
            rotate: 'time * 6',
            color: {
                red: {expression: 'table("flickertable", time * 2)'},
                green: {expression: 'table("flickertable", time * 2)'},
                blue: {expression: 'table("flickertable", time * 2)'}
            },
            transparent: true,
            opacity: 0.15
        }
    ],
    'gui/static2': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/cpuserver/bg',
            color: 0xffffff,
            transparent: true,
            opacity: {expression: 'table("pdhalffade", time * 0.001) / 10'}
        },
        {
            type: 'shader',
            diffuseMap: 'textures/sfx/monitor_glass2',
            repeat: [2, 2],
            translate: [
                'table("staticatable", time * 20) * time',
                'table("staticatable", time) * time',
            ],
            rotate: 'time * 6',
            color: 0xffffff,
            transparent: true,
            opacity: {expression: 'table("pdhalffade", time * 0.001) / 10'}
        }
    ],
    'gui/static3': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/cpuserver/bg',
            color: 0xffffff,
            transparent: true,
            opacity: {expression: 'table("pdhalffade", time * 0.001) / 8'}
        },
        {
            type: 'shader',
            diffuseMap: 'textures/sfx/monitor_glass2',
            color: 0xffffff,
            repeat: [2, 2],
            translate: [
                'table("staticatable", time * 20) * time',
                'table("staticatable", time) * time',
            ],
            rotate: 'time * 6',
            transparent: true,
            opacity: {expression: 'table("pdhalffade", time * 0.001) / 8'}
        }
    ],
    'gui/addhighlight': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/addhighlight',
        transparent: true,
        color: 0x4d6666,
        blending: 'additive'
    },
    'gui/addhighlight2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/addhighlight',
        transparent: true,
        opacity: 1.0,
        color: 0x668080,
        blending: 'additive'
    },
    'gui/addhighlight3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/addhighlight',
        transparent: true,
        opacity: 1.0,
        color: 0x266680,
        blending: 'additive'
    },
    'gui/addhighlight4': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/addhighlight',
        transparent: true,
        color: 0xcccccc,
        blending: 'additive'
    },
    'gui/addhighlight5': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/addhighlight',
        transparent: true,
        color: 0x806626,
        blending: 'additive'
    },
    'gui/spin1alt': {
        clamp: true,
        type: 'shader',
        diffuseMap: 'guis/assets/rodstat/circle2',
        rotate: 'time * -0.015',
        transparent: true,
        opacity: 0.5,
        color: 0x809999,
        repeat: [0.86, 0.56],
        get translate() {
            return [(1 - this.repeat[0]) / 2, (1 - this.repeat[1]) / 2 + 0.02]
        },
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin2alt': {
        clamp: true,
        type: 'shader',
        diffuseMap: 'guis/assets/rodstat/circle2',
        rotate: 'time * 0.02',
        transparent: true,
        opacity: 0.5,
        color: 0x809999,
        repeat: [0.96, 0.64],
        get translate() {
            return [(1 - this.repeat[0]) / 2, (1 - this.repeat[1]) / 2 + 0.02];
        },
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin3alt': {
        clamp: true,
        type: 'shader',
        diffuseMap: 'guis/assets/rodstat/circle2',
        rotate: 'time * -0.025',
        transparent: true,
        opacity: 0.5,
        color: 0x809999,
        repeat: [1, 0.72],
        get translate() {
            return [0, (1 - this.repeat[1]) / 2 + 0.02];
        },
        get center() {
            return [0.5, 0.5 - this.translate[1]];
        }
    },
    'gui/spin4alt': {
        clamp: true,
        type: 'shader',
        diffuseMap: 'guis/assets/rodstat/circle2',
        rotate: 'time * 0.03',
        transparent: true,
        opacity: 0.5,
        color: 0x809999,
        repeat: [1, 0.80],
        get translate() {
            return [0, (1 - this.repeat[1]) / 2 + 0.02];
        },
        get center() {
            return [0.5, 0.5 - this.translate[1]];
        }
    },
    'gui/spin1': {
        type: 'shader',
        clamp: true,
        transparent: true,
        diffuseMap: 'guis/assets/common/securitybg',
        rotate:	'time * 0.015',
        repeat: [0.78, 0.24],
        translate: [0.11, 0.37],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin1_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x800000,
        rotate:	'time * 0.015',
        transparent: true,
        opacity: 0.5,
        repeat: [0.78, 0.24],
        translate: [0.11, 0.37],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.02',
        repeat: [0.88, 0.34],
        translate: [0.06, 0.32],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin2_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x800000,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.02',
        repeat: [0.88, 0.34],
        translate: [0.06, 0.32],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin3': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.025',
        repeat: [1, 0.44],
        translate: [0, 0.27],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin3_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x800000,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.025',
        repeat: [1, 0.44],
        translate: [0, 0.27],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin4': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.03',
        repeat: [1.14, 0.54],
        translate: [-0.07, 0.22],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin4_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x800000,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.03',
        repeat: [1.14, 0.54],
        translate: [-0.07, 0.22],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin5': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.035',
        repeat: [1.26, 0.64],
        translate: [-0.13, 0.17],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin5_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x801a1a,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.035',
        repeat: [1.26, 0.64],
        translate: [-0.13, 0.17],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin6': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.04',
        repeat: [1.46, 0.74],
        translate: [-0.23, 0.12],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin6_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x801a1a,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.04',
        repeat: [1.46, 0.74],
        translate: [-0.23, 0.12],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin7': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.045',
        repeat: [1.66, 0.84],
        translate: [-0.33, 0.07],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin7_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x801a1a,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.045',
        repeat: [1.66, 0.84],
        translate: [-0.33, 0.07],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin8': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        transparent: true,
        rotate:	'time * 0.05',
        repeat: [1.86, 0.94],
        translate: [-0.43, 0.02],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/spin8_2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/securitybg',
        color: 0x801a1a,
        transparent: true,
        opacity: 0.5,
        rotate:	'time * 0.05',
        repeat: [1.86, 0.94],
        translate: [-0.43, 0.02],
        get center() {
            return [0.5 - this.translate[0], 0.5 - this.translate[1]];
        }
    },
    'gui/test/gui_scanlines': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/gui_scanlines',
        scroll: ['0', 'time * -.04'],
        transparent: true,
        blending: 'additive'
    },
    'gui/test/gui_scanlines2': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/gui_scanlines',
        color: 0xffffff,
        transparent: true,
        scroll: ['0', 'time * -.04'],
        blending: 'additive'
    },
    'gui/test/gui_scanlines5': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/gui_scanlines5',
        scroll: ['0', 'time * -.02'],
        transparent: true,
        blending: 'additive'
    },
    'gui/test/gui_scanlines5_2': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/gui_scanlines5',
        color: 0x1a1a1a,
        scroll: ['0', 'time * -.02'],
        transparent: true,
        blending: 'additive'
    },
    'gui/test/gui_scanlines5_3': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/gui_scanlines5',
        color: 0x333333,
        scroll: ['0', 'time * -.02'],
        transparent: true,
        blending: 'additive'
    },
    'gui/reflect1': {
        type: 'shader',
        diffuseMap: 'guis/assets/smdoor/reflect1',
        color: {
            red: {expression: 'table("subtleflick", time * 3)'},
            green: {expression: 'table("subtleflick", time * 3)'},
            blue: {expression: 'table("subtleflick", time * 3)'}
        },
        transparent: true,
        opacity: 0.1
    },
    'gui/reflect1_2': {
        type: 'shader',
        diffuseMap: 'guis/assets/smdoor/reflect1',
        color: 0xffffff,
        transparent: true,
        opacity: 0.05
    },
    'textures/base_door/smdoor1a': {
        normalMap: 'textures/base_door/smdoor1a_local',
        diffuseMap: 'textures/base_door/smdoor1a',
        specularMap: 'textures/base_door/smdoor1a_s'
    },
    'textures/base_door/smdoor1b': {
        normalMap: 'textures/base_door/smdoor1a_local',
        diffuseMap: 'textures/base_door/smdoor1b',
        specularMap: 'textures/base_door/smdoor1b_s',
        specular: 0x808080
    },
    'textures/base_door/delelev1': {
        normalMap: 'textures/base_door/delelev1_local',
        diffuseMap: 'textures/base_door/delelev1_d',
        specularMap: 'textures/base_door/delelev1_s',
        specular: 0x808080
    },
    'textures/base_door/delelev2': {
        normalMap: 'textures/base_door/delelev2_local',
        diffuseMap: 'textures/base_door/delelev2_d',
        specularMap: 'textures/base_door/delelev2_s'
    },
    'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1': {
        diffuseMap: 'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1_d',
        specularMap: 'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1_s',
        normalMap: {
            name: 'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1_local+techdrpanel1_bmp',
            addNormals: {
                normalMap: 'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1_local',
                bumpMap: 'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1_bmp',
                scale: 3
            }
        },
        specular: 0x808080
    },
    'textures/base_door/doorlight': {
        type: 'basic',
        diffuseMap: 'textures/base_door/doorlight_red',
        normalMap: 'textures/base_door/doorlight_local'
    },
    'models/mapobjects/healthgui/healthgui': {
        diffuseMap: 'models/mapobjects/healthgui/healthgui',
        specularMap: 'models/mapobjects/healthgui/healthgui_s',
        normalMap: 'models/mapobjects/healthgui/healthgui_local'
    },
    'models/mapobjects/healthgui/healthguidirty': {
        diffuseMap: 'models/mapobjects/healthgui/healthguidirty',
        specularMap: 'models/mapobjects/healthgui/healthguidirty_s',
        normalMap: {
            name: 'models/mapobjects/healthgui/healthgui_local+healthguidirty_b',
            addNormals: {
                normalMap: 'models/mapobjects/healthgui/healthgui_local',
                bumpMap: 'models/mapobjects/healthgui/healthguidirty_b',
                scale: 3
            }
        },
        specular: 0x696969
    },
    'gui/health/ekg2flat': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgpulse2',
            transparent: true,
            scroll: ['time * -.4', '0']
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgmatflat',
            transparent: true,
            blending: 'custom',
            blendSrc: 'one_minus_dst_alpha',
            blendDst: 'src_alpha'
        }
    ],
    'gui/health/ekg3flat': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgpulse2',
            transparent: true,
            scroll: ['time * -0.9', '0']
        },
        {
            type: 'shader',
            diffuseMap: {
                name: 'guis/assets/health/ekgmatflat',
                negate: true
            },
            transparent: true,
            blending: 'custom',
            blendSrc: 'one_minus_dst_alpha',
            blendDst: 'src_alpha'
        }
    ],
    // TODO: Color should be assigned depending on the player's health level
    'gui/health/ekg3flat2': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgpulse2',
            color: 0xff0000,
            transparent: true,
            scroll: ['time * -0.9', '0']
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgmatflat',
            color: 0xff0000,
            transparent: true,
            blending: 'custom',
            blendSrc: 'one_minus_dst_alpha',
            blendDst: 'src_alpha'
        }
    ],
    'gui/health/ekgflat': [
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgpulse',
            transparent: true,
            scroll: ['time * -0.8', '0']
        },
        {
            type: 'shader',
            diffuseMap: 'guis/assets/health/ekgmatflat',
            transparent: true,
            blending: 'custom',
            blendSrc: 'one_minus_dst_alpha',
            blendDst: 'src_alpha'
        }
    ],
    'gui/cpuserver/bgwhite': {
        type: 'shader',
        color: 0,
        diffuseMap: 'guis/assets/cpuserver/bgWhite',
        transparent: true,
        opacity: 0.9
    },
    'gui/cpuserver/bgwhite4': {
        type: 'shader',
        color: 0,
        transparent: true,
        opacity: 0.7
    },
    'gui/cpuserver/bgwhite4_2': {
        type: 'shader',
        color: 0,
        diffuseMap: 'guis/assets/cpuserver/bgWhite4',
        transparent: true,
        opacity: 0.9
    },
    'gui/doors/adminbg1': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/doors/adminbg',
        color: 0x99cccc,
        transparent: true,
        repeat: [0.9, 0.7]
    },
    'gui/doors/adminbg2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/doors/adminbg',
        color: 0x99cccc,
        transparent: true,
        opacity: 1,
        repeat: [0.9, 0.79],
    },
    'gui/bgblack': {
        type: 'shader',
        color: 0,
        transparent: true,
        opacity: 0.9
    },
    'gui/bgblack2': {
        type: 'shader',
        color: 0,
    },
    'gui/bgblack3': {
        type: 'shader',
        color: 0,
        transparent: true,
        opacity: 0.7
    },
    'gui/common/titlebar_corner': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/titlebar_corner',
        color: 0x99ccd9,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/titlebar_corner2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/titlebar_corner',
        color: 0xcc9980,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/titlebar_edge2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/titlebar_edge',
        color: 0xcc9980,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/titlebar_edge3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/titlebar_edge',
        color: 0xff3300,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/titlebar_mid': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/titlebar_mid',
        color: 0x99ccd9,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/titlebar_mid2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/titlebar_mid',
        color: 0xcc9980,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/titlebar_mid3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/titlebar_mid',
        color: 0xff3300,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/btn_2pxborder_horiz1': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/btn_2pxborder_horiz',
        color: 0x80ffe6,
        transparent: true,
        opacity: 0.2
    },
    'gui/common/btn_2pxborder_horiz2': {
        type: 'shader',
        clamp: true,
        diffuseMap: 'guis/assets/common/btn_2pxborder_horiz',
        color: 0x80ffe6,
        transparent: true,
        opacity: 0.2,
        translate: [0, 0.4]
    },
    'gui/common/btn_2pxborder_horiz3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/btn_2pxborder_horiz',
        color: 0xff3300,
        transparent: true,
        opacity: 0.5
    },
    'gui/common/btn_2pxborder_cornersm3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/btn_2pxborder_cornersm',
        color: 0xff3300,
        transparent: true,
        opacity: 0.5
    },
    'gui/common/btn_2pxborder_vert3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/btn_2pxborder_vert',
        color: 0xff3300,
        transparent: true,
        opacity: 0.5
    },
    'gui/cpuserver/bglow': {
        type: 'shader',
        diffuseMap: 'guis/assets/cpuserver/bglow',
        color: 0x80e699,
        transparent: true,
        opacity: 0.1
    },
    'gui/cpuserver/bglow2': {
        type: 'shader',
        diffuseMap: 'guis/assets/cpuserver/bglow',
        transparent: true,
        opacity: 0.1,
        color: 0xffcccc
    },
    'gui/common/outerglow': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/outerglow',
        color: 0xffffff,
        transparent: true,
        opacity: {expression: 'table("pdflick", time * 0.0025) / 6'}
    },
    'gui/common/outerglow2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/outerglow',
        transparent: true,
        opacity: {expression: 'table("pdflick", time * 0.0025) / 6'}
    },
    'gui/common/outershadow': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/outershadow',
        color: 0xffffff,
        transparent: true
    },
    'gui/common/outershadow2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/outershadow',
        transparent: true
    },
    'gui/common/dirt3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/dirt3',
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    },
    'gui/common/dirt4': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/dirt4',
        transparent: true,
        opacity: 0.2
    },
    'gui/common/dirt4_2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/dirt4',
        transparent: true,
        opacity: 0.8
    },
    'gui/common/dirt4_3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/dirt4',
        transparent: true,
        opacity: 0.2,
        color: 0xffffff
    },
    'gui/common/dirt2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/dirt2',
        transparent: true,
        opacity: 0.5
    },
    'gui/common/dirt2_2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/dirt2',
        transparent: true,
        opacity: 0.8
    },
    'gui/test/mask': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/mask',
        transparent: true,
        opacity: 0.1
    },
    'gui/test/mask2': {
        type: 'shader',
        diffuseMap: 'guis/assets/test/mask',
        transparent: true,
        opacity: 0.2
    },
    'gui/cpuserver/bg': {
        type: 'shader',
        diffuseMap: 'guis/assets/cpuserver/bg',
        color: 0,
        transparent: true
    },
    'gui/common/1pxborder_cornersm': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/1pxborder_cornersm',
        transparent: true
    },
    'gui/common/1pxborder_cornersm2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/1pxborder_cornersm',
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    },
    'gui/common/1pxborder_vert': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/1pxborder_vert',
        transparent: true
    },
    'gui/common/1pxborder_vert2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/1pxborder_vert',
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    },
    'gui/common/1pxborder_horiz': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/1pxborder_horiz',
        transparent: true
    },
    'gui/common/1pxborder_horiz2': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/1pxborder_horiz',
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    },
    'gui/common/scibox/fillboxcap': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/scibox/fillboxCap',
        transparent: true,
        color: 0xff0000,
        opacity: 0.2
    },
    'gui/common/scibox/fillboxcenter': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/scibox/fillboxCenter',
        transparent: true,
        color: 0xff0000,
        opacity: 0.2
    },
    'gui/caverns/cranebox': {
        type: 'shader',
        diffuseMap: 'guis/assets/caverns/cranebox',
        transparent: true,
        color: 0,
        clamp: true,
        translate: [0.34, 0]
    },
    'gui/caverns/cranebox2': {
        type: 'shader',
        diffuseMap: 'guis/assets/caverns/cranebox',
        transparent: true,
        opacity: 0.15,
        color: 0xff0000,
        clamp: true,
        translate: [0.34, 0]
    },
    'gui/health/circle': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/circle',
        transparent: true,
        opacity: 0.42,
        color: 0xff0000
    },
    'gui/health/circle2': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/circle',
        rotate: 'time * -0.05',
        clamp: true,
        transparent: true
    },
    'gui/health/circle3': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/circle',
        transparent: true,
        opacity: 0.62,
        color: 0xff0000
    },
    'gui/health/line': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/line',
        transparent: true,
        opacity: 0.4,
        color: 0xff0000
    },
    'gui/health/line2': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/line',
        transparent: true,
        opacity: 0.6,
        color: 0xff0000
    },
    'gui/common/glowborder_vert': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/glowborder_vert',
        transparent: true,
        color: 0xb3e6ff
    },
    'gui/glowborder_horiz': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/glowborder_horiz',
        transparent: true,
        color: 0xb3e6ff
    },
    'gui/common/glowborder_corner4': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/glowborder_corner4',
        transparent: true,
        color: 0xb3e6ff
    },
    'gui/common/glowborder_corner3': {
        type: 'shader',
        diffuseMap: 'guis/assets/common/glowborder_corner3',
        transparent: true,
        color: 0xb3e6ff
    },
    'gui/airlock/inbgfill': {
        type: 'shader',
        diffuseMap: 'guis/assets/airlock/inbgfill',
        transparent: true,
        opacity: 0.2,
        color: 0x71b4ff
    },
    'gui/health/button2': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/button2',
        transparent: true,
        opacity: 0.5,
        color: 0xcccccc
    },
    'gui/health/button2bar': {
        type: 'shader',
        diffuseMap: 'guis/assets/health/button2bar',
        transparent: true,
        opacity: 0.2,
        color: 0xffffff
    },
    'gui/malfunction2/redfade': {
        type: 'shader',
        color: 0x660000,
        transparent: true,
        opacity: 0.0
    },
    'textures/hell/treeroots_blend': {
        diffuseMap: 'textures/hell/treerootsgrey',
        normalMap: 'textures/hell/treeroots2_local',
        specularMap: 'textures/hell/treeroots_s',
        translate: ['0.0', 'time * -0.025'],
        specular: 0xffffff,
        shininess: 100
    },
    'textures/hell/wirestreerootsgrey_blend': {
        diffuseMap: 'textures/hell/wires2_d',
        normalMap: 'textures/hell/wires2_local',
        specularMap: 'textures/hell/wires2_s',
        specular: 0xffffff,
        shininess: 100
    },
    'textures/rock/skysand1': {
        diffuseMap: 'textures/rock/skysand1_d',
        normalMap: {
            name: 'textures/rock/skysand1_local+textures/rock/skysand1_bmp',
            addNormals: {
                normalMap: 'textures/rock/skysand1_local',
                bumpMap: 'textures/rock/skysand1_bmp',
                scale: 4
            }
        }
    },
    'textures/enpro/enwall19f': {
        diffuseMap: 'textures/enpro/enwall19f',
        normalMap: 'textures/base_wall/stepanel5_local',
        specularMap: 'textures/enpro/enwall19_s'
    },
    'models/mapobjects/lab/cscope/cscopebase': {
        diffuseMap: 'models/mapobjects/lab/cscope/cscopebase_d',
        normalMap: {
            name: 'models/mapobjects/lab/cscope/cscopebase_local+models/mapobjects/lab/cscope/cscopebase_bmp',
            addNormals: {
                normalMap: 'models/mapobjects/lab/cscope/cscopebase_local',
                bumpMap: 'models/mapobjects/lab/cscope/cscopebase_bmp',
                scale: 3
            }
        },
        specularMap: 'models/mapobjects/lab/cscope/cscopebase_s',
        children: [
            {
                type: 'basic',
                diffuseMap: 'models/mapobjects/lab/cscope/cscopebase_add',
                transparent: true,
                blending: 'custom',
                blendSrc: 'dst_color',
                blendDst: 'zero',
                translate: ['1', 'time * 0.02']
            }
        ]
    },
    'models/mapobjects/lab/cscope/cscopearm': {
        diffuseMap: 'models/mapobjects/lab/cscope/cscopearm_d',
        normalMap: {
            name: 'models/mapobjects/lab/cscope/cscopearm_local+models/mapobjects/lab/cscope/cscopearm_bmp',
            addNormals: {
                normalMap: 'models/mapobjects/lab/cscope/cscopearm_local',
                bumpMap: 'models/mapobjects/lab/cscope/cscopearm_bmp',
                scale: 3
            }
        },
        specularMap: 'models/mapobjects/lab/cscope/cscopearm_s'
    },
    'models/mapobjects/turrets/ceilingturret1': {
        diffuseMap: 'models/mapobjects/turrets/ceilingturret1',
        normalMap: 'models/mapobjects/turrets/ceilingturret1_local',
        specularMap: 'models/mapobjects/turrets/ceilingturret1_s'
    },
    'models/mapobjects/utility/inhaler/inhaler': {
        diffuseMap: 'models/mapobjects/utility/inhaler/inhaler_d',
        normalMap: 'models/mapobjects/utility/inhaler/inhaler_local',
        specularMap: 'models/mapobjects/utility/inhaler/inhaler_s'
    },
    'textures/base_trim/reactorgirder1': {
        diffuseMap: 'textures/base_trim/reactorgirder1_d',
        normalMap: 'textures/base_trim/reactorgirder1_local',
        specularMap: 'textures/base_trim/reactorgirder1_s',
        transparent: true,
        alphaTest: 0.5
    },
    'models/mapobjects/doors/techdoor2/techdr2lft': {
        diffuseMap: 'models/mapobjects/doors/techdoor2/techdr2cb_d',
        normalMap: {
            name: 'models/mapobjects/doors/techdoor2/techdr2cb_local+models/mapobjects/doors/techdoor2/techdr2cb_bmp',
            addNormals: {
                normalMap: 'models/mapobjects/doors/techdoor2/techdr2cb_local',
                bumpMap: 'models/mapobjects/doors/techdoor2/techdr2cb_bmp',
                scale: 3
            }
        },
        specularMap: 'models/mapobjects/doors/techdoor2/techdr2cb_s'
    },
    'models/mapobjects/doors/techdoor2/techdr2lft_cop': {
        diffuseMap: 'models/mapobjects/doors/techdoor2/techdr2cb_cop_d',
        normalMap: 'models/mapobjects/doors/techdoor2/techdr2cb_local',
        specularMap: 'models/mapobjects/doors/techdoor2/techdr2cb_cop_s'
    },
    'models/mapobjects/doors/techdoor2/techdr2frame_cop': {
        diffuseMap: 'models/mapobjects/doors/techdoor2/techdr2frame_cop_d',
        normalMap: 'models/mapobjects/doors/techdoor2/techdr2frame_local',
        specularMap: 'models/mapobjects/doors/techdoor2/techdr2frame_cop_s'
    },
    'textures/decals/alphabet1': {
        diffuseMap: 'textures/decals/alphabet1_d'
    },
    'textures/base_door/doorlight_red_to_green': {
        type: 'basic',
        diffuseMap: {
            name: {
                parm7: {
                    0: 'textures/base_door/doorlight_grn',
                    1: 'textures/base_door/doorlight_red'
                }
            }
        },
        normalMap: 'textures/base_door/doorlight_local'
    },
    'models/mapobjects/doors/techdoor1/techdr1frame_cop': {
        diffuseMap: 'models/mapobjects/doors/techdoor1/techdr1frame_cop_d',
        normalMap: 'models/mapobjects/doors/techdoor1/techdr1frame_local',
        specularMap: 'models/mapobjects/doors/techdoor1/techdr1frame_cop_s'
    },
    'models/mapobjects/doors/techdoor1/techdr1lft_cop': {
        diffuseMap: 'models/mapobjects/doors/techdoor1/techdr1lft_cop_d',
        normalMap: 'models/mapobjects/doors/techdoor1/techdr1lft_local',
        specularMap: 'models/mapobjects/doors/techdoor1/techdr1lft_cop_s'
    },
    'models/mapobjects/doors/techdoor1/techdr1rt_cop': {
        diffuseMap: 'models/mapobjects/doors/techdoor1/techdr1rt_cop_d',
        normalMap: 'models/mapobjects/doors/techdoor1/techdr1rt_local',
        specularMap: 'models/mapobjects/doors/techdoor1/techdr1rt_cop_s'
    }
};

export class Materials {
    static override(target, source) {
        const result = Object.assign({}, target);
        if (source.color != null) {
            result.color = source.color;
        }
        if (source.transparent != null) {
            result.transparent = source.transparent;

            if (source.opacity != null) {
                result.opacity = source.opacity;
            }
        }
        if (source.scale) {
            result.scale = source.scale;
        }
        if (source.parameters) {
            result.parameters = source.parameters;
        }
        return result;
    }
}
