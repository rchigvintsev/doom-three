import {Md5Model, Md5ModelParameters} from '../md5-model';

export abstract class Monster extends Md5Model {
    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }
}
