import {Mesh, Texture} from 'three';

export class GameAssets {
    readonly textures = new Map<string, Texture>();
    readonly modelMeshes = new Map<string, Mesh>();
    readonly modelAnimations = new Map<string, any>();
    readonly sounds = new Map<string, AudioBuffer>();
}