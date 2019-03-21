var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.FeatureDetector = {
        run: function (callback) {
            var canvas = document.createElement('canvas');
            if (typeof canvas.getContext === 'undefined') {
                this.displayErrorMessage('HTML5 Canvas');
                return;
            }

            let webGl = false;
            try {
                const canvas = document.createElement('canvas');
                webGl = !!(window.WebGLRenderingContext
                    && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (ignored) {
            }
            if (!webGl) {
                this.displayErrorMessage('WebGL or WebGL failed to initialize');
                return;
            }

            if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
                this.displayErrorMessage('Web Audio API');
                return;
            }

            if (!('pointerLockElement' in document) && !('mozPointerLockElement' in document) &&
                !('webkitPointerLockElement' in document)) {
                this.displayErrorMessage('Pointer Lock API');
                return;
            }

            var localStorage = false;
            try {
                localStorage = 'localStorage' in window && window.localStorage !== null;
            } catch (ignored) {
            }
            if (!localStorage) {
                this.displayErrorMessage('HTML5 Local Storage');
                return;
            }

            callback();
        },

        displayErrorMessage: function (feature) {
            var $div = $(document.createElement('div'));
            $div.addClass('message');

            var span = document.createElement('span');
            span.innerHTML = 'Your browser does not support<br/>' + feature + '.';

            $div.append(span);

            document.body.appendChild($div[0]);
        }
    };
})(DOOM_THREE);

export const FeatureDetector = DOOM_THREE.FeatureDetector;
