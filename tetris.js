// the board is 10 wide and 20 tall
// 0 = empty   1 = filled
let board = [];
for (let r = 0; r < 20; r++) {
  board.push( [0,0,0,0,0,0,0,0,0,0] );
}

// all the piece shapes
let allShapes = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0],[1,0],[1,1]],
  [[1,1,0],[0,1,1]],
];

// current falling piece
let fallingShape = allShapes[0];
let fallingCol   = 3;
let fallingRow   = 0;
let score        = 0;
let gameTimer    = null;


// pick a random shape and drop it from the top
function dropNewPieceFromTop() {
  let randomIndex = Math.floor( Math.random() * allShapes.length );
  fallingShape = allShapes[randomIndex];
  fallingCol   = 3;
  fallingRow   = 0;
}


// check if the falling piece will crash into something
function pieceWillCrash(colShift, rowShift) {
  for (let r = 0; r < fallingShape.length; r++) {
    for (let c = 0; c < fallingShape[r].length; c++) {

      if (fallingShape[r][c] === 0) continue;
      
      let nextRow = fallingRow + r + rowShift;
      let nextCol = fallingCol + c + colShift;

      if (nextCol < 0 || nextCol >= 10) return true;
      if (nextRow >= 20)                return true;
      if (nextRow >= 0 && board[nextRow][nextCol] === 1) return true;
    }
  }
  return false;
}


// stamp the falling piece onto the board as 1s
function lockPieceOntoBoard() {
  for (let r = 0; r < fallingShape.length; r++) {
    for (let c = 0; c < fallingShape[r].length; c++) {
      if (fallingShape[r][c] === 1) {
        board[fallingRow + r][fallingCol + c] = 1;
      }
    }
  }
}


// check every row - if full remove it and add empty row on top
function removeCompletedRows() {
  for (let r = 19; r >= 0; r--) {
    let rowIsComplete = board[r].every(cell => cell === 1);

    if (rowIsComplete) {
      board.splice(r, 1);
      board.unshift( [0,0,0,0,0,0,0,0,0,0] );
      score = score + 100;
      document.getElementById("score").innerText = score;
      r++;
    }
  }
}


// turn the piece 90 degrees clockwise
function rotateFallingPiece() {
  let rotatedShape = fallingShape[0].map((_, c) =>
    fallingShape.map(r => r[c]).reverse()
  );
  let oldShape = fallingShape;
  fallingShape = rotatedShape;
  if (pieceWillCrash(0, 0)) fallingShape = oldShape;
}


// check if the falling piece is covering this board cell
function fallingPieceCoversCell(boardRow, boardCol) {
  for (let r = 0; r < fallingShape.length; r++) {
    for (let c = 0; c < fallingShape[r].length; c++) {
      if (fallingShape[r][c] === 1) {
        if (fallingRow + r === boardRow && fallingCol + c === boardCol) {
          return true;
        }
      }
    }
  }
  return false;
}


// draw everything on screen
function drawBoardOnScreen() {
  let boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let r = 0; r < 20; r++) {
    let rowDiv = document.createElement("div");
    rowDiv.className = "row";

    for (let c = 0; c < 10; c++) {
      let cell = document.createElement("div");

      let cellIsFilled = board[r][c] === 1;
      let cellHasPiece = fallingPieceCoversCell(r, c);

      if (cellIsFilled || cellHasPiece) {
        cell.className = "cell black";
      } else {
        cell.className = "cell";
      }

      rowDiv.appendChild(cell);
    }

    boardDiv.appendChild(rowDiv);
  }
}


// move piece down one row every tick 
function movePieceDownOneRow() {
  if (!pieceWillCrash(0, 1)) {
    fallingRow++;
  } else {
    lockPieceOntoBoard();
    removeCompletedRows();
    dropNewPieceFromTop();

    if (pieceWillCrash(0, 0)) {
      clearInterval(gameTimer);
      document.getElementById("message").innerText = "Game Over!";
      return;
    }
  }
  drawBoardOnScreen();
}


// keyboard - move or rotate the piece
document.addEventListener("keydown", function(e) {
  if (e.key === "ArrowLeft"  && !pieceWillCrash(-1, 0)) fallingCol--;
  if (e.key === "ArrowRight" && !pieceWillCrash( 1, 0)) fallingCol++;
  if (e.key === "ArrowDown")  movePieceDownOneRow();
  if (e.key === "ArrowUp")    rotateFallingPiece();
  drawBoardOnScreen();
});


// reset everything and start
function startGame() {
  board = [];
  for (let r = 0; r < 20; r++) {
    board.push( [0,0,0,0,0,0,0,0,0,0] );
  }
  score = 0;
  document.getElementById("score").innerText   = 0;
  document.getElementById("message").innerText = "";
  dropNewPieceFromTop();
  drawBoardOnScreen();
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(movePieceDownOneRow, 600);
}
