import {Sprite, SpriteMaterial} from 'three';

export class SpriteChar extends Sprite {
    constructor(readonly char: string, material?: SpriteMaterial) {
        super(material);
    }

    clone(withGeometry?: boolean, recursive?: boolean): this {
        const clone = super.clone(recursive);
        (<any>clone).char = this.char;
        clone.material = this.material.clone();
        if (withGeometry) {
            clone.geometry = this.geometry.clone();
        }
        return clone;
    }
}