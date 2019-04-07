const SETTINGS_KEY = 'doom-three-settings';

const settings = {
    antialias: false,
    cameraFov: 75,
    cameraNear: 0.01,
    cameraFar: 1000,
    showLightSpheres: false,
    showWireframe: false,
    wireframeOnly: false,
    showCollisionModel: false,
    ghostMode: false,
    renderBoundingBoxes: false
};

export class Settings {
    static load() {
        const settingsJson = localStorage[SETTINGS_KEY];
        if (settingsJson !== undefined) {
            const loadedSettings = JSON.parse(settingsJson);
            for (let key in loadedSettings) {
                if (loadedSettings.hasOwnProperty(key) && key in settings)
                    settings[key] = loadedSettings[key];
            }
        }
    }

    static save() {
        localStorage[SETTINGS_KEY] = JSON.stringify(settings);
    }

    static get antialias() {
        return settings.antialias;
    }

    static set antialias(value) {
        settings.antialias = value;
    }

    static get cameraFov() {
        return settings.cameraFov;
    }

    static set cameraFov(value) {
        settings.cameraFov = value;
    }

    static get cameraNear() {
        return settings.cameraNear;
    }

    static set cameraNear(value) {
        settings.cameraNear = value;
    }

    static get cameraFar() {
        return settings.cameraFar;
    }

    static set cameraFar(value) {
        settings.cameraFar = value;
    }

    static get showLightSpheres() {
        return settings.showLightSpheres;
    }

    static set showLightSpheres(value) {
        settings.showLightSpheres = value;
    }

    static get showWireframe() {
        return settings.showWireframe;
    }

    static set showWireframe(value) {
        settings.showWireframe = value;
    }

    static get wireframeOnly() {
        return settings.wireframeOnly;
    }

    static set wireframeOnly(value) {
        settings.wireframeOnly = value;
    }

    static get showCollisionModel() {
        return settings.showCollisionModel;
    }

    static set showCollisionModel(value) {
        settings.showCollisionModel = value;
    }

    static get ghostMode() {
        return settings.ghostMode;
    }

    static set ghostMode(value) {
        if (settings.ghostMode !== value)
            this.dispatchEvent({type: 'ghostModeChange', value: value});
        settings.ghostMode = value;
    }

    static get renderBoundingBoxes() {
        return settings.renderBoundingBoxes;
    }

    static set renderBoundingBoxes(value) {
        settings.renderBoundingBoxes = value;
    }
}

Object.assign(Settings, THREE.EventDispatcher.prototype);