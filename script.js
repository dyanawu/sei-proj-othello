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
// friendly modal to display info
// random autoplay (button only)
// add game reset button

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
  var modal = document.createElement("div");
  modal.classList.add("modal");

  for (var r = 0; r <gridSize; r++) {
    for (var c = 0; c < gridSize; c++) {
      var square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = `${r}`;
      square.dataset.col = `${c}`;
      gameState[r][c] = square;
      gameboard.appendChild(square);
      square.addEventListener("click", playTurnAt);
    }
  }
  container.appendChild(gameboard);
  container.appendChild(modal);
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
  turnPane.appendChild(playerDisp);

  var scoreBoard = function (player) {
    var scoreB = document.createElement("div");
    scoreB.classList.add("score");
    scoreB.innerHTML = `<h2>${player.colour}</h2>`;

    var score = document.createElement("h1");
    var id = player.colour === "black" ? "p1" : "p2";
    score.id = id + "-score";
    score.innerText = `${player.score}`;
    scoreB.appendChild(score);

    return scoreB;
  }

  var p1ScoreB = scoreBoard(player1);
  var p2ScoreB = scoreBoard(player2);

  //debug mode only
  // var passButton = document.createElement("button");
  // passButton.addEventListener("click", changePlayer);
  // passButton.innerText = "Pass turn";
  // turnPane.appendChild(passButton);

  var autoButton = document.createElement("button");
  autoButton.id = "button-dwim";
  autoButton.addEventListener("click", autoPlay);
  autoButton.innerText = "Play this turn for me";
  turnPane.appendChild(autoButton);

  statusPane.appendChild(turnPane);
  statusPane.insertBefore(p1ScoreB, turnPane);
  statusPane.appendChild(p2ScoreB);
  container.appendChild(statusPane);
}

var initGame = function () {
  for (var i = 0; i < 4; i++) {
    var [r, c] = STARTPOINTS[i];
    var square = gameState[r][c];
    if (i === 0 || i === 3) {
      var piece = makePiece("white");
      square.dataset.colour = "white";
      square.appendChild(piece);
    } else {
      var piece = makePiece("black");
      square.dataset.colour = "black";
      square.appendChild(piece);
    }
  }
};

var setup = function () {
  document.body.innerHTML = "";
  emptyGame();
  makeBoard();
  makeStatusPane();
  initGame();
  findValidSquares();
  console.log("Game State: ", gameState);
}


// Turn-related helper functions
var updateScore = function () {
  player1.score = 0;
  player2.score = 0;
  var squares = document.querySelectorAll(".square");
  for (var i = 0; i < squares.length; i++) {
    var square = squares[i];
    if (square.firstChild === null) {
      continue;
    } else if (square.dataset.colour === "black") {
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
  var squaresToFlip = [];
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
//    var searchPc = searchSq.firstChild;

    if (searchSq.firstChild === null) {
      return [];
    } else {
      searchSq = searchSq.dataset.colour === "black" ? "black" : "white";
      if (searchSq === oColour) {
        squaresToFlip.push([sRow, sCol]);
      } else {
        return squaresToFlip;
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
    var square = gameState[sqArr[sq][0]][sqArr[sq][1]];
    square.dataset.colour = currentPlayer.colour;
    pcArr.push(square.firstChild);
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

var displayAlert = function (str, colour) {
  var modal = document.querySelector(".modal");
  if (modal.firstChild !== null) {
  modal.removeChild(modal.firstChild);
  }

  var modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerText = str;

  modal.appendChild(modalContent);
  modalContent.style.border = `80px solid ${colour}`;
  modal.style.display = "block";

  window.onclick = function (event) {
    if (event.target === modal || event.target === modalContent) {
      modal.style.display = "none";
    }
  }
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
    displayAlert(`No valid moves for ${currentPlayer.colour}, skipping turn`, "lightpink");
    skipped.push(currentPlayer);
    if (skipped.length < 2) {
      changePlayer();
      return;
    } else {
      endGame();
    }
  }
};

var endGame = function () {
  var squares = document.querySelectorAll(".square");
  for (var i = 0; i < squares.length; i++) {
    squares[i].removeEventListener("click", playTurnAt);
  }
  var button = document.querySelector("#button-dwim");
  button.removeEventListener("click", autoPlay);

  button.innerText = "Reset Game";
  button.style.backgroundColor = "lightblue";
  button.addEventListener("click", setup);

  var outStr = "Game over!";
  if (player1.score > player2.score) {
    outStr += `\nWinner: ${player1.colour}, ${player1.score} pieces.`;
  } else if (player2.score > player1.score) {
    outStr += `\nWinner: ${player2.colour}, ${player2.score} pieces.`;
  } else {
    outStr += "\nGame ended in a draw.";
  }
  displayAlert(outStr, "lightblue");
}

var autoPlay = function () {
  var squares = getValidSquares();
  var i = Math.floor(Math.random() * squares.length);
  squareToPlay = squares[i];

  playTurnAt(squareToPlay);
}

// main turn function
var playTurnAt = function (squareObj) {
  if (event.target.type === "submit") {
    var playedSquare = squareObj;
  } else {
    var playedSquare = event.target;
  }

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
  playedSquare.dataset.colour = currentPlayer.colour;
  playedSquare.appendChild(piece);

  updateScore();
  changePlayer();
};

//Set up an empty grid and game on page load
document.addEventListener(
  "DOMContentLoaded",
  setup
);
