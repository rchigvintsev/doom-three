import {Mesh, Texture} from 'three';

import {Md5Animation} from './animation/md5-animation';

export class GameAssets {
    mapMeta: any;
    mapDef: any;
    playerDef: any;
    hudDef: any;

    readonly materialDefs = new Map<string, any>();
    readonly tableDefs = new Map<string, any>();
    readonly particleDefs = new Map<string, any>();
    readonly soundDefs = new Map<string, any>();
    readonly weaponDefs = new Map<string, any>();
    readonly debrisDefs = new Map<string, any>();

    readonly textures = new Map<string, Texture>();
    readonly modelMeshes = new Map<string, Mesh>();
    readonly modelAnimations = new Map<string, Md5Animation>();
    readonly sounds = new Map<string, AudioBuffer>();
}