import {AbstractMeshFactory} from './abstract-mesh-factory.js';
import {GUIMaterialBuilder} from '../material/gui-material-builder.js';
import {Malfunction2Gui} from '../gui/malfunction2-gui.js';
import {EnterSite3Gui} from '../gui/enter-site3-gui.js';

export class GUIFactory extends AbstractMeshFactory {
    constructor(assets) {
        super(new GUIMaterialBuilder(assets));
    }

    createGui(guiClass, parentGeometry, index) {
        if (guiClass === 'malfunction2')
            return new Malfunction2Gui(parentGeometry, index, this._materialBuilder);
        if (guiClass === 'enter_site3')
            return new EnterSite3Gui(parentGeometry, index, this._materialBuilder);
        throw 'Unsupported GUI class: ' + guiClass;
    }
}
