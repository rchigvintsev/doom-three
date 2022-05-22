const CONFIG_KEY = 'doom-three-config';

const DEFAULT_CAMERA_FOV = 75;
const DEFAULT_CAMERA_NEAR = 0.01;
const DEFAULT_CAMERA_FAR = 1000;
const DEFAULT_ANTIALIAS = false;
const DEFAULT_SHOW_STATS = true;
const DEFAULT_WIREFRAME_ONLY = false;
const DEFAULT_WORLD_SCALE = 0.01;

export class GameConfig {
    cameraFov = DEFAULT_CAMERA_FOV;
    cameraNear = DEFAULT_CAMERA_NEAR;
    cameraFar = DEFAULT_CAMERA_FAR;
    antialias = DEFAULT_ANTIALIAS;
    showStats = DEFAULT_SHOW_STATS;
    wireframeOnly = DEFAULT_WIREFRAME_ONLY;
    worldScale = DEFAULT_WORLD_SCALE;

    static load(): GameConfig {
        const configJson = localStorage[CONFIG_KEY];
        return configJson ? JSON.parse(configJson) : new GameConfig();
    }
}