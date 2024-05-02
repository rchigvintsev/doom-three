import {PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {GameConfig} from './game-config';
import {GameAssets} from './game-assets';

export class GameContext {
    constructor(readonly config: GameConfig,
                readonly assets: GameAssets,
                readonly camera: PerspectiveCamera,
                readonly scene: Scene,
                readonly renderer: WebGLRenderer) {
    }
}