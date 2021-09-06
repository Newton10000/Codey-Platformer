class Level extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.levelKey = key
    this.nextLevel = {
      'Level1': 'Level2',
      'Level2': 'Level3',
      'Level3': 'Level4',
      'Level4': 'Level5',
      'Level5': 'Level6',
      'Level6': 'Credits',
    }
  }

  preload() {
    //phaser.io assets
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('bubble', 'https://labs.phaser.io/assets/particles/bubble.png');

    this.load.image('platform', 'https://examples.phaser.io/assets/sprites/bluemetal_32x32x4.png');

    this.load.spritesheet('diamond', 'https://examples.phaser.io/assets/sprites/diamonds32x5.png',
      { frameWidth: 64, frameHeight: 64});

    this.load.spritesheet('codey', 'https://content.codecademy.com/courses/learn-phaser/Codey%20Tundra/codey.png', { frameWidth: 72, frameHeight: 90})

    //replace codey test

    //frame width & height must equal width of each individual sprite. Otherwise game will crash

    this.load.image('bg1', 'https://content.codecademy.com/courses/learn-phaser/Codey%20Tundra/mountain.png');
    this.load.image('bg2', 'https://content.codecademy.com/courses/learn-phaser/Codey%20Tundra/trees.png');
    this.load.image('bg3', 'https://content.codecademy.com/courses/learn-phaser/Codey%20Tundra/snowdunes.png');
  }

  create() {
    gameState.active = true

    gameState.bgColor = this.add.rectangle(0, 0, config.width, config.height, 0x00ffbb).setOrigin(0, 0);
    this.createStars();
    this.createParallaxBackgrounds();

    gameState.player = this.physics.add.sprite(125, 110, 'codey').setScale(.5);
    gameState.platforms = this.physics.add.staticGroup();

    this.createAnimations();

    this.createBubbles();

    this.levelSetup();

    //personal edit
    this.cameras.main.setBounds(0, 0, 2000, 1000);
    this.physics.world.setBounds(0, 0, 2000, 1000 + gameState.player.height);
    //end personal edit

    this.cameras.main.startFollow(gameState.player, true, 0.5, 0.5)
    gameState.player.setCollideWorldBounds(true);

    this.physics.add.collider(gameState.player, gameState.platforms);
    this.physics.add.collider(gameState.goal, gameState.platforms);

    gameState.cursors = this.input.keyboard.createCursorKeys();

  }

  createPlatform(xIndex, yIndex) {
    // Creates a platform evenly spaced along the two indices.
    // If either is not a number it won't make a platform
      if (typeof yIndex === 'number' && typeof xIndex === 'number') {
        gameState.platforms.create((250 * xIndex),  yIndex * 70, 'platform').setOrigin(0, 0.5).refreshBody();
      }
  }

