const CONFIG_KEY = 'doom-three-config';

const DEFAULT_CAMERA_FOV = 75;
const DEFAULT_CAMERA_NEAR = 0.01;
const DEFAULT_CAMERA_FAR = 1000;
const DEFAULT_ANTIALIAS = false;
const DEFAULT_SHOW_STATS = true;
const DEFAULT_SHOW_WIREFRAME = false;
const DEFAULT_RENDER_ONLY_WIREFRAME = false;
const DEFAULT_WORLD_SCALE = 0.01;
const DEFAULT_PLAYER_LOOK_SPEED = 0.002;
const DEFAULT_PLAYER_MOVE_SPEED = 1.8;
const DEFAULT_PLAYER_MOVE_SPEED_IN_GHOST_MODE = 0.05;
const DEFAULT_PLAYER_JUMP_SPEED = 3.2;
const DEFAULT_SHOW_LIGHT_SOURCES = false;
const DEFAULT_SHOW_SKELETONS = false;
const DEFAULT_SHOW_COLLISION_MODELS = false;
const DEFAULT_GHOST_MODE = false;

export class GameConfig {
    cameraFov = DEFAULT_CAMERA_FOV;
    cameraNear = DEFAULT_CAMERA_NEAR;
    cameraFar = DEFAULT_CAMERA_FAR;
    antialias = DEFAULT_ANTIALIAS;
    showStats = DEFAULT_SHOW_STATS;
    showWireframe = DEFAULT_SHOW_WIREFRAME;
    renderOnlyWireframe = DEFAULT_RENDER_ONLY_WIREFRAME;
    worldScale = DEFAULT_WORLD_SCALE;
    playerLookSpeed = DEFAULT_PLAYER_LOOK_SPEED;
    playerMoveSpeed = DEFAULT_PLAYER_MOVE_SPEED;
    playerMoveSpeedInGhostMode = DEFAULT_PLAYER_MOVE_SPEED_IN_GHOST_MODE;
    playerJumpSpeed = DEFAULT_PLAYER_JUMP_SPEED;
    showLightSources = DEFAULT_SHOW_LIGHT_SOURCES;
    showSkeletons = DEFAULT_SHOW_SKELETONS;
    showCollisionModels = DEFAULT_SHOW_COLLISION_MODELS;
    ghostMode = DEFAULT_GHOST_MODE;

    static load(): GameConfig {
        const configJson = localStorage[CONFIG_KEY];
        return configJson ? JSON.parse(configJson) : new GameConfig();
    }
}