const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const messageElement = document.getElementById("message");
const startButton = document.getElementById("startButton");
const moveButtons = document.querySelectorAll(".move-button");

const player = {
  x: canvas.width / 2 - 34,
  y: canvas.height - 38,
  width: 68,
  height: 18,
  speed: 420
};

const keys = { left: false, right: false };
let obstacles = [];
let score = 0;
let best = Number(localStorage.getItem("dodge-best") || 0);
let running = false;
let spawnTimer = 0;
let elapsed = 0;
let previousTime = 0;

bestElement.textContent = best;

function startGame() {
  obstacles = [];
  score = 0;
  elapsed = 0;
  spawnTimer = 0;
  player.x = canvas.width / 2 - player.width / 2;
  running = true;
  scoreElement.textContent = "0";
  messageElement.textContent = "Stay alive!";
  startButton.textContent = "Restart Game";
  startButton.style.display = "none";
}

function endGame() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("dodge-best", String(best));
    bestElement.textContent = best;
  }
  messageElement.textContent = "Game over! Click Restart Game to try again.";
  startButton.textContent = "Restart Game";
  startButton.style.display = "block";
}

function spawnObstacle() {
  const size = 18 + Math.random() * 24;
  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: 180 + Math.random() * 170 + score * 0.6
  });
}

function overlaps(a, b) {
  return a.x < b.x + b.size &&
    a.x + a.width > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y;
}

function update(delta) {
  if (!running) return;

  elapsed += delta;
  score = Math.floor(elapsed * 10);
  scoreElement.textContent = score;

  if (keys.left) player.x -= player.speed * delta;
  if (keys.right) player.x += player.speed * delta;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(0.35, 0.9 - score / 500);
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    obstacle.y += obstacle.speed * delta;

    if (overlaps(player, obstacle)) {
      endGame();
      return;
    }

    if (obstacle.y > canvas.height) obstacles.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "#f87171";
  obstacles.forEach((obstacle) => {
    ctx.beginPath();
    ctx.arc(
      obstacle.x + obstacle.size / 2,
      obstacle.y + obstacle.size / 2,
      obstacle.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop(time) {
  const delta = Math.min((time - previousTime) / 1000, 0.033);
  previousTime = time;
  update(delta);
  draw();
  requestAnimationFrame(gameLoop);
}

function setDirection(direction, pressed) {
  keys[direction] = pressed;
}

startButton.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") setDirection("left", true);
  if (key === "arrowright" || key === "d") setDirection("right", true);
  if (event.code === "Space") {
    event.preventDefault();
    if (!running) startGame();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") setDirection("left", false);
  if (key === "arrowright" || key === "d") setDirection("right", false);
});

moveButtons.forEach((button) => {
  const direction = button.dataset.direction;
  button.addEventListener("pointerdown", () => setDirection(direction, true));
  button.addEventListener("pointerup", () => setDirection(direction, false));
  button.addEventListener("pointerleave", () => setDirection(direction, false));
  button.addEventListener("pointercancel", () => setDirection(direction, false));
});

requestAnimationFrame(gameLoop);
