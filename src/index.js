const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
context.font = "22px Verdana";

let asteroids = [];
let fires = [];
let explosions = [];

const ship = { x: 300, y: 300, width: 120, height: 100 };

let timer = 0;
let score = 0;
let stopped = true;
let myRequestAnimationFrame = 0;
const frame = { acteroid: 15, fire: 30 };
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};

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
const gameOver = new Image();
gameOver.src = "./assets/images/game-over.png";

explosion.onload = function () {
  init();
  game();
};

function onClick(event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;
    case state.game:
      break;
    case state.over:
      score = 0;
      stopped = false;
      // myRequestAnimationFrame = requestAnimationFrame(game);
      state.current = state.getReady;
      break;
  }
}

function init() {
  canvas.addEventListener("mousemove", function (event) {
    ship.x = event.offsetX - 55;
    ship.y = event.offsetY - 55;
  });
  canvas.addEventListener("click", onClick);
}

function game() {
  update();
  render();
  myRequestAnimationFrame = requestAnimationFrame(game);
}

function update() {
  if (state.current === state.game) {
    timer++;
    // рендер астероидов каждые frame кадров
    if (timer % frame.acteroid === 0) {
      asteroids.push({
        x: Math.random() * 1150,
        y: -50,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 2,
        angle: 0,
        dxangle: Math.random() * 0.04 - 0.01,
        del: 0,
        width: 50,
        height: 50,
      });
    }
    // рендер выстрелов каждые frame кадров
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
      // двигаем астероиды
      asteroids[i].x = asteroids[i].x + asteroids[i].dx;
      asteroids[i].y = asteroids[i].y + asteroids[i].dy;
      asteroids[i].angle = asteroids[i].angle + asteroids[i].dxangle;

      if (asteroids[i].x >= 1200 || asteroids[i].x <= 0) {
        // если бьется о боковую стенку, меняем траекторию
        asteroids[i].dx = -asteroids[i].dx;
      }
      if (asteroids[i].y > 800) {
        // если уходит вниз экрана, удаляем
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
          ) < asteroids[i].width &&
          Math.abs(asteroids[i].y - fires[j].y) < asteroids[i].width / 2
        ) {
          // произошло столкновение
          explosions.push({
            x: asteroids[i].x - asteroids[i].width / 2,
            y: asteroids[i].y - asteroids[i].width / 2,
            animX: 0,
            animY: 0,
          });
          // помечаем астероид на удаление, удаляем пулю
          asteroids[i].del = 1;
          fires.splice(j, 1);
          score++;
          break;
        }
      }
      // удаляем помеченные астероиды
      if (asteroids[i].del === 1) {
        asteroids.splice(i, 1);
      }
    }
    // столкновение корабля с астероидом
    for (i in asteroids) {
      if (
        ship.y < asteroids[i].y + asteroids[i].height &&
        ship.y + asteroids[i].height > asteroids[i].y &&
        ship.x + asteroids[i].width / 2 > asteroids[i].x &&
        ship.x < asteroids[i].x + asteroids[i].width / 2
      ) {
        console.log("boom");
        // score = 0;
        state.current = state.over;
        if (myRequestAnimationFrame) {
          cancelAnimationFrame(myRequestAnimationFrame); // сбросить цикл
          asteroids = [];
          fires = [];
          explosions = [];
          timer = 0;
        }
        stopped = true;

        break;
      }
    }
  }
}

function render() {
  context.clearRect(0, 0, 1200, 800);
  if (state.current === state.getReady) {
    context.clearRect(0, 0, 1200, 800);
    context.drawImage(background, 0, 0, 1200, 800);
    context.drawImage(player, ship.x, ship.y, ship.width, ship.height);
  }
  if (state.current === state.game) {
    context.clearRect(0, 0, 1200, 800);
    context.drawImage(background, 0, 0, 1200, 800);
    context.drawImage(player, ship.x, ship.y, ship.width, ship.height);
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
      context.save();
      context.translate(
        asteroids[i].x + asteroids[i].width / 2,
        asteroids[i].y + asteroids[i].width / 2
      );
      context.rotate(asteroids[i].angle);
      context.drawImage(
        asteroid,
        -asteroids[i].width / 2,
        -asteroids[i].width / 2,
        asteroids[i].width,
        asteroids[i].height
      );
      context.restore();
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
    context.strokeStyle = "red";
    context.strokeText(`Score: ${score}`, 20, 50);
  }
  if (state.current === state.over) {
    context.clearRect(0, 0, 1200, 800);
    context.drawImage(background, 0, 0, 1200, 800);
    context.drawImage(gameOver, 600 - 125, 400 - 50, 250, 100);
  }
}
