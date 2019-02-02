var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var SETTINGS_KEY = 'doom-three-settings';

    DT.Settings = function () {
        var settings = {
            antialias: false,
            cameraFov: 75,
            cameraNear: 0.01,
            cameraFar: 1000,
            showLightSphere: false,
            showWireframe: false,
            wireframeOnly: false,
            showCollisionModel: false,
            ghostMode: true,
            renderBoundingBoxes: false
        };

        return {
            load: function () {
                var settingsJson = localStorage[SETTINGS_KEY];
                if (settingsJson !== undefined) {
                    var loadedSettings = JSON.parse(settingsJson);
                    for (var key in loadedSettings) {
                        if (loadedSettings.hasOwnProperty(key) && key in settings)
                            settings[key] = loadedSettings[key];
                    }
                }
            },

            save: function () {
                localStorage[SETTINGS_KEY] = JSON.stringify(settings);
            },

            get antialias() {
                return settings.antialias;
            },

            set antialias(value) {
                settings.antialias = value;
            },

            get cameraFov() {
                return settings.cameraFov;
            },

            set cameraFov(value) {
                settings.cameraFov = value;
            },

            get cameraNear() {
                return settings.cameraNear;
            },

            set cameraNear(value) {
                settings.cameraNear = value;
            },

            get cameraFar() {
                return settings.cameraFar;
            },

            set cameraFar(value) {
                settings.cameraFar = value;
            },

            get showLightSphere() {
                return settings.showLightSphere;
            },

            set showLightSphere(value) {
                settings.showLightSphere = value;
            },

            get showWireframe() {
                return settings.showWireframe;
            },

            set showWireframe(value) {
                settings.showWireframe = value;
            },

            get wireframeOnly() {
                return settings.wireframeOnly;
            },

            set wireframeOnly(value) {
                settings.wireframeOnly = value;
            },

            get showCollisionModel() {
                return settings.showCollisionModel;
            },

            set showCollisionModel(value) {
                settings.showCollisionModel = value;
            },

            get ghostMode() {
                return settings.ghostMode;
            },

            set ghostMode(value) {
                if (settings.ghostMode !== value)
                    this.dispatchEvent({type: 'ghostModeChange', value: value});
                settings.ghostMode = value;
            },

            get renderBoundingBoxes() {
                return settings.renderBoundingBoxes;
            },

            set renderBoundingBoxes(value) {
                settings.renderBoundingBoxes = value;
            }
        }
    }();

    Object.assign(DT.Settings, THREE.EventDispatcher.prototype);
})(DOOM_THREE);

export const Settings = DOOM_THREE.Settings;
