var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
  DT.GameConstants = {
    TIME_STEP: 1 / 60,
    WORLD_SCALE: 0.01,
    PLAYER_HEIGHT: 0.64
  };

  DT.VisualizationMode = {
    NORMAL: 0,
    WIREFRAME: 1,
    RIGID_BOX_HELPERS: 2
  };
})(DOOM_THREE);

export const GameConstants = DOOM_THREE.GameConstants;
