import {Settings} from './settings.js';
import {Player} from './player/player.js';
import {Weapons} from './player/weapon/weapons.js';
import {MATERIALS} from './material/materials.js';
import {SOUNDS} from './audio/sounds.js';
import {Images} from './util/images.js';
import {TGALoader} from './loader/tga-loader.js';

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
        this._tgaLoader = new TGALoader();
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
        if (!materialDef) {
            return;
        }
        const textureSources = this._createTextureSources(materialDef);
        for (let textureSrc of textureSources) {
            textureSrc.load();
        }
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
        this._texturesToLoad = this._texturesToLoad.concat(this._createTextureSources(materialDef));
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
            } else {
                console.error('Definition of sound "' + soundName + '" is not found');
            }
        });
    }

    _createTextureSources(materialDefs) {
        const result = [];

        if (!Array.isArray(materialDefs)) {
            materialDefs = [materialDefs];
        }

        for (let materialDef of materialDefs) {
            let mapDefs = [
                materialDef.diffuseMap,
                materialDef.specularMap,
                materialDef.normalMap,
                materialDef.bumpMap,
                materialDef.alphaMap,
                materialDef.additionalMap
            ];
            if (materialDef.textures) {
                mapDefs = mapDefs.concat(materialDef.textures);
            }

            for (const mapDef of mapDefs) {
                if (!mapDef) {
                    continue;
                }
                const textureNames = this._getTextureNames(mapDef);
                for (const textureName of textureNames) {
                    result.push(new TextureSource(this, textureName, mapDef.addNormals, mapDef.negate, mapDef.flip));
                }
            }

            if (materialDef.cubeMap) {
                result.push(new TextureSource(this, materialDef.cubeMap + '_right'));
                result.push(new TextureSource(this, materialDef.cubeMap + '_left'));
                result.push(new TextureSource(this, materialDef.cubeMap + '_up'));
                result.push(new TextureSource(this, materialDef.cubeMap + '_down'));
                result.push(new TextureSource(this, materialDef.cubeMap + '_forward'));
                result.push(new TextureSource(this, materialDef.cubeMap + '_back'));
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
            }, () => {
            }, onError);
    }

    _notifySubscribers() {
        const percentLoaded = (this.totalAssets - this.assetsToLoad) / this.totalAssets * 100;
        this.dispatchEvent({type: 'progress', percentLoaded: percentLoaded.toFixed()});
        if (this.assetsToLoad === 0)
            this.dispatchEvent({type: 'load'});
    }

    _getTextureNames(mapDef) {
        if (typeof mapDef === 'string') {
            return [mapDef];
        }
        if (typeof mapDef.name === 'string') {
            return [mapDef.name];
        }
        let textureNames = [];
        for (const paramName of Object.keys(mapDef.name)) {
            const paramOptions = mapDef.name[paramName];
            textureNames = textureNames.concat(Object.values(paramOptions));
        }
        return textureNames;
    }
}

AssetLoader.AssetType = Object.freeze(AssetType);

Object.assign(AssetLoader.prototype, THREE.EventDispatcher.prototype);

class TextureSource {
    constructor($this, textureName, addNormals = null, negate = false, flip = false) {
        this.$this = $this;
        this._name = textureName;
        this._addNormals = addNormals;
        this._negate = negate;
        this._flip = flip;
    }

    load(onLoad, onError) {
        const texture = new THREE.Texture();
        const image = this.$this._assets[AssetLoader.AssetType.TEXTURES][this._name];
        if (image instanceof Promise) {
            image.then(img => {
                texture.image = img;
                texture.needsUpdate = true;
                if (onLoad) {
                    onLoad(img);
                }
            }).catch(reason => {
                if (onError) {
                    onError(reason);
                }
            })
        } if (image) {
            if (onLoad) {
                onLoad(image);
            }
        } else {
            this.$this._assets[AssetLoader.AssetType.TEXTURES][this._name] = new Promise((resolve, reject) => {
                const afterLoad = (img) => {
                    this.$this._assets[AssetLoader.AssetType.TEXTURES][this._name] = img;
                    texture.image = img;
                    texture.needsUpdate = true;
                    resolve(img);
                    if (onLoad) {
                        onLoad(img);
                    }
                };
                const handleError = (error) => {
                    reject(error);
                    if (onError) {
                        onError(error);
                    }
                };

                if (this._addNormals) {
                    const normalMap = this._addNormals.normalMap;
                    const bumpMap = this._addNormals.bumpMap;
                    const scale = this._addNormals.scale;

                    this.$this._loadAllBinaryFiles([normalMap + '.tga', bumpMap + '.tga'], (normalMapBuf, bumpMapBuf) => {
                        const img = Images.addNormals(normalMapBuf, bumpMapBuf, scale);
                        afterLoad(img);
                    }, handleError);
                } else if (this._negate) {
                    this.$this._loadAllBinaryFiles([this._name + '.tga'], (mapBuf) => {
                        const img = Images.negate(mapBuf);
                        afterLoad(img)
                    }, handleError);
                } else {
                    this.$this._tgaLoader.load(this._name + '.tga', (tga) => {
                        if (this._flip) {
                            const canvas = tga.image;
                            const context = canvas.getContext('2d');
                            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            Images.flip(imageData);
                            context.putImageData(imageData, 0, 0);
                        }
                        afterLoad(tga.image);
                    }, () => {
                    }, handleError);
                }
            });
        }
        return texture;
    }
}
