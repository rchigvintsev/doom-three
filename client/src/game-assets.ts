import {Texture} from 'three';

import {Md5Animation} from './loader/md5-animation';
import {Md5Mesh} from './loader/md5-mesh';

export class GameAssets {
    readonly textures = new Map<string, Texture>();
    readonly modelMeshes = new Map<string, Md5Mesh>();
    readonly modelAnimations = new Map<string, Md5Animation>();
    readonly sounds = new Map<string, AudioBuffer>();
}