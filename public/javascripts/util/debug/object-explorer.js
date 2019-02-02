var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var VISUAL_DEBUG_ENABLED = true;

    DT.ObjectExplorer = function (scene, vMode) {
        this.enabled = VISUAL_DEBUG_ENABLED && vMode === DT.VisualizationMode.NORMAL;

        if (this.enabled) {
            this.raycaster = new THREE.Raycaster();
            this.intersected = null;

            this.canvasWidth = 1024;
            this.canvasHeight = 512;

            this.fontSize = 15;
            this.padding = 15;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'object_explorer_canvas';
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;

            this.context = this.canvas.getContext('2d');
            this.context.font = this.fontSize + "px 'Lucida Console', Monaco, monospace";
            this.context.textAlign = 'center';
            this.context.textBaseline = 'top';

            this.texture = new THREE.Texture(this.canvas);
            var spriteMaterial = new THREE.SpriteMaterial({map: this.texture});

            this.tooltip = new THREE.Sprite(spriteMaterial);
            this.tooltip.scale.set(this.canvasWidth, this.canvasHeight, 1);
            scene.add(this.tooltip);
        }
    };

    DT.ObjectExplorer.prototype = {
        constructor: DT.ObjectExplorer,

        update: function (camera, scene) {
            if (!this.enabled)
                return;

            var self = this;

            this.raycaster.setFromCamera({x: 0, y: 0}, camera);
            var intersects = this.raycaster.intersectObjects(scene.children);
            if (intersects.length > 0) {
                if (this.intersected != intersects[0].object) {
                    this.intersected = intersects[0].object;
                    if (intersects[0].object.info) {
                        this.clear();
                        
                        var info = intersects[0].object.info;

                        var lines = [
                            'Model: ' + info.model,
                            'Surface: ' + info.surface,
                            'Material: ' + info.material
                        ];

                        var metrics = [], rectWidth = 0;

                        lines.forEach(function (line) {
                            var m = self.context.measureText(line);
                            if (m.width > rectWidth)
                                rectWidth = m.width;
                            metrics.push(m);
                        });
                        
                        var offsetX = (this.canvasWidth - rectWidth - this.padding * 2) / 2;
                        var offsetY = (this.canvasHeight - this.fontSize * lines.length - this.padding * 2) / 2;

                        this.context.fillStyle = 'rgba(48, 10, 36, 0.90)';
                        this.context.fillRect(offsetX, offsetY, rectWidth + this.padding * 2,
                            this.fontSize * lines.length + this.padding * 2);

                        this.context.fillStyle = "#ffffff";

                        lines.forEach(function (line, i) {
                            self.context.fillText(line, self.canvasWidth / 2, offsetY + self.padding + self.fontSize * i);
                        });

                        this.texture.needsUpdate = true;
                    } else {
                        this.clear();
                        this.texture.needsUpdate = true;
                    }
                }
            } else {
                this.clear();
                this.intersected = null;
                this.texture.needsUpdate = true;
            }
        },

        clear: function () {
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
    };
})(DOOM_THREE);
