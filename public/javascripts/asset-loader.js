import {Settings} from './settings.js';
import {Player} from './player/player.js';
import {Weapons} from './player/weapon/weapons.js';
import {Materials} from './materials.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var AssetType = {
        MAPS: 0,
        MODELS: 1,
        ANIMATIONS: 2,
        TEXTURES: 3,
        SHADERS: 4,
        SOUNDS: 5
    };

    DT.AssetLoader = function (soundManager) {
        this._soundManager = soundManager;

        this.assets = {};
        this.assets[AssetType.MAPS] = {};
        this.assets[AssetType.MODELS] = {};
        this.assets[AssetType.ANIMATIONS] = {};
        this.assets[AssetType.TEXTURES] = {};
        this.assets[AssetType.SHADERS] = {};
        this.assets[AssetType.SOUNDS] = {};

        this.fileLoader = new THREE.FileLoader();
        this.soundLoader = new THREE.FileLoader();
        this.soundLoader.setResponseType('arraybuffer');
        this.tgaLoader = new THREE.TGALoader();
    };

    DT.AssetLoader.prototype = {
        load: function (mapName) {
            var scope = this;

            this.modelsToLoad = [];
            this.animationsToLoad = [];
            this.texturesToLoad = [];
            this.shadersToLoad = [];
            this.soundsToLoad = [];

            Object.keys(Player.definition.sounds).forEach(function (key) {
                var sounds = Player.definition.sounds[key];
                for (var i = 0; i < sounds.length; i++) {
                    if (scope.soundsToLoad.indexOf(sounds[i]) < 0)
                        scope.soundsToLoad.push(sounds[i]);
                }
            });

            Weapons.forEach(function (weaponClass) {
                var weaponDef = weaponClass.definition;

                scope.modelsToLoad.push(weaponDef.model.name);

                weaponDef.model.animations.forEach(function (animationName) {
                    if (scope.animationsToLoad.indexOf(animationName) < 0)
                        scope.animationsToLoad.push(animationName);
                });

                if (!Settings.wireframeOnly)
                    weaponDef.model.materials.forEach(function (materialName) {
                        scope.countTextures(materialName);
                        scope.countShaders(materialName);
                    });

                Object.keys(weaponDef.sounds).forEach(function (key) {
                    var sounds = weaponDef.sounds[key];
                    for (var i = 0; i < sounds.length; i++) {
                        if (scope.soundsToLoad.indexOf(sounds[i]) < 0)
                            scope.soundsToLoad.push(sounds[i]);
                    }
                });
            });

            this.loadMapMeta(mapName);
        },

        loadMapMeta: function (mapName) {
            this.loadJson('maps/' + mapName + '.meta.json', function (mapMeta) {
                this.onLoadMapMeta(mapMeta);
            });
        },

        onLoadMapMeta: function (mapMeta) {
            var scope = this;
            if (!Settings.wireframeOnly)
                mapMeta.materials.forEach(function (materialName) {
                    scope.countTextures(materialName);
                    scope.countShaders(materialName);
                });
            if (mapMeta.models)
                mapMeta.models.forEach(function (modelName) {
                    scope.modelsToLoad.push(modelName);
                });
            if (mapMeta.animations)
                mapMeta.animations.forEach(function (animationName) {
                    scope.animationsToLoad.push(animationName);
                });
            this.assetsToLoad = this.getNumberOfAssetsToLoad();
            this.totalAssets = this.assetsToLoad;
            this.loadMap(mapMeta);
        },

        loadMap: function (mapMeta) {
            this.loadJson('maps/' + mapMeta.name + '.json', function (map) {
                this.onLoadMap(mapMeta, map);
            });
        },

        onLoadMap: function (mapMeta, map) {
            this.assets[AssetType.MAPS][mapMeta.name] = map;
            this.assetsToLoad--;
            this.notifySubscribers();
            this.loadModels();
            this.loadAnimations();
            this.loadTextures();
            this.loadShaders();
            this.loadSounds();
        },

        loadModels: function () {
            var scope = this;
            this.modelsToLoad.forEach(function (modelName) {
                if (!scope.assets[AssetType.MODELS][modelName]) {
                    if (modelName.toLowerCase().indexOf('.lwo') > 0)
                        scope.fileLoader.setResponseType('arraybuffer');
                    else
                        scope.fileLoader.setResponseType('');
                    scope.fileLoader.load(modelName, function (model) {
                        scope.assets[AssetType.MODELS][modelName] = model;
                        scope.assetsToLoad--;
                        scope.notifySubscribers();
                    });
                }
            });
        },

        loadAnimations: function () {
            var scope = this;
            this.animationsToLoad.forEach(function (animationName) {
                if (!scope.assets[AssetType.ANIMATIONS][animationName])
                    scope.fileLoader.load(animationName, function (animation) {
                        scope.assets[AssetType.ANIMATIONS][animationName] = animation;
                        scope.assetsToLoad--;
                        scope.notifySubscribers();
                    });
            });
        },

        loadShaders: function () {
            var scope = this;
            function checkLoadedCompletely(shaderName) {
                var shader = scope.assets[AssetType.SHADERS][shaderName];
                if (shader.vertex && shader.fragment) {
                    scope.assetsToLoad--;
                    scope.notifySubscribers();
                }
            }

            this.shadersToLoad.forEach(function (shaderName) {
                if (!scope.assets[AssetType.SHADERS][shaderName]) {
                    scope.assets[AssetType.SHADERS][shaderName] = {};
                    scope.fileLoader.load('shaders/' + shaderName + '_vertex.glsl', function (shader) {
                        scope.assets[AssetType.SHADERS][shaderName].vertex = shader;
                        checkLoadedCompletely(shaderName);
                    });
                    scope.fileLoader.load('shaders/' + shaderName + '_fragment.glsl', function (shader) {
                        scope.assets[AssetType.SHADERS][shaderName].fragment = shader;
                        checkLoadedCompletely(shaderName);
                    });
                }
            });
        },

        loadSounds: function () {
            var scope = this;
            this.soundsToLoad.forEach(function (soundName) {
                if (!scope.assets[AssetType.SOUNDS][soundName])
                    scope.soundLoader.load(soundName, function (audioData) {
                        var sound = scope._soundManager.createSound(soundName, audioData);
                        scope.assets[AssetType.SOUNDS][soundName] = sound;
                        scope.assetsToLoad--;
                        scope.notifySubscribers();
                    });
            });
        },

        loadTextures: function () {
            var scope = this;
            this.texturesToLoad.forEach(function (textureName) {
                if (!scope.assets[AssetType.TEXTURES][textureName]) {
                    scope.tgaLoader.load(textureName + '.tga', function (texture) {
                        scope.assets[AssetType.TEXTURES][textureName] = texture;
                        scope.assetsToLoad--;
                        scope.notifySubscribers();
                    }, function () {
                        // Do nothing
                    }, function () {
                        scope.assetsToLoad--;
                        scope.notifySubscribers();
                    });
                }
            });
        },

        countTextures: function (materialName) {
            var scope = this;
            var material = Materials.definition[materialName];
            if (material) {
                if (material.diffuseMap) {
                    var diffuseMapName = typeof material.diffuseMap === 'string'
                        ? material.diffuseMap : material.diffuseMap.name;
                    if (this.texturesToLoad.indexOf(diffuseMapName) < 0)
                        this.texturesToLoad.push(diffuseMapName);
                }
                if (material.specularMap) {
                    var specularMapName = typeof material.specularMap === 'string'
                        ? material.specularMap : material.specularMap.name;
                    if (this.texturesToLoad.indexOf(specularMapName) < 0)
                        this.texturesToLoad.push(specularMapName);
                }
                if (material.normalMap) {
                    var normalMapName = typeof material.normalMap === 'string'
                        ? material.normalMap : material.normalMap.name;
                    if (this.texturesToLoad.indexOf(normalMapName) < 0)
                        this.texturesToLoad.push(normalMapName);
                }
                if (material.alphaMap && this.texturesToLoad.indexOf(material.alphaMap) < 0)
                    this.texturesToLoad.push(material.alphaMap);
                if (material.cubeMap) {
                    var rightMap = material.cubeMap + '_right';
                    if (this.texturesToLoad.indexOf(rightMap) < 0)
                        this.texturesToLoad.push(rightMap);
                    var leftMap = material.cubeMap + '_left';
                    if (this.texturesToLoad.indexOf(leftMap) < 0)
                        this.texturesToLoad.push(leftMap);
                    var upMap = material.cubeMap + '_up';
                    if (this.texturesToLoad.indexOf(upMap) < 0)
                        this.texturesToLoad.push(upMap);
                    var downMap = material.cubeMap + '_down';
                    if (this.texturesToLoad.indexOf(downMap) < 0)
                        this.texturesToLoad.push(downMap);
                    var forwardMap = material.cubeMap + '_forward';
                    if (this.texturesToLoad.indexOf(forwardMap) < 0)
                        this.texturesToLoad.push(forwardMap);
                    var backMap = material.cubeMap + '_back';
                    if (this.texturesToLoad.indexOf(backMap) < 0)
                        this.texturesToLoad.push(backMap);
                }
                if (material.textures)
                    material.textures.forEach(function (texture) {
                        var textureName = typeof texture === 'string' ? texture : texture.name;
                        if (scope.texturesToLoad.indexOf(textureName) < 0)
                            scope.texturesToLoad.push(textureName);
                    });
            } else
                console.error('Definition of material ' + materialName + ' is not found');
        },

        countShaders: function (materialName) {
            var material = Materials.definition[materialName];
            if (material && material.type === 'shader')
                this.shadersToLoad.push(materialName);
        },

        getNumberOfAssetsToLoad: function () {
            return this.modelsToLoad.length + this.animationsToLoad.length + this.texturesToLoad.length
                + this.shadersToLoad.length + this.soundsToLoad.length + 1 // + <map_name>.json;
        },

        loadJson: function (url, onSuccess) {
            var scope = this;
            this.fileLoader.load(url, function (jsonString) {
                onSuccess.call(scope, JSON.parse(jsonString));
            });
        },

        notifySubscribers: function () {
            var percentLoaded = (this.totalAssets - this.assetsToLoad) / this.totalAssets * 100;
            this.dispatchEvent({type: 'progress', percentLoaded: percentLoaded.toFixed()});
            if (this.assetsToLoad === 0)
                this.dispatchEvent({type: 'load'});
        }
    };

    DT.AssetLoader.AssetType = Object.freeze(AssetType);
    Object.assign(DT.AssetLoader.prototype, THREE.EventDispatcher.prototype);
})(DOOM_THREE);

export const AssetLoader = DOOM_THREE.AssetLoader;
