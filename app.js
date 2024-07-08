let config = {
    type: Phaser.AUTO,
    width: 800,
    height:600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('road', 'assets/road.png');
    this.load.image('column', 'assets/column.png');
    this.load.spritesheet('bird', 'assets/bird.png', { frameWidth: 64, frameHeight: 96 });
}

let bird;
let hasLanded = false;
let cursors;
let hasBumped = false;
let isGameStarted = false;
let messageToPlayer;
let bg1, bg2;


function create() {
    bg1 = this.add.image(400, 300, 'background');
    bg2 = this.add.image(1200, 300,'background')

    const roads = this.physics.add.staticGroup();
    const topColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 }
    });
    const bottomColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300 },
    });
    const road = roads.create(400, 568, 'road').setScale(2).refreshBody();

    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);
    this.physics.add.collider(bird, road);

    this.physics.add.overlap(bird, road, () => hasLanded = true, null, this);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(bird, topColumns);
    this.physics.add.collider(bird, bottomColumns);

    this.physics.add.overlap(bird, topColumns, () => hasBumped = true, null, this);
    this.physics.add.overlap(bird, bottomColumns, () => hasBumped = true, null, this);

    messageToPlayer = this.add.text(0, 0, `Instructions: Press space bar to start`, { fontFamily: '"Comic Sans MS", Times, serif', fontSize: "20px", color: "white", backgroundColor: "black" });
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, this.add.zone(400, 300, 800, 600));

    let fullscreenButton = this.add.text(700, 20, 'Fullscreen', { fontFamily: 'Arial', fontSize: '20px', fill: '#ffffff' });
    fullscreenButton.setInteractive();
    fullscreenButton.on('pointerup', function () {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }, this);
}

function update() {

    if (cursors.up.isDown && !hasLanded && !hasBumped && isGameStarted) {
        bird.setVelocityY(-160);
    }

    if (!hasLanded && !hasBumped && isGameStarted) {
        bird.body.velocity.x = 50;
        bg1.x -= 2;
        bg2.x -=2;
        if (bg1.x < -400) {
            bg1.x = bg2.x + 750;
        }
        if (bg2.x < -400) {
            bg2.x = bg1.x + 750;
        }
    } else {
        bird.body.velocity.x = 0;
    }

    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
    }

    if (hasLanded || hasBumped) {
        bird.body.velocity.x = 0;
        messageToPlayer.text = `Oh no! You crashed!`;
    }

    if (bird.x > 750 && isGameStarted) {
        bird.body.velocity.x = 40;
        messageToPlayer.text = `Congrats! You won!`;
    }

    if (bird.x > 750) {
        bird.x = 0; // Wrap around to the left side
    }
}
