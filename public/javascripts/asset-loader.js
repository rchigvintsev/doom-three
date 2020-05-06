import {Settings} from './settings.js';
import {Player} from './player/player.js';
import {Weapons} from './player/weapon/weapons.js';
import {MATERIALS} from './material/materials.js';
import {SOUNDS} from './audio/sounds.js';
import {Textures} from './util/textures.js';

const AssetType = {
    MAPS: 0,
    MODELS: 1,
    ANIMATIONS: 2,
    TEXTURES: 3,
    SHADERS: 4,
    SOUNDS: 5
};

export class AssetLoader {
    constructor() {
        this._assets = {};
        this._assets[AssetType.MAPS] = {};
        this._assets[AssetType.MODELS] = {};
        this._assets[AssetType.ANIMATIONS] = {};
        this._assets[AssetType.TEXTURES] = {};
        this._assets[AssetType.SHADERS] = {};
        this._assets[AssetType.SOUNDS] = {};

        this._textFileLoader = new THREE.FileLoader();
        this._binaryFileLoader = new THREE.FileLoader();
        this._binaryFileLoader.setResponseType('arraybuffer');
        this._soundLoader = new THREE.AudioLoader();
        this._animationLoader = new THREE.FileLoader();
        this._tgaLoader = new THREE.TGALoader();
    }

    load(mapName) {
        this._modelsToLoad = [];
        this._animationsToLoad = [];
        this._texturesToLoad = [];
        this._shadersToLoad = [];
        this._soundsToLoad = [];

        this._registerSoundsToLoad(Player.definition.sounds);

        Weapons.forEach((weaponClass) => {
            const weaponDef = weaponClass.definition;
            this._modelsToLoad.push(weaponDef.model);
            weaponDef.animations.forEach((animationName) => {
                if (this._animationsToLoad.indexOf(animationName) < 0)
                    this._animationsToLoad.push(animationName);
            });
            if (!Settings.wireframeOnly)
                weaponDef.materials.forEach((materialName) => {
                    this._registerTexturesToLoad(materialName);
                    this._registerShadersToLoad(materialName);
                });
            this._registerSoundsToLoad(weaponDef.sounds);
        });

        this._loadMapMeta(mapName);
    }

    loadTextures(materialDef) {
        const result = [];
        if (!materialDef)
            return result;
        const textureSources = this._createTextureSources(materialDef);
        for (let namedSources of textureSources) {
            const textures = {};
            result.push(textures);
            for (let key of Object.keys(namedSources))
                textures[key] = namedSources[key].load();
        }
        return result;
    }

    get assets() {
        return this._assets;
    }

    _loadMapMeta(mapName) {
        this._loadJson('maps/' + mapName + '.meta.json', (mapMeta) => {
            this._onLoadMapMeta(mapMeta);
        });
    }

    _onLoadMapMeta(mapMeta) {
        if (!Settings.wireframeOnly)
            mapMeta.materials.forEach((materialName) => {
                this._registerTexturesToLoad(materialName);
                this._registerShadersToLoad(materialName);
            });
        if (mapMeta.models)
            mapMeta.models.forEach((modelName) => {
                this._modelsToLoad.push(modelName);
            });
        if (mapMeta.animations)
            mapMeta.animations.forEach((animationName) => {
                this._animationsToLoad.push(animationName);
            });
        if (mapMeta.sounds)
            this._registerSoundsToLoad(mapMeta.sounds);
        this.assetsToLoad = this._getNumberOfAssetsToLoad();
        this.totalAssets = this.assetsToLoad;
        this._loadMap(mapMeta);
    }

    _loadMap(mapMeta) {
        this._loadJson('maps/' + mapMeta.name + '.json', (map) => {
            this._onLoadMap(mapMeta, map);
        });
    }

    _onLoadMap(mapMeta, map) {
        this._assets[AssetType.MAPS][mapMeta.name] = map;
        this.assetsToLoad--;
        this._notifySubscribers();
        this._loadModels();
        this._loadAnimations();
        this._loadTextures();
        this._loadShaders();
        this._loadSounds();
    }

