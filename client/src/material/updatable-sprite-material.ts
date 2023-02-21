import {SpriteMaterial, SpriteMaterialParameters, Texture} from 'three';
import {UpdatableMaterial, updateOpacity} from './updatable-material';
import {EvalFunction} from 'mathjs';
import {UpdatableTexture} from '../texture/updatable-texture';
import {MaterialStyle, StylableMaterial} from './stylable-material';
import {MaterialKind} from './material-kind';
import {Objects} from '../util/objects';

export class UpdatableSpriteMaterial extends SpriteMaterial implements UpdatableMaterial, StylableMaterial {
    readonly kind: MaterialKind;
    readonly stylableMaterial = true;
    readonly updatableMaterial = true;

    evalScope: any;
    opacityExpression?: EvalFunction;

    constructor(parameters?: UpdatableSpriteMaterialParameters) {
        super(Objects.narrowToParent(parameters));
        this.kind = parameters?.kind || MaterialKind.METAL;
        if (parameters && parameters.evalScope) {
            this.evalScope = {...parameters.evalScope, ...{time: 0}};
        } else {
            this.evalScope = {time: 0};
        }
    }

    setParameters(params: Map<string, any>) {
        this.forEachMap(map => (<UpdatableTexture>map).setParameters(params), map => map instanceof UpdatableTexture);
    }

    update(deltaTime = 0) {
        if (this.visible) {
            this.updateMaps(deltaTime);
            updateOpacity(this);
        }
    }

    applyStyle(style: MaterialStyle) {
        this.color.copy(style.color);
    }

    private updateMaps(deltaTime: number) {
        this.forEachMap(map => (<UpdatableTexture>map).update(deltaTime), map => map instanceof UpdatableTexture);
    }

    private forEachMap(callbackFn: (map: Texture) => void, filterFn: (map: Texture) => boolean = () => true) {
        if (this.map && filterFn(this.map)) {
            callbackFn(this.map);
        }
        if (this.alphaMap && this.alphaMap !== this.map && filterFn(this.alphaMap)) {
            callbackFn(this.alphaMap);
        }
    }
}

export interface UpdatableSpriteMaterialParameters extends SpriteMaterialParameters {
    kind: MaterialKind;
    evalScope?: any;
}