/**
 * Class representing the player.
 * @extends Phaser.GameObjects.Sprite
 */
class Player extends Phaser.GameObjects.Sprite {

    /**
     * Create the player.
     * @param {object} scene - scene creating the player.
     * @param {number} x - Start location x value.
     * @param {number} y - Start location y value.
     * @param {number} [frame] -
     */
    constructor(scene, x, y, frame) {
        super(scene, x, y, frame);

        this.scene = scene;
        this.currentRoom = 1;       // Set start room so room change flag doens't fire.
        this.previousRoom = null;
        this.roomChange = false;
        this.canMove = true;

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.setTexture('player');
        this.setPosition(x, y);

        this.body.setCollideWorldBounds(true);
        this.body.setOffset(7, 16);
        this.body.setCircle(3);

        this.keys = scene.input.keyboard.addKeys('W,S,A,D,E,C,UP,LEFT,RIGHT,DOWN,SPACE');

        this.lastAnim = null;﻿
        this.vel = 200;
        this.onStairs = false;
        this.direction = 'down';

        config = {
            key: 'stand-down',
            frames: scene.anims.generateFrameNumbers('player', {start: 2, end: 2}),
            frameRate: 15,
            repeat: -1
        };
        scene.anims.create(config);

        config = {
            key: 'stand-right',
            frames: scene.anims.generateFrameNumbers('player', {start: 1, end: 1}),
            frameRate: 15,
            repeat: -1
        };
        scene.anims.create(config);

        config = {
            key: 'stand-up',
            frames: scene.anims.generateFrameNumbers('player', {start: 6, end: 6}),
            frameRate: 15,
            repeat: -1
        };
        scene.anims.create(config);


        var config = {
            key: 'walk-down',
            frames: scene.anims.generateFrameNumbers('player', {start: 2, end: 2}),
            frameRate: 15,
            repeat: -1
        };
        scene.anims.create(config);

        var config = {
            key: 'walk-right',
            frames: scene.anims.generateFrameNumbers('player', {start: 4, end: 3}),
            frameRate: 15,
            repeat: -1
        };
        scene.anims.create(config);

        var config = {
            key: 'walk-up',
            frames: scene.anims.generateFrameNumbers('player', {start: 6, end: 6}),
            frameRate: 15,
            repeat: -1
        };
        scene.anims.create(config);

    }

    /**
     * Called before Update.
     * @param {object} time
     * @param {number} delta
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // movement and animation
        this.body.setVelocity(0);
        let animationName = null;

        // standing
        let currentDirection = this.direction;
        if (this.direction === 'left') { currentDirection = 'right'; } //account for flipped sprite
        animationName ﻿= 'stand-' + currentDirection;

        // all the ways the player can move.
        let left  = this.keys.A.isDown || this.scene.gamepad && this.scene.gamepad.left;
        let right = this.keys.D.isDown || this.scene.gamepad && this.scene.gamepad.right;
        let up    = this.keys.W.isDown || this.scene.gamepad && this.scene.gamepad.up;
        let down  = this.keys.S.isDown || this.scene.gamepad && this.scene.gamepad.down;
        let bomb  = this.keys.E.isDown;
        let flash  = this.keys.C.isDown;
        let leftFire = this.keys.LEFT.isDown;
        let rightFire = this.keys.RIGHT.isDown;
        let upFire = this.keys.UP.isDown;
        let downFire = this.keys.DOWN.isDown;

        if (this.canMove) {
            // moving
            if (left) {
                this.direction = 'left';
                this.body.setVelocityX(-this.vel);
                animationName = "walk-right";
                this.setFlipX(true);
            } else if (right) {
                this.direction = 'right';
                this.body.setVelocityX(this.vel);
                animationName = "walk-right";
                this.setFlipX(false);
            }

            if (up) {
                this.direction = 'up';
                this.body.setVelocityY(-this.vel);
                animationName = 'walk-up';
            } else if (down) {
                this.direction = 'down';
                this.body.setVelocityY(this.vel);
                animationName = 'walk-down';
            }
            if (bomb) {
                this.scene.cameras.main.shake(2500, 0.001, true);
            }
            if (flash) {
                this.scene.cameras.main.flash(1000)
            }

            if (leftFire) {
                this.direction = 'left'
                animationName = "walk-right";
                this.setFlipX(true);
            }

            if (rightFire) {
                this.direction = 'right'
                animationName = "walk-right";
                this.setFlipX(false);
            }

            if (upFire) {
                this.direction = 'up'
                animationName = "walk-up";
            }

            if (downFire) {
                this.direction = 'left'
                animationName = "walk-down";
            }

            if(this.lastAnim !== animationName) {
                this.lastAnim = animationName;
                this.anims.play(animationName, true);
            }
        }

        // Stairs
        if (this.onStairs) {
            this.vel = 50;
            this.onStairs = false;
        } else {
            this.vel = 200;
        }

        // diagonal movement
        this.body.velocity.normalize().scale(this.vel);

        // Check for room change.
        this.getRoom();
    }

    /** Returns player's current and previous room, flags rooms player has entered. */
    getRoom() {

        // place holder for current room.
        let roomNumber;

        // loop through rooms in this level.
        for (let room in this.scene.rooms) {
            let roomLeft   = this.scene.rooms[room].x;
            let roomRight  = this.scene.rooms[room].x + this.scene.rooms[room].width;
            let roomTop    = this.scene.rooms[room].y;
            let roomBottom = this.scene.rooms[room].y + this.scene.rooms[room].height;

            // Player is within the boundaries of this room.
            if (this.x > roomLeft && this.x < roomRight &&
                this.y > roomTop  && this.y < roomBottom) {

                roomNumber = room;

                // Set this room as visited by player.
                let visited = this.scene.rooms[room].properties.find(function(property) {
                    return property.name === 'visited';
                } );

                visited.value = true
            }
        }

        // Update player room variables.
        if (roomNumber != this.currentRoom) {
            this.previousRoom = this.currentRoom;
            this.currentRoom = roomNumber;
            this.roomChange = true;
        } else {
            this.roomChange = false;
        }
    }
}
