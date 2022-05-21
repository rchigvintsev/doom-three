import {Texture} from 'three';

import {Md5Animation} from './model/md5-animation';
import {Md5Mesh} from './model/md5-mesh';

export class GameAssets {
    readonly textures = new Map<string, Texture>();
    readonly modelMeshes = new Map<string, Md5Mesh>();
    readonly modelAnimations = new Map<string, Md5Animation>();
    readonly sounds = new Map<string, AudioBuffer>();
}