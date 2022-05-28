import {Texture} from 'three';

export class GameAssets {
    readonly textures = new Map<string, Texture>();
    readonly modelMeshes = new Map<string, any>();
    readonly modelAnimations = new Map<string, any>();
    readonly sounds = new Map<string, AudioBuffer>();
}