import {Mesh, Texture} from 'three';

import {Md5Animation} from './animation/md5-animation';

export class GameAssets {
    readonly textures = new Map<string, Texture>();
    readonly modelMeshes = new Map<string, Mesh>();
    readonly modelAnimations = new Map<string, Md5Animation>();
    readonly sounds = new Map<string, AudioBuffer>();
}