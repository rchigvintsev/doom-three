import WebGL from 'three/examples/jsm/capabilities/WebGL';

import {Game} from './game';

if (WebGL.isWebGLAvailable()) {
    Game.load('test');
} else {
    showErrorMessage(WebGL.getWebGLErrorMessage());
}

function showErrorMessage(messageElement: HTMLElement) {
    const containerElement = document.getElementById('message_container');
    if (!containerElement) {
        throw new Error('Failed to show error message: message container element is not found in DOM');
    }
    containerElement.appendChild(messageElement);
    containerElement.classList.remove('hidden');
}
