import {SpriteMaterial, SpriteMaterialParameters, Texture} from 'three';

import {EvalFunction} from 'mathjs';

import {UpdatableMaterial, UpdatableMaterialExtraParameters, updateOpacity} from './updatable-material';
import {UpdatableTexture} from '../texture/updatable-texture';
import {MaterialStyle, StylableMaterial} from './stylable-material';
import {MaterialKind} from './material-kind';

export class UpdatableSpriteMaterial extends SpriteMaterial implements UpdatableMaterial, StylableMaterial {
    readonly kind: MaterialKind;
    readonly stylableMaterial = true;
    readonly updatableMaterial = true;

    evalScope: any;
    opacityExpression?: EvalFunction;

    constructor(parameters?: SpriteMaterialParameters, extraParameters?: UpdatableMaterialExtraParameters) {
        super(parameters);
        this.kind = extraParameters?.kind || MaterialKind.METAL;
        if (extraParameters && extraParameters.evalScope) {
            this.evalScope = {...extraParameters.evalScope, ...{time: 0}};
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
