const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const MAX_ASTEROIDS = 200

let asteroids = [];
let fires = [];
let explosions = [];
let lives = [
  { x: 1130, y: 10, width: 60, height: 60 },
  { x: 1070, y: 10, width: 60, height: 60 },
  { x: 1010, y: 10, width: 60, height: 60 },
];

const ship = { x: 300, y: 300, width: 120, height: 100 };

let timer = 0;
let score = 0;
let bestScore = 0;
let prevTimestamp = 0;
let myRequestAnimationFrame = 0;
let pause = false;

const frame = { acteroid: 15, fire: 25 };
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
const heart = new Image();
heart.src = "./assets/images/live.png";
const cup = new Image();
cup.src = "./assets/images/supercupn.png";
const rectangle = new Image();
rectangle.src = "./assets/images/rectangle.png";

window.onload = function () {
  init();
  game();
};

function changeStateHandler(event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;
    case state.game:
      pause = !pause;
      break;
    case state.over:
      state.current = state.getReady;
      break;
  }
}

function init() {
  canvas.addEventListener("mousemove", function (event) {
    if (!pause) {
      ship.x = event.offsetX - 55;
      ship.y = event.offsetY - 55;
    }
  });

  canvas.addEventListener("click", changeStateHandler);
}

function game(timestamp) {
  const diff = timestamp - prevTimestamp;
  prevTimestamp = timestamp;
  update(diff);
  render();
  myRequestAnimationFrame = requestAnimationFrame(game);
}

function reset() {
  asteroids = [];
  fires = [];
  explosions = [];
  timer = 0;
}

function update(diff) {
  if (state.current === state.game && !pause) {
    const gameSpeed = 1;
    const delta = diff / (1000 / 60);
    timer++;

    if (timer % frame.acteroid === 0 && asteroids.length < MAX_ASTEROIDS) {
      asteroids.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        dx: (Math.random() * 2 - 1) * gameSpeed,
        dy: (Math.random() * 2) * gameSpeed,
        angle: 0,
        dxangle: (Math.random() * 0.04 - 0.01) * gameSpeed,
        del: 0,
        width: 50,
        height: 50,
      });
    }

    if (timer % frame.fire === 0) {
      fires.push({
        x: ship.x + 45,
        y: ship.y,
        dx: 0,
        dy: -55,
        width: 30,
        height: 30,
      });
      fires.push({
        x: ship.x + 45,
        y: ship.y,
        dx: 2.5,
        dy: -40,
        width: 30,
        height: 30,
      });
      fires.push({
        x: ship.x + 45,
        y: ship.y,
        dx: -2.5,
        dy: -40,
        width: 30,
        height: 30,
      });
    }

    for (let i = fires.length - 1; i >= 0; i--) {
      fires[i].x += fires[i].dx * delta;
      fires[i].y += fires[i].dy * delta;
      if (fires[i].y <= 0) fires.splice(i, 1);
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].animX += 0.5 * delta * gameSpeed;

      if (explosions[i].animX > 7) {
        explosions[i].animY++;
        explosions[i].animX = 0;
      }

      if (explosions[i].animY > 7) {
        explosions.splice(i, 1);
      }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      asteroids[i].x += asteroids[i].dx * delta;
      asteroids[i].y += asteroids[i].dy * delta;
      asteroids[i].angle += asteroids[i].dxangle * delta;

      if (asteroids[i].x >= CANVAS_WIDTH || asteroids[i].x <= 0) asteroids[i].dx = -asteroids[i].dx;
      if (asteroids[i].y > CANVAS_HEIGHT || asteroids[i].del === 1) asteroids.splice(i, 1);

      for (let j = fires.length - 1; j >= 0; j--) {
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
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      if (
        ship.x < asteroids[i].x + asteroids[i].width &&
        ship.x + ship.width > asteroids[i].x &&
        ship.y < asteroids[i].y + asteroids[i].height &&
        ship.y + ship.height > asteroids[i].y
      ) {
        lives.pop();
        asteroids.splice(i, 1);

        if (!lives.length) {
          bestScore = Math.max(score, localStorage.getItem("score") || 0);
          localStorage.setItem("score", bestScore);

          score = 0;
          state.current = state.over;
          lives = [
            { x: 1130, y: 10, width: 60, height: 60 },
            { x: 1070, y: 10, width: 60, height: 60 },
            { x: 1010, y: 10, width: 60, height: 60 },
          ];
        }
        if (myRequestAnimationFrame) {
          reset();
        }
        break;
      }
    }
  }
}

function render() {
  if (!state.game) {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  if (state.current === state.getReady) {
    context.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.drawImage(player, ship.x, ship.y, ship.width, ship.height);
    context.font = "45px Verdana";
    context.strokeStyle = "white";
    context.lineWidth = 3;
    const startText = "Кликните, чтобы начать";
    const text = context.measureText(startText);
    context.strokeText(startText, CANVAS_WIDTH / 2 - text.width / 2, CANVAS_HEIGHT / 2);
  }

  if (state.current === state.game) {
    context.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.drawImage(player, ship.x, ship.y, ship.width, ship.height);

    for (let i in fires) {
      context.drawImage(
        fire,
        fires[i].x,
        fires[i].y,
        fires[i].width,
        fires[i].height
      );
    }

    for (let i in asteroids) {
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

    for (let i in explosions) {
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
    context.font = "30px Verdana";
    context.lineWidth = 2;
    context.strokeStyle = "red";
    context.strokeText(`Score: ${score}`, 20, 50);

    for (let i in lives) {
      context.drawImage(
        heart,
        lives[i].x,
        lives[i].y,
        lives[i].width,
        lives[i].height
      );
    }

    if (pause) {
      context.font = "45px Verdana";
      context.strokeStyle = "white";
      context.lineWidth = 3;
      const pauseText = "Пауза";
      const text = context.measureText(pauseText);
      context.strokeText(pauseText, CANVAS_WIDTH / 2 - text.width / 2, CANVAS_HEIGHT / 2);
    }
  }

  if (state.current === state.over) {
    context.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    context.drawImage(
      rectangle,
      CANVAS_WIDTH / 2 - 600 / 2,
      CANVAS_HEIGHT / 2 - 100 / 2 + 100,
      600,
      100
    );

    context.drawImage(
      gameOver,
      CANVAS_WIDTH / 2 - 500 / 2,
      CANVAS_HEIGHT / 2 - 200 / 2 - 28,
      500,
      200
    );

    context.drawImage(cup, CANVAS_WIDTH / 2 - 245, CANVAS_HEIGHT / 2 - 50 / 2 + 100, 50, 50);
    context.font = "25px Verdana";
    context.strokeStyle = "white";
    context.lineWidth = 2;
    const resultText = `Best score: ${bestScore}`;
    const text = context.measureText(resultText);
    context.strokeText(
      `Best score: ${bestScore}`,
      CANVAS_WIDTH / 2 - 80 - text.width / 2,
      CANVAS_HEIGHT / 2 + 110
    );
  }
}
