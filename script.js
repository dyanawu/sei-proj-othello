// mvp breakdown
// make grid
// make pieces
// make pieces flippable
// make pieces playable
// auto alternate turns

// further DONE
// detect move validity and get flippable pieces, flip pieces

// further TODO
// add ability to skip moves voluntarily
// skip a player's moves if they have no valid moves
// track current score, report win
// css flip in direction of play

const VECTORS = {
  N  : { row: -1, col:  0 },
  NE : { row: -1, col:  1 },
  E  : { row:  0, col:  1 },
  SE : { row:  1, col:  1 },
  S  : { row:  1, col:  0 },
  SW : { row:  1, col: -1 },
  W  : { row:  0, col: -1 },
  NW : { row: -1, col: -1 }
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
};

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
        function () { playTurnAt(this); }
      );
    }
  }
  container.appendChild(gameboard);
  document.body.appendChild(container);
};

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
};

// Turn-related helper functions
var findSquaresToFlip = function (squareObj, vec) {
  var pieces = [];
  var row = Number(squareObj.dataset.row);
  var col = Number(squareObj.dataset.col);

  //row and column to search in
  var sRow = row + vec.row;
  var sCol = col + vec.col;

  //for now, player and opponent colours
  var pColour = currentPlayer.colour;
  var oColour = (pColour === "black" ? "white" : "black");

  while ((sRow >= 0 && sRow < gridSize) &&
         (sCol >= 0 && sCol < gridSize)) {
    var searchSq = gameState[sRow][sCol];
    var searchPc = searchSq.firstChild;

    if (searchPc === null) {
      return [];
    } else {
      searchPc = searchPc.classList.contains("black") ? "black" : "white";
      if (searchPc === oColour) {
        console.log("added");
        pieces.push([sRow, sCol]);
      } else {
        return pieces;
      }
    }
    sRow += vec.row;
    sCol += vec.col;
  }

  return [];
};

var getPieceObjs = function (objArr) {
  var pcArr = [];
  for (var i = 0; i < objArr.length; i++) {
    pcArr.push(objArr[i].firstChild);
  }
};

var flipPiece = function (pc) {
  pc.classList.toggle("white");
  pc.classList.toggle("black");
}

var flipSquares = function (sqArr) {
  console.log("will flip ", sqArr);
  var pcArr = [];
  for (var sq = 0; sq < sqArr.length; sq++) {
    var pc = gameState[sqArr[sq][0]][sqArr[sq][1]];
    pcArr.push(pc.firstChild);
  }
  console.log(pcArr);
  for (var i = 0; i < pcArr.length; i++) {
    setTimeout(flipPiece, i * 300, pcArr[i]);
  }
};

var makePiece = function (colour) {
  //helper subfunction to make the div for both sides of the image
  var makeSide = function (colour) {
    var side = document.createElement("div");
    side.classList.add(`piece-${colour}`);
    return side;
  };

  var piece = document.createElement("div");
  piece.classList.add("piece");
  piece.appendChild(makeSide("black"));
  piece.appendChild(makeSide("white"));

  piece.classList.add((colour === "black") ? "black" : "white" );

  return piece;
};

var changePlayer = function () {
  currentPlayer = (currentPlayer === player1) ? player2 : player1;
};

// main turn function
var playTurnAt = function (squareObj) {
  var playedSquare = squareObj;

  var isTaken = false;
  if (playedSquare.firstChild !== null) {
    isTaken = true;
  }

  if (isTaken) {
    console.log("Square already played");
    playedSquare.classList.add("flash");
    setTimeout (function () { playedSquare.classList.remove("flash"); }, 2500)
    return;
  }

  var squaresToFlip = {};
  for (dir in VECTORS) {
    squaresToFlip[dir] = findSquaresToFlip(playedSquare, VECTORS[dir]);
  }

  var isInvalidMove = true;
  for (dir in squaresToFlip) {
    if (squaresToFlip[dir].length > 0) {
      isInvalidMove = false;
      flipSquares(squaresToFlip[dir]);
    }
  }
  if (isInvalidMove) {
    console.log("Invalid move");
    playedSquare.classList.add("flash");
    setTimeout (function () { playedSquare.classList.remove("flash"); }, 2500)
    return;
  }

  var piece = makePiece(currentPlayer.colour);
  playedSquare.appendChild(piece);
  changePlayer();
};

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
