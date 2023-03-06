const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const asteroids = [];
const fires = [];
const explosions = [];

const ship = { x: 300, y: 300, animX: 0, animY: 0 };

let timer = 0;
const frame = { acteroid: 15, fire: 30 };

const asteroid = new Image();
asteroid.src = "./assets/images/asteroid.png";
const player = new Image();
player.src = "./assets/images/ship.png";
const fire = new Image();
fire.src = "./assets/images/fire.png";
const explosion = new Image();
explosion.src = "./assets/images/explosion.png";
const background = new Image();
background.src = "./assets/images/sky.jpg";

canvas.addEventListener("mousemove", function (event) {
  ship.x = event.offsetX - 55;
  ship.y = event.offsetY - 55;
});

explosion.onload = function () {
  game();
};

function game() {
  update();
  render();
  requestAnimationFrame(game);
}

function update() {
  timer++;
  // рендер астероидов каждые frame кадров
  if (timer % frame.acteroid === 0) {
    asteroids.push({
      x: Math.random() * 1200,
      y: -50,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2,
      del: 0,
      width: 50,
      height: 50,
    });
  }
  // выстрел
  if (timer % frame.fire === 0) {
    fires.push({
      x: ship.x + 45,
      y: ship.y,
      dx: 0,
      dy: -5,
      width: 30,
      height: 30,
    });
    fires.push({
      x: ship.x + 45,
      y: ship.y,
      dx: 0.5,
      dy: -5,
      width: 30,
      height: 30,
    });
    fires.push({
      x: ship.x + 45,
      y: ship.y,
      dx: -0.5,
      dy: -5,
      width: 30,
      height: 30,
    });
  }
  // двигаем пули
  for (i in fires) {
    fires[i].x = fires[i].x + fires[i].dx;
    fires[i].y = fires[i].y + fires[i].dy;

    if (fires[i].y <= 0) {
      fires.splice(i, 1);
    }
  }

  // анимация взрыва
  for (i in explosions) {
    explosions[i].animX = explosions[i].animX + 0.5;
    if (explosions[i].animX > 7) {
      explosions[i].animY++;
      explosions[i].animX = 0;
    }
    if (explosions[i].animY > 7) {
      explosions.splice(i, 1);
    }
  }

  for (i in asteroids) {
    asteroids[i].x = asteroids[i].x + asteroids[i].dx;
    asteroids[i].y = asteroids[i].y + asteroids[i].dy;

    if (asteroids[i].x >= 1150 || asteroids[i].x < 0) {
      asteroids[i].dx = -asteroids[i].dx;
    }
    if (asteroids[i].y >= 1200) {
      asteroids.splice(i, 1);
    }

    // проверим каждый астероид на столкновение с каждой пулей
    for (j in fires) {
      if (
        Math.abs(
          asteroids[i].x +
            asteroids[i].width / 2 -
            fires[j].x -
            fires[j].width / 2
        ) < 50 &&
        Math.abs(asteroids[i].y - fires[j].y) < asteroids[i].width / 2
      ) {
        // произошло столкновение
        explosions.push({
          x: asteroids[i].x - asteroids[i].width / 2,
          y: asteroids[i].y - asteroids[i].width / 2,
          animX: 0,
          animY: 0,
        });

        asteroids[i].del = 1;
        fires.splice(j, 1);
        break;
      }
    }
    if (asteroids[i].del === 1) {
      asteroids.splice(i, 1);
    }
  }
}

function render() {
  context.drawImage(background, 0, 0, 1200, 800);
  context.drawImage(player, ship.x, ship.y, 120, 100);
  for (i in fires) {
    context.drawImage(
      fire,
      fires[i].x,
      fires[i].y,
      fires[i].width,
      fires[i].height
    );
  }
  for (i in asteroids) {
    context.drawImage(
      asteroid,
      asteroids[i].x,
      asteroids[i].y,
      asteroids[i].width,
      asteroids[i].height
    );
  }
  for (i in explosions) {
    context.drawImage(
      explosion,
      128 * Math.floor(explosions[i].animX),
      128 * Math.floor(explosions[i].animY),
      128,
      128,
      explosions[i].x,
      explosions[i].y,
      100,
      100
    );
  }
}