    _registerTexturesToLoad(materialName) {
        const materialDef = MATERIALS[materialName];
        if (!materialDef) {
            console.error('Definition of material ' + materialName + ' is not found');
            return;
        }
        for (let namedSources of this._createTextureSources(materialDef))
            this._texturesToLoad = this._texturesToLoad.concat(Object.values(namedSources));
    }

    _registerShadersToLoad(materialName) {
        const material = MATERIALS[materialName];
        if (material && material.type === 'shader')
            this._shadersToLoad.push(materialName);
    }

    _registerSoundsToLoad(sounds) {
        Object.keys(sounds).forEach((key) => {
            const soundName = sounds[key];
            const soundDef = SOUNDS[soundName];
            if (soundDef) {
                for (let i = 0; i < soundDef.sources.length; i++) {
                    const soundSrc = soundDef.sources[i];
                    if (this._soundsToLoad.indexOf(soundSrc) < 0)
                        this._soundsToLoad.push(soundSrc);
                }
            } else
                console.error('Definition of sound "' + soundName + '" is not found');
        });
    }

    _createTextureSources(materialDefs) {
        const result = [];

        if (!Array.isArray(materialDefs))
            materialDefs = [materialDefs];

        for (let materialDef of materialDefs) {
            const namedSources = {};
            result.push(namedSources);

            if (materialDef.diffuseMap)
                namedSources.diffuseMap = new TextureSource(this, materialDef.diffuseMap);
            if (materialDef.specularMap)
                namedSources.specularMap = new TextureSource(this, materialDef.specularMap);
            if (materialDef.normalMap)
                namedSources.normalMap = new TextureSource(this, materialDef.normalMap);
            if (materialDef.bumpMap)
                namedSources.bumpMap = new TextureSource(this, materialDef.bumpMap);
            if (materialDef.alphaMap)
                namedSources.alphaMap = new TextureSource(this, materialDef.alphaMap);
            if (materialDef.additionalMap)
                namedSources.additionalMap = new TextureSource(this, materialDef.additionalMap);

            if (materialDef.cubeMap) {
                namedSources.cubeMap_right = new TextureSource(this, materialDef.cubeMap + '_right');
                namedSources.cubeMap_left = new TextureSource(this, materialDef.cubeMap + '_left');
                namedSources.cubeMap_up = new TextureSource(this, materialDef.cubeMap + '_up');
                namedSources.cubeMap_down = new TextureSource(this, materialDef.cubeMap + '_down');
                namedSources.cubeMap_forward = new TextureSource(this, materialDef.cubeMap + '_forward');
                namedSources.cubeMap_back = new TextureSource(this, materialDef.cubeMap + '_back');
            }

            if (materialDef.textures) {
                namedSources.textures = [];
                materialDef.textures.forEach((texture) => namedSources.textures.push(new TextureSource(this, texture)));
            }
        }

        return result;
    }

    _getNumberOfAssetsToLoad() {
        return this._modelsToLoad.length + this._animationsToLoad.length + this._texturesToLoad.length
            + this._shadersToLoad.length + this._soundsToLoad.length + 1 // + <map_name>.json;
    }

    _loadModels() {
        this._modelsToLoad.forEach((modelName) => {
            if (!this._assets[AssetType.MODELS][modelName]) {
                const fileLoader = modelName.toLowerCase().indexOf('.lwo') > 0
                    ? this._binaryFileLoader : this._textFileLoader;
                fileLoader.load(modelName, (model) => {
                    this._assets[AssetType.MODELS][modelName] = model;
                    this.assetsToLoad--;
                    this._notifySubscribers();
                });
            }
        });
    }

    _loadAnimations() {
        this._animationsToLoad.forEach((animationName) => {
            if (!this._assets[AssetType.ANIMATIONS][animationName])
                this._animationLoader.load(animationName, (animation) => {
                    this._assets[AssetType.ANIMATIONS][animationName] = animation;
                    this.assetsToLoad--;
                    this._notifySubscribers();
                });
        });
    }

    _loadTextures() {
        const callback = () => {
            this.assetsToLoad--;
            this._notifySubscribers();
        };
        for (let i = 0; i < this._texturesToLoad.length; i++) {
            const map = this._texturesToLoad[i];
            map.load(callback, callback)
        }
    }

