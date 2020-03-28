const VECTORS = {
  N:  [ 0,  1],
  S:  [ 0, -1],
  E:  [ 1,  0],
  W:  [-1,  0],
  NE: [ 1,  1],
  SE: [ 1, -1],
  SW: [-1, -1],
  NW: [-1,  1]
};

const STARTPOINTS = [
  [3, 3],
  [3, 4],
  [4, 3],
  [4, 4]
];

var gridSize = 8; // defined here so there's room to grow maybe
var gameState = [];

var player1 = {
  colour: "black"
};

var player2 = {
  colour: "white"
};

var currentPlayer = player1;

// General game setup helper functions
var emptyGame = function () {
  gameState = [];
  for (var r = 0; r < gridSize; r++) {
    gameState[r] = [];
    for (var c = 0; c < gridSize; c++) {
      gameState[r][c] = null;
    }
  }
}

var makeBoard = function () {
  /* game board = 8*8
   */
  var container = document.createElement("div");
  container.id = "game-container";
  var gameboard = document.createElement("div");
  gameboard.id = "game-board";

  for (var r = 0; r <gridSize; r++) {
    for (var c = 0; c < gridSize; c++) {
      var square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = `${r}`;
      square.dataset.col = `${c}`;
      gameState[r][c] = square;
      gameboard.appendChild(square);
      square.addEventListener(
        "click",
        function () { playTurnAt(this.dataset.row, this.dataset.col); }
      );
    }
  }
  container.appendChild(gameboard);
  document.body.appendChild(container);
}

var initGame = function () {
  for (var i = 0; i < 4; i++) {
    var [r, c] = STARTPOINTS[i];
    var square = gameState[r][c];
    console.log(`row ${r}, col ${c}`);
    if (i === 0 || i === 3) {
      var piece = makePiece("white");
      square.appendChild(piece);
    } else {
      var piece = makePiece("black");
      square.appendChild(piece);
    }
  }
}

// Turn-related helper functions

//TODO: check if square about to be played is valid

var isTaken = function (squareObj) {
  if (squareObj.firstChild === null) {
    return false;
  }
  return true;
}

var checkIfValidMove = function (r, c) {
};

var findPieces = function (r, c) {
}

var getPieceObjs = function (objArr) {
  var pcArr = [];
  for (var i = 0; i < objArr.length; i++) {
    pcArr.push(objArr[i].firstChild);
  }
}

var flipPiece = function (pc) {
  pc.classList.toggle("flipped");
}

var flipPieceArr = function (pcArr) {
  for (var i = 0; i < pcArr.length; i++) {
    setTimeout(flipPiece, i * 250, pcArr[i]);
  }
}

var makePiece = function (colour) {
  //helper subfunction to make the div for both sides of the image
  var makeSide = function (colour) {
    var side = document.createElement("div");
    side.classList.add(`piece-${colour}`);
    var sideImg = document.createElement("img");
    sideImg.src = `./img/${colour}circle.png`;
    side.appendChild(sideImg);
    return side;
  };

  var piece = document.createElement("div");
  piece.classList.add("piece");
  piece.appendChild(makeSide("black"));
  piece.appendChild(makeSide("white"));

  if (colour === "white") {
    piece.classList.add("white-up");
  }

  return piece;
}

var changePlayer = function () {
  currentPlayer = (currentPlayer === player1) ? player2 : player1;
}

var playTurnAt = function (r, c) {
  //TODO: check for validity of move
  var playedSquare = gameState[r][c];
  if (isTaken(playedSquare)) {
    console.log("Square already played");
    playedSquare.classList.add("flash");
    setTimeout (function () { playedSquare.classList.remove("flash"); }, 2500)
    return;
  }
  var piece = makePiece(currentPlayer.colour);
  playedSquare.appendChild(piece);
  changePlayer();
}

//Set up an empty grid and game on page load
document.addEventListener(
  "DOMContentLoaded",
  function setup () {
    emptyGame();
    makeBoard();
    initGame();
    console.log(gameState);
  }
);
