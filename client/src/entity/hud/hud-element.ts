import {Sprite, SpriteMaterial} from 'three';

import {isStylableMaterial, MaterialStyle} from '../../material/stylable-material';
import {ScreenPosition} from '../../util/screen-position';

export class HudElement extends Sprite {
    constructor(private readonly parameters: HudElementParameters) {
        super(parameters.material);
    }

    updatePosition() {
        let x = 0, y = 0;
        const origin = this.parameters.screenPosition;
        if (origin.right) {
            x = window.innerWidth / 2 - origin.right;
        }
        if (origin.bottom) {
            y = (window.innerHeight / 2 - origin.bottom) * -1;
        }
        this.position.set(x, y, 0);
    }

    applyStyle(styleName: string) {
        if (this.parameters.styles && isStylableMaterial(this.material)) {
            const style = this.parameters.styles.get(styleName);
            if (style) {
                this.material.applyStyle(style);
            }
        }
    }

    get visibleOnStyle(): string[] | undefined {
        return this.parameters.visibleOnStyle;
    }
}

export interface HudElementParameters {
    material?: SpriteMaterial,
    screenPosition: ScreenPosition;
    styles?: Map<string, MaterialStyle>;
    visibleOnStyle?: string[];
}
