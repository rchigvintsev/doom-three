var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var _contactNormal = new CANNON.Vec3();
    var _upAxis = new CANNON.Vec3(0, 1, 0);
    var _headPosition = new CANNON.Vec3();

    DT.PlayerBody = function (collisionModel) {
        this._collisionModel = collisionModel;
        this._body = collisionModel.bodies[0];
        this._headOffset = new CANNON.Vec3();
        for (var i = 0; i < this._body.shapes.length; i++) {
            var shape = this._body.shapes[i];
            if (shape.name === 'head')
                this._headOffset.copy(this._body.shapeOffsets[i]);
            else if (shape.name === 'bottom-body')
                this._height = shape.radius * 2;
        }
    };

    DT.PlayerBody.prototype = {
        constructor: DT.PlayerBody,

        get collisionModel() {
            return this._collisionModel;
        },

        get height() {
            return this._height;
        },

        get position() {
            return this._body.position;
        },

        set position(value) {
            this._body.position.copy(value);
        },

        get headPosition() {
            this._body.position.vadd(this._headOffset, _headPosition);
            return _headPosition;
        },

        get groundContacts() {
            var world = this._body.world;
            for (var i = 0; i < world.contacts.length; i++) {
                var contact = world.contacts[i];
                if (contact.bi.id === this._body.id || contact.bj.id === this._body.id) {
                    if (contact.bi.id === this._body.id)
                        contact.ni.negate(_contactNormal); // Flip contact normal
                    else
                        _contactNormal.copy(contact.ni); // Keep contact normal as it is
                    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat
                    // in the up direction.
                    if (_contactNormal.dot(_upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
                        return true;
                }
            }
            return false;
        },

        walk: function (velocity) {
            this._body.velocity.x = velocity.x;
            this._body.velocity.z = velocity.z;
        },

        jump: function (jumpSpeed) {
            this._body.velocity.y = jumpSpeed;
        },

        updatePlayerPosition: function (player) {
            player.position.copy(this.headPosition);
        },

        setPositionFromPlayer: function (player) {
            var newBodyPosition = player.position.clone().sub(this._headOffset);
            this._body.position.copy(newBodyPosition);
        }
    }
})(DOOM_THREE);

export const PlayerBody = DOOM_THREE.PlayerBody;
