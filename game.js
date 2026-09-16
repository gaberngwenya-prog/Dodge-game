const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const messageElement = document.getElementById("message");

const player = {
  x: canvas.width / 2 - 34,
  y: canvas.height - 38,
  width: 68,
  height: 18,
  speed: 420
};

const keys = {
  left: false,
  right: false
};

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
  messageElement.textContent = "Stay alive!";
}

function endGame() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("dodge-best", best);
    bestElement.textContent = best;
  }
  messageElement.textContent = "Game over! Press Space to try again.";
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
  return (
    a.x < b.x + b.size &&
    a.x + a.width > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y
  );
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

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.y += obstacle.speed * delta;

    if (overlaps(player, obstacle)) {
      endGame();
      return;
    }

    if (obstacle.y > canvas.height) {
      obstacles.splice(i, 1);
    }
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

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") keys.left = true;
  if (key === "arrowright" || key === "d") keys.right = true;

  if (event.code === "Space") {
    event.preventDefault();
    if (!running) startGame();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") keys.left = false;
  if (key === "arrowright" || key === "d") keys.right = false;
});

requestAnimationFrame(gameLoop);