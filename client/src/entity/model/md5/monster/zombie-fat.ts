import {Monster} from './monster';
import {Md5ModelParameters} from '../md5-model';

export class ZombieFat extends Monster {
    constructor(parameters: Md5ModelParameters) {
        super(parameters);
    }

    protected doInit() {
        super.doInit();
        this.initAnimationFlows();
        this.startAnimationFlow('idle');
    }

    private initAnimationFlows() {
        this.addAnimationFlow('idle', this.animate('idle1').flow);
    }
}