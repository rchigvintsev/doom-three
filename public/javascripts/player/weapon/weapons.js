import {Fists} from './fists.js';
import {Flashlight} from './flashlight.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.Weapons = Object.freeze([Fists, Flashlight]);
})(DOOM_THREE);

export const Weapons = DOOM_THREE.Weapons;
