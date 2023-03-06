const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const asteroids = [];
const ship = { x: 300, y: 300, animX: 0, animY: 0 };

let timer = 0;
const frame = 50;

const asteroid = new Image();
asteroid.src = "./assets/images/asteroid.png";
const player = new Image();
player.src = "./assets/images/ship.png";
const background = new Image();
background.src = "./assets/images/sky.jpg";

canvas.addEventListener("mousemove", function (event) {
  ship.x = event.offsetX - 55;
  ship.y = event.offsetY - 55;
});

background.onload = function () {
  game();
};

function game() {
  update();
  render();
  requestAnimationFrame(game);
}

function update() {
  timer++;

  if (timer % 50 === 0) {
    const asteroidPosition = {
      x: Math.random() * 600,
      y: -50,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 + 2,
    };
    asteroids.push(asteroidPosition);
  }

  for (i in asteroids) {
    asteroids[i].x = asteroids[i].x + asteroids[i].speedX;
    asteroids[i].y = asteroids[i].y + asteroids[i].speedY;

    if (asteroids[i].x >= 550 || asteroids[i].x < 0) {
      asteroids[i].speedX = -asteroids[i].speedX;
    }
    if (asteroids[i].y >= 600) {
      asteroids.splice(i, 1);
    }
  }
}

function render() {
  context.drawImage(background, 0, 0, 600, 600);
  context.drawImage(player, ship.x, ship.y, 120, 100);
  for (i in asteroids) {
    context.drawImage(asteroid, asteroids[i].x, asteroids[i].y, 50, 50);
  }
}


