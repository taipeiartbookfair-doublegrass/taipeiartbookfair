const cells = [];
let current = Math.random() < 0.5 ? "Ｏ" : "Ｘ"; // 隨機決定誰先
let board = Array(9).fill("");
let finished = false;
document.querySelectorAll(".ttt-cell").forEach((btn, i) => {
  cells[i] = btn;
  btn.onclick = function () {
    if (board[i] || finished || current !== "Ｏ") return;
    makeMove(i, "Ｏ");
    if (!finished) setTimeout(aiMove, 400); // 電腦自動下
  };
});
if (current === "Ｘ") {
  setTimeout(aiMove, 400);
}

function makeMove(i, player) {
  board[i] = player;
  cells[i].textContent = player;
  cells[i].disabled = true;
  if (checkWin(player)) {
    finished = true;
    document.getElementById("ttt-refresh").style.display = "inline-block";
  } else if (board.every((v) => v)) {
    finished = true;
    document.getElementById("ttt-refresh").style.display = "inline-block";
  } else {
    current = player === "Ｏ" ? "Ｘ" : "Ｏ";
  }
}

function aiMove() {
  if (finished) return;
  // 1. 先檢查自己能不能贏
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "Ｘ";
      if (checkWin("Ｘ")) {
        makeMove(i, "Ｘ");
        return;
      }
      board[i] = "";
    }
  }
  // 2. 擋！
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "Ｏ";
      if (checkWin("Ｏ")) {
        board[i] = "";
        makeMove(i, "Ｘ");
        return;
      }
      board[i] = "";
    }
  }
  // 3. otherwise隨機下
  const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (empty.length === 0) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  makeMove(idx, "Ｘ");
}

function checkWin(player) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return wins.some((line) => line.every((idx) => board[idx] === player));
}

document.getElementById("ttt-refresh").onclick = function () {
  board = Array(9).fill("");
  finished = false;
  current = Math.random() < 0.5 ? "Ｏ" : "Ｘ";
  cells.forEach((btn, i) => {
    btn.textContent = "";
    btn.disabled = false;
  });
  this.style.display = "none";
  if (current === "Ｘ") setTimeout(aiMove, 400);
};
