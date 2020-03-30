// mvp breakdown
// make grid
// make pieces
// make pieces flippable
// make pieces playable
// auto alternate turns

// further DONE
// detect move validity and get flippable pieces, flip pieces
// add ability to skip moves voluntarily
// skip a player's moves if they have no valid moves
// track current score, report win

// TOFIX:
// score reporting lag

// further TODO
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
  colour: "black",
  score: 0
};

var player2 = {
  colour: "white",
  score: 0
};

var currentPlayer = player1;

var skipped = [];

// General game setup helper functions
var emptyGame = function () {
  skipped = [];
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

var makeStatusPane = function () {
  var container = document.querySelector("#game-container");

  var statusPane = document.createElement("div");
  statusPane.id = "game-statuspane";

  var turnPane = document.createElement("div");
  turnPane.id = "status-turn";
  turnPane.innerHTML = "<h2>Current turn<h2>";

  var playerDisp = document.createElement("h1");
  playerDisp.id = "current-player";
  playerDisp.innerText = currentPlayer.colour;

  var passButton = document.createElement("button");
  passButton.addEventListener("click", changePlayer);
  passButton.innerText = "Pass turn";

  var p1ScoreB = document.createElement("div");
  p1ScoreB.classList.add("score");
  p1ScoreB.innerHTML = `<h2>${player1.colour}</h2>`;

  var p1Score = document.createElement("h1");
  p1Score.id = "p1-score";
  p1Score.innerText = `${player1.score}`;
  p1ScoreB.appendChild(p1Score);

  var p2ScoreB = document.createElement("div");
  p2ScoreB.classList.add("score");
  p2ScoreB.innerHTML = `<h2>${player2.colour}</h2>`;
  var p2Score = document.createElement("h1");
  p2Score.id = "p2-score";
  p2Score.innerHTML = `${player2.score}`;
  p2ScoreB.appendChild(p2Score);

  turnPane.appendChild(playerDisp);
  turnPane.appendChild(passButton);
  statusPane.appendChild(turnPane);
  statusPane.insertBefore(p1ScoreB, turnPane);
  statusPane.appendChild(p2ScoreB);
  container.appendChild(statusPane);
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
};

// Turn-related helper functions
var updateScore = function () {
  player1.score = 0;
  player2.score = 0;
  var squares = document.querySelectorAll(".square");
  for (var i = 0; i < squares.length; i++) {
    var square = squares[i];
    if (square.firstChild === null) {
      continue;
    } else if (square.firstChild.classList.contains("black")) {
      player1.score++;
    } else {
      player2.score++;
    }

    var p1Score = document.querySelector("#p1-score");
    p1Score.innerText = player1.score;
    var p2Score = document.querySelector("#p2-score");
    p2Score.innerText = player2.score;
  }
};

var getValidSquares = function () {
  var validSquares = document.querySelectorAll(".valid");
  return validSquares;
};

var unsetValidSquares = function () {
  var validSquares = getValidSquares();
  for (var i = 0; i < validSquares.length; i++) {
    validSquares[i].classList.remove("valid");
  }
  return;
};

var findValidSquares = function () {
  var squares = document.querySelectorAll(".square");
  for (var i = 0; i < squares.length; i++) {
    checkSq = squares[i];

    // if the square is taken, it can't be played
    if (checkSq.firstChild !==null) {
      continue;
    }
    var squaresToFlip = {};
    for (dir in VECTORS) {
      squaresToFlip[dir] = findSquaresToFlip(checkSq, VECTORS[dir]);
    }

    for (dir in squaresToFlip) {
      if (squaresToFlip[dir].length > 0) {
        checkSq.classList.add("valid");
      }
    }
  }
}

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
};

var flipSquares = function (sqArr) {
  var pcArr = [];
  for (var sq = 0; sq < sqArr.length; sq++) {
    var pc = gameState[sqArr[sq][0]][sqArr[sq][1]];
    pcArr.push(pc.firstChild);
  }
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

var flashSquare = function (squareObj) {
  squareObj.classList.add("flash");
  setTimeout (function () { squareObj.classList.remove("flash"); }, 2500)
  return;
};

var displayAlert = function (str) {
  //TODO make a friendly display to replace console.log
};

var changePlayer = function () {
  unsetValidSquares();

  currentPlayer = (currentPlayer === player1) ? player2 : player1;
  document.querySelector("#current-player").innerText = currentPlayer.colour;
  findValidSquares();

  checkGame();
};

var checkGame = function () {
  var validSquares = getValidSquares();
  if (validSquares.length === 0) {
    console.log("no valid moves, skip turn");
    skipped.push(currentPlayer);
    if (skipped.length < 2) {
      changePlayer();
      return;
    } else {
      console.log("game over, no valid moves");
      if (player1.score > player2.score) {
        console.log(`Winner: ${player1.colour}, ${player1.score} pieces.`);
      } else if (player2.score > player1.score) {
        console.log(`Winner: ${player2.colour}, ${player2.score} pieces.`);
      } else {
        console.log("Draw!");
      }
    }
  }
};

// main turn function
var playTurnAt = function (squareObj) {
  var playedSquare = squareObj;

  if (!playedSquare.classList.contains("valid")) {
    flashSquare(playedSquare);
    return;
  }

  skipped = [];
  var squaresToFlip = {};
  for (dir in VECTORS) {
    squaresToFlip[dir] = findSquaresToFlip(playedSquare, VECTORS[dir]);
  }

  for (dir in squaresToFlip) {
    if (squaresToFlip[dir].length > 0) {
      flipSquares(squaresToFlip[dir]);
    }
  }

  var piece = makePiece(currentPlayer.colour);
  playedSquare.appendChild(piece);

  // TODO: fix this taking too slow if many pieces are flipped concurrently
  // set data attributes instead of animations?
  setTimeout(updateScore, 500);

  setTimeout(changePlayer, 1000);
};

//Set up an empty grid and game on page load
document.addEventListener(
  "DOMContentLoaded",
  function setup () {
    emptyGame();
    makeBoard();
    makeStatusPane();
    initGame();
    findValidSquares();
    console.log(gameState);
  }
);