//particle storm
  createBubbles() {
    gameState.particles = this.add.particles('bubble');

    gameState.emitter = gameState.particles.createEmitter({
      x: {min: 0, max: config.width * 2 },
      y: -5,
      lifespan: 2000,
      speedX: { min:-5, max: -200 },
      speedY: { min: 200, max: 400 },
      scale: { start: 0.6, end: 0 },
      quantity: 10,
      blendMode: 'ADD'
    })

    gameState.emitter.setScrollFactor(0);
  }


  createAnimations() {
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('codey', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('codey', { start: 0, end: 1 }),
      frameRate: 0,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('codey', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'fire',
      frames: this.anims.generateFrameNumbers('diamond', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1
    })
  }

  createParallaxBackgrounds() {
    gameState.bg1 = this.add.image(0, 0, 'bg1');
    gameState.bg2 = this.add.image(0, 0, 'bg2');
    gameState.bg3 = this.add.image(0, 400, 'bg3');

    gameState.bg1.setOrigin(0, 0);
    gameState.bg2.setOrigin(0, 0);
    gameState.bg3.setOrigin(0, 0);


    const game_width = parseFloat(gameState.bg3.getBounds().width)
    gameState.width = game_width;
    const window_width = config.width

    const bg1_width = gameState.bg1.getBounds().width
    const bg2_width = gameState.bg2.getBounds().width
    const bg3_width = gameState.bg3.getBounds().width

    gameState.bgColor .setScrollFactor(0);
    gameState.bg1.setScrollFactor((bg1_width - window_width) / (game_width - window_width));
    gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width));
  }

  levelSetup() {
    for (const [xIndex, yIndex] of this.heights.entries()) {
      this.createPlatform(xIndex, yIndex);
    }

    // Create the diamond at the end of the level
    /*
    gameState.goal = this.physics.add.sprite(gameState.width - 40, 100, 'diamond');
    */
    gameState.goal = this.physics.add.sprite(1850, 100, 'diamond');
    this.physics.add.overlap(gameState.player, gameState.goal, function() {
      this.cameras.main.fade(200, 0, 0, 0, false, function(camera, progress) {
        if (progress > .9) {
          this.scene.stop(this.levelKey);
          this.scene.start(this.nextLevel[this.levelKey]);
        }
      });
    }, null, this);

    this.setWeather(this.weather);
  }

  update() {
    if(gameState.active){
      gameState.goal.anims.play('fire', true);
      if (gameState.cursors.right.isDown) {
        gameState.player.flipX = false;
        gameState.player.setVelocityX(gameState.speed);
        gameState.player.anims.play('run', true);
      } else if (gameState.cursors.left.isDown) {
        gameState.player.flipX = true;
        gameState.player.setVelocityX(-gameState.speed);
        gameState.player.anims.play('run', true);
      } else {
        gameState.player.setVelocityX(0);
        gameState.player.anims.play('idle', true);
      }

      if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && gameState.player.body.touching.down) {
        gameState.player.anims.play('jump', true);
        gameState.player.setVelocityY(-800);
      }

      if (!gameState.player.body.touching.down){
        gameState.player.anims.play('jump', true);
      }

      if (gameState.player.y > 1000) {
        this.cameras.main.shake(240, .01, false, function(camera, progress) {
          if (progress > .9) {
            this.scene.restart(this.levelKey);
          }
        });
      }
    }
  }
  createStars() {
    gameState.stars = [];
    function getStarPoints() {
      const color = 0xffffff;
      return {
        x: Math.floor(Math.random() * 2000),
        y: Math.floor(Math.random() * config.height * .8),
        radius: Math.floor(Math.random() * 3),
        color,
      }
    }
    for (let i = 0; i < 200; i++) {
      const { x, y, radius, color} = getStarPoints();
      const star = this.add.circle(x, y, radius, color)
      star.setScrollFactor(Math.random() * .1);
      gameState.stars.push(star)
    }
  }

  setWeather(weather) {
    const weathers = {

      'morning': {
        'color': 0xecdccc,
        'snow':  1,
        'wind':  0,
        'bgColor': 0xF8c3aC,
      },

      'afternoon': {
        'color': 0xffffff,
        'snow':  0.1,
        'wind': 0,
        'bgColor': 0xB2FFFF,
      },

      'twilight': {
        'color': 0xccaacc,
        'bgColor': 0x18235C,
        'snow':  5,
        'wind': 50,
      },

      'night': {
        'color': 0x555555,
        'bgColor': 0x000000,
        'snow':  0,
        'wind': 0,
      },
    }
    let { color, bgColor, snow, wind } = weathers[weather];
    gameState.bg1.setTint(color);
    gameState.bg2.setTint(color);
    gameState.bg3.setTint(color);
    gameState.bgColor.fillColor = bgColor;
    gameState.emitter.setQuantity(snow);
    gameState.emitter.setSpeedX(-wind);
    gameState.player.setTint(color);
    for (let platform of gameState.platforms.getChildren()) {
      platform.setTint(color);
    }
    if (weather === 'night') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else if (weather === 'twilight') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }

    return
  }
}

class Level1 extends Level {
  constructor() {
    super('Level1')
    this.heights = [12, 8, 6, 5, null, 6, null, 3];
    this.weather = 'morning';
  }
}

class Level2 extends Level {
  constructor() {
    super('Level2')
    this.heights = [7, 7, null, null, 11, null, 7, 5];
    this.weather = 'afternoon';
  }
}

class Level3 extends Level {
  constructor() {
    super('Level3')
    this.heights = [12, null, 12, 6, 8, null, null, 4];
    this.weather = 'twilight';
  }
}

class Level4 extends Level {
  constructor() {
    super('Level4')
    this.heights = [null, 10, 10, 7, null, null, null, 5];
    this.weather = 'twilight';
  }
}

class Level5 extends Level {
  constructor() {
    super('Level5')
    this.heights = [7, null, null, null, 5, null, null, 4];
    this.weather = 'night';
  }
}

class Level6 extends Level {
  constructor() {
    super('Level6')
    this.heights = [null, null, 13, 7, null, 10, null, 4];
    this.weather = 'morning';
  }
}


class Credits extends Phaser.Scene {


  constructor() {
    super('Credits')
  }

  preload() {

    this.load.spritesheet('diamond', 'https://examples.phaser.io/assets/sprites/diamonds32x5.png',
      { frameWidth: 64, frameHeight: 64});

  }

  create() {

    gameState.player = this.add.sprite(config.width / 2, config.height / 2, 'diamond');

    this.anims.create({
      key: 'fire',
      frames: this.anims.generateFrameNumbers('diamond', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1
    })

  }

  update() {

    gameState.player.anims.play('fire', true);
  }

}

const gameState = {
  speed: 540,
  ups: 380,
};

const config = {
  type: Phaser.AUTO,
  width: 2000,
  height: 1000,
  fps: {target: 60},
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      enableBody: true,

    }
  },
  scene: [Level1, Level2, Level3, Level4, Level5, Level6, Credits]
};

const game = new Phaser.Game(config);
