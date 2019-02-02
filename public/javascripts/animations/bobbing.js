var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.Bobbing = function (target, height, speed) {
        DT.Animation.apply(this);
        this.target = target;
        this.originY = target.position.y;
        this.height = height * 0.042;
        this.speed = speed * 0.0015;
        this.bobbingAngle = 0;
    };

    DT.Bobbing.prototype = DT.inherit(DT.Animation, {
        constructor: DT.Bobbing,

        animate: function () {
            this.bobbingAngle += this.speed;
            this.target.position.y = this.originY + this.height * Math.sin(this.bobbingAngle);
        }
    });
})(DOOM_THREE);
