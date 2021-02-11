/**
 * Class representing a level (https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)
 * @extends Phaser.Scene
 */
// import {LaserGroup, Laser} from './Laser'
class Level extends Phaser.Scene {

    /** Create the level. */
    constructor() {
        super({key: 'level'});
        this.hearts;
    }

    /** Load assets. */
    preload() {

        // Player sprite.
        this.load.spritesheet({
            key: 'player',
            url: "game/assets/lilrem.png",
            frameConfig: {frameWidth: 83,  //The width of the frame in pixels.
                          frameHeight: 69, //The height of the frame in pixels. Uses the frameWidth value if not provided.
                          startFrame: 2,   //The first frame to start parsing from.
                          endFrame: 7,    //The frame to stop parsing at. If not provided it will calculate the value based on the image and frame dimensions.
                          margin: 0,       //The margin in the image. This is the space around the edge of the frames.
                          spacing: 0}      //The spacing between each frame in the image.
        });

        // Level tiles and data.
        this.load.image("tiles", "game/assets/dungeon_tiles_2.png");
        this.load.tilemapTiledJSON("level-1", "game/assets/level-1.json");
        // this.load.audio('intro', 'game/assets/dreamy.mp3')
        this.load.image('heart', 'game/assets/heart.png');

    }

    /** Setup level. */
    create() {
        // Make map of level 1.
        this.map = this.make.tilemap({key: "level-1"});

        // Define tiles used in map.
        const tileset = this.map.addTilesetImage("dungeon_tiles_2",  "tiles", 16, 16);

        // The map layers.
        this.floorLayer = this.map.createStaticLayer("floor",        tileset);
        this.wallsLayer = this.map.createStaticLayer("walls",        tileset);
        this.aboveLayer = this.map.createStaticLayer("above_player", tileset);

        // Set physics boundaries from map width and height.
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Collisions based on layer.
        this.wallsLayer.setCollisionByProperty({collides: true});

        // Set the above player layer higher than everything else.
        this.aboveLayer.setDepth(10);

        // Setup things in this level.
        this.rooms = [];
        this.stairs = this.physics.add.group();

        // Loop through all the objects.
        this.map.findObject('Objects', function(object) {

            // rooms
            if (object.type === 'Room') {
                this.rooms.push(object);
            }

            // stairs
            if (object.name === 'Stairs') {
                this.stairs.add(new Phaser.GameObjects.Sprite(this, object.x, object.y));
            }

            // spawn points
            if (object.type === 'Spawn') {
                if (object.name === 'Player') {
                    this.player = new Player(this, object.x, object.y);
                }
            }

        }, this);

        // Heart stuff
        this.cursors = this.input.keyboard.createCursorKeys()
        this.hearts = new Hearts(this);
        this.input.on('pointerdown', (pointer) => {
        this.hearts.fireHeartUp(this.player.x, this.player.y);
      });

        // Add collisions.
        this.physics.add.collider(this.player,  this.wallsLayer);
        this.physics.add.overlap(this.player,   this.stairs,     function() {
            this.player.onStairs = true;
        }, null, this);
        this.physics.add.collider(this.hearts,  this.wallsLayer);

        // this.physics.add.overlap(this.hearts, this.wallsLayer, this.hit, null, this);

        // start camera
        this.cameras.main.setZoom(1.0);

        // Set first room boundaries.
        this.cameras.main.setBounds(this.rooms[this.player.currentRoom].x,
                                    this.rooms[this.player.currentRoom].y,
                                    this.rooms[this.player.currentRoom].width,
                                    this.rooms[this.player.currentRoom].height,
                                    true);

        this.cameras.main.startFollow(this.player);

        this.cameras.main.fadeIn(2000, 0, 0, 0);

        // Listener for gamepad detection.
        this.input.gamepad.once('down', function (pad, button, index) {
            this.gamepad = pad;
        }, this);

        // let sfx = this.sound.add('intro');
        // sfx.play()
    }

    update(time, delta) {

        this.cameras.main._ch = this.map.heightInPixels;
        this.cameras.main._cw = this.map.widthInPixels;

        // On player room change, stop player movement, fade camera, and set boundaries.
        if (this.player.roomChange) {

            this.cameras.main.fadeOut(250, 0, 0, 0, function(camera, progress) {
                this.player.canMove = false;
                if (progress === 1) {
                    // Change camera boundaries when fade out complete.
                    this.cameras.main.setBounds(this.rooms[this.player.currentRoom].x,
                                                this.rooms[this.player.currentRoom].y,
                                                this.rooms[this.player.currentRoom].width,
                                                this.rooms[this.player.currentRoom].height,
                                                true);

                    // Fade back in with new boundareis.
                    this.cameras.main.fadeIn(500, 0, 0, 0, function(camera, progress) {
                        if (progress === 1) {
                            this.player.canMove = true;
                            this.roomStart(this.player.currentRoom);
                        }
                    }, this);
                }
            }, this);
        }
        if (this.cursors.right.isDown) {
            this.hearts.fireHeartRight(this.player.x + 35, this.player.y);
    
          }
          if (this.cursors.left.isDown) {
            this.hearts.fireHeartLeft(this.player.x - 35, this.player.y);
    
          }
          if (this.cursors.up.isDown) {
            this.hearts.fireHeartUp(this.player.x, this.player.y - 45);
          }
          if (this.cursors.down.isDown) {
            this.hearts.fireHeartDown(this.player.x, this.player.y + 40);
    
          }
    }

    roomStart(roomNumber) {
        if (roomNumber == 4) {
            this.cameras.main.shake(2500, 0.001, true);
        }
    }
}

class Heart extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'heart');
    }
    hitWall(hearts, wall) {
        hearts.kill();
    }

    fireUp (x, y)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-100);
    }
    fireDown (x, y)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(100);
    }
    fireLeft (x, y)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(-100);
    }
    fireRight (x, y)
    {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(+100);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Hearts extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 500,
            key: 'heart',
            active: false,
            visible: false,
            classType: Heart
        });
    }

    fireHeartUp (x, y)
    {
        let heart = this.getFirstDead(false);

        if (heart)
        {
            heart.fireUp(x, y);
        }
    }
    fireHeartDown (x, y)
    {
        let heart = this.getFirstDead(false);

        if (heart)
        {
            heart.fireDown(x, y);
        }
    }
    fireHeartLeft (x, y)
    {
        let heart = this.getFirstDead(false);

        if (heart)
        {
            heart.fireLeft(x, y);
        }
    }
    fireHeartRight (x, y)
    {
        let heart = this.getFirstDead(false);

        if (heart)
        {
            heart.fireRight(x, y);
        }
    }
}