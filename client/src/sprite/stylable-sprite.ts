import {Sprite, SpriteMaterial} from 'three';

import {isStylableMaterial, MaterialStyle} from '../material/stylable-material';

export class StylableSprite extends Sprite {
    constructor(material?: SpriteMaterial,
                readonly styles = new Map<string, MaterialStyle>(),
                readonly visibleOnStyle?: string[]) {
        super(material);
    }

    applyStyle(styleName: string) {
        if (isStylableMaterial(this.material)) {
            const style = this.styles.get(styleName);
            if (style) {
                this.material.applyStyle(style);
            }
        }
    }
}