    _loadShaders() {
        const checkLoadedCompletely = (shaderName) => {
            const shader = this._assets[AssetType.SHADERS][shaderName];
            if (shader.vertex && shader.fragment) {
                this.assetsToLoad--;
                this._notifySubscribers();
            }
        };
        this._shadersToLoad.forEach((shaderName) => {
            if (!this._assets[AssetType.SHADERS][shaderName]) {
                this._assets[AssetType.SHADERS][shaderName] = {};
                this._textFileLoader.load('shaders/' + shaderName + '_vertex.glsl', (shader) => {
                    this._assets[AssetType.SHADERS][shaderName].vertex = shader;
                    checkLoadedCompletely(shaderName);
                });
                this._textFileLoader.load('shaders/' + shaderName + '_fragment.glsl', (shader) => {
                    this._assets[AssetType.SHADERS][shaderName].fragment = shader;
                    checkLoadedCompletely(shaderName);
                });
            }
        });
    }

    _loadSounds() {
        this._soundsToLoad.forEach((soundSrc) => {
            if (!this._assets[AssetType.SOUNDS][soundSrc])
                this._soundLoader.load(soundSrc, (audioBuffer) => {
                    this._assets[AssetType.SOUNDS][soundSrc] = audioBuffer;
                    this.assetsToLoad--;
                    this._notifySubscribers();
                });
        });
    }

    _loadJson(url, onSuccess) {
        this._textFileLoader.load(url, (jsonString) => {
            onSuccess.call(this, JSON.parse(jsonString));
        });
    }

    _loadAllBinaryFiles(files, onLoad, onError) {
        const result = [];
        let counter = 0;
        for (let i = 0; i < files.length; i++)
            this._binaryFileLoader.load(files[i], (buffer) => {
                result[i] = buffer;
                if (++counter === files.length)
                    onLoad.apply(this, result);
            }, () => {}, onError);
    }

    _notifySubscribers() {
        const percentLoaded = (this.totalAssets - this.assetsToLoad) / this.totalAssets * 100;
        this.dispatchEvent({type: 'progress', percentLoaded: percentLoaded.toFixed()});
        if (this.assetsToLoad === 0)
            this.dispatchEvent({type: 'load'});
    }
}

AssetLoader.AssetType = Object.freeze(AssetType);

Object.assign(AssetLoader.prototype, THREE.EventDispatcher.prototype);

class TextureSource {
    constructor($this, textureDef) {
        this.$this = $this;
        this._name = typeof textureDef === 'string' ? textureDef : textureDef.name;
        this._addNormals = textureDef.addNormals;
        this._negate = textureDef.negate;
    }

    load(onLoad, onError) {
        const $this = this.$this;
        let texture = $this._assets[AssetLoader.AssetType.TEXTURES][this._name];
        if (texture) {
            if (onLoad) {
                onLoad(texture);
            }
        } else {
            if (this._addNormals) {
                texture = new THREE.Texture();
                const normalMap = this._addNormals.normalMap;
                const bumpMap = this._addNormals.bumpMap;
                const scale = this._addNormals.scale;
                $this._loadAllBinaryFiles([normalMap + '.tga', bumpMap + '.tga'], (normalMapBuf, bumpMapBuf) => {
                    texture.image = Textures.addNormals(normalMapBuf, bumpMapBuf, scale);
                    texture.needsUpdate = true;
                    if (onLoad) {
                        onLoad(texture);
                    }
                }, onError);
            } else if (this._negate) {
                texture = new THREE.Texture();
                $this._loadAllBinaryFiles([this._name + '.tga'], (mapBuf) => {
                    texture.image = Textures.negate(mapBuf);
                    texture.needsUpdate = true;
                    if (onLoad)
                        onLoad(texture);
                }, onError);
            } else {
                texture = $this._tgaLoader.load(this._name + '.tga', onLoad, () => {
                }, onError);
            }
            $this._assets[AssetLoader.AssetType.TEXTURES][this._name] = texture;
        }
        return texture;
    }
}
