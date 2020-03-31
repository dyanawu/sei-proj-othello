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
// random autoplay (via checkbox setting)
// timeout modal for autoplayer

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

const STARTPOINTS = {
  white: [
    [3, 3],
    [4, 4]
  ],
  black: [
    [3, 4],
    [4, 3]
  ]
};

const AUTODELAY = 900; // delay before autoplay moves

let gridSize = 8; // defined here so there's room to grow maybe

let gameState = [];

let player1 = {
  colour: "black",
  score: 0,
  mode: "human"
};
let player2 = {
  colour: "white",
  score: 0,
  mode: "human"
};

let currentPlayer = player1;
let hints = true;
let skipped = [];
let timerId;

// General game setup helper functions
let makeBoard = function () {
  let container = document.createElement("div");
  container.id = "game-container";
  let gameboard = document.createElement("div");
  gameboard.id = "game-board";
  let modal = document.createElement("div");
  modal.classList.add("modal");

  for (let r = 0; r <gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = `${r}`;
      square.dataset.col = `${c}`;
      gameState[r][c] = square;
      gameboard.appendChild(square);
    }
  }
  container.appendChild(gameboard);
  container.appendChild(modal);
  document.body.appendChild(container);
};

let makecontrolPanel = function () {
  let container = document.querySelector("#game-container");

  let controlPanel = document.createElement("div");
  controlPanel.id = "game-controlpanel";

  let turnPane = document.createElement("div");
  turnPane.id = "status-turn";
  turnPane.innerHTML = "<h2>Current turn<h2>";

  let playerDisp = document.createElement("h1");
  playerDisp.id = "current-player";
  playerDisp.innerText = currentPlayer.colour;
  turnPane.appendChild(playerDisp);

  let scoreBoard = function (player) {
    let scoreB = document.createElement("div");
    scoreB.classList.add("score");
    scoreB.innerHTML = `<h2>${player.colour}</h2>`;

    let score = document.createElement("h1");
    let id = player.colour === "black" ? "p1" : "p2";
    score.id = id + "-score";
    score.innerText = `${player.score}`;
    scoreB.appendChild(score);

    let checkContainer = document.createElement("label");
    checkContainer.classList.add("check-cont");
    checkContainer.innerText = "autoplay";
    let checkBox = document.createElement("input");
    checkBox.id = `${id}-auto`;
    checkBox.type = "checkbox";
    checkBox.checked = "";
    let check = document.createElement("span");
    check.classList.add("checkmark");

    checkContainer.appendChild(checkBox);
    checkContainer.appendChild(check);
    scoreB.appendChild(checkContainer);

    return scoreB;
  };

  let p1ScoreB = scoreBoard(player1);
  let p2ScoreB = scoreBoard(player2);

  let buttonContainer = document.createElement("div");
  buttonContainer.id = "button-cont";

  let gameButton = document.createElement("button");
  gameButton.id = "button-dwim";
  gameButton.addEventListener("click", startGame);
  gameButton.innerText = "Start game";
  buttonContainer.appendChild(gameButton);

  let hintButton = document.createElement("button");
  hintButton.id = "button-hint";
  hintButton.addEventListener("click", toggleHints);
  hintButton.innerText = "Hints: " + (hints ? "ON" : "OFF");
  buttonContainer.appendChild(hintButton);

  turnPane.appendChild(buttonContainer);
  controlPanel.appendChild(turnPane);
  controlPanel.insertBefore(p1ScoreB, turnPane);
  controlPanel.appendChild(p2ScoreB);
  container.appendChild(controlPanel);
};

let emptyGameStateState = function () {
  skipped = [];
  gameState = [];
  for (let r = 0; r < gridSize; r++) {
    gameState[r] = [];
    for (let c = 0; c < gridSize; c++) {
      gameState[r][c] = null;
    }
  }
};

let initGame = function () {
  for (let colour in STARTPOINTS) {
    let points = STARTPOINTS[colour];
    for (let i = 0; i < points.length; i++) {
      let [r, c] = points[i];
      let square = gameState[r][c];
      square.dataset.colour = colour;
      let piece = makePiece(colour);

      square.appendChild(piece);
    }
  }
};

let setup = function () {
  document.body.innerHTML = "";

  currentPlayer = player1;
  player1.score = 0;
  player1.mode = "human";
  player2.score = 0;
  player2.mode = "human";
  hints = true;

  emptyGameStateState();
  makeBoard();
  makecontrolPanel();
  initGame();
  console.log("Game State: ", gameState);
};

let startGame = function () {
  let squares = document.querySelectorAll(".square");
  for (let i = 0; i < squares.length; i++) {
    squares[i].addEventListener("click", clickHandler);
  }

  let button = document.querySelector("#button-dwim");
  button.removeEventListener("click", startGame);

  button.innerText = "Reset Game";
  button.addEventListener("click", setup);

  let p1Check = document.querySelector("#p1-auto");
  let p2Check = document.querySelector("#p2-auto");
  player1.mode = p1Check.checked ? "auto" : "human";
  player2.mode = p2Check.checked ? "auto" : "human";

  p1Check.disabled = true;
  p1Check.parentElement.classList.add("disabled");
  p2Check.disabled = true;
  p2Check.parentElement.classList.add("disabled");

  findValidSquares();

  if (player1.mode === "auto") {
    autoPlay();
  }
};

let toggleHints = function () {
  let hintButton = document.querySelector("#button-hint");
  hints = hints ? false : true;

  let stylesheets = document.styleSheets[0].cssRules;
  let index = 0;
  for ( i in stylesheets ) {
    if (stylesheets[i].selectorText === ".square.valid") {
      index = i;
    }
  }

  if (hints) {
    stylesheets[index].style.backgroundColor = "#e1ffe1";
  } else {
    stylesheets[index].style.backgroundColor = "white";
  }

  hintButton.innerText = "Hints: " + (hints ? "ON" : "OFF");

};

// Utility functions
let clickHandler = function () {
  if (currentPlayer.mode === "auto") {
    return;
  }
  let clickedSquare = event.target;
  playTurnAt(clickedSquare);
};

let flashSquare = function (squareObj) {
  squareObj.classList.add("flash");
  setTimeout (function () { squareObj.classList.remove("flash"); }, 2500);
  return;
};

let displayAlert = function (str, colour, timeout) {
  let timeoutInt = timeout || 0;
  let modal = document.querySelector(".modal");
  if (modal.firstChild !== null) {
  modal.removeChild(modal.firstChild);
  }

  let modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `<p>${str}</p>`;

  modal.appendChild(modalContent);
  modalContent.style.border = `92px solid ${colour}`;
  modal.style.display = "block";

  if (timerId) {
    clearTimeout(timerId);
  }

  if (timeout > 0) {
    timerId = setTimeout(
      function () {
        modal.style.display = "none";
      },
      timeoutInt
    );
  }

  window.onclick = function (event) {
    if (event.target === modal || event.target === modalContent) {
      modal.style.display = "none";
    }
  };
};

let makePiece = function (colour) {
  //helper subfunction to make the div for both sides of the image
  let makeSide = function (colour) {
    let side = document.createElement("div");
    side.classList.add(`piece-${colour}`);
    return side;
  };

  let piece = document.createElement("div");
  piece.classList.add("piece");
  piece.appendChild(makeSide("black"));
  piece.appendChild(makeSide("white"));

  piece.classList.add((colour === "black") ? "black" : "white" );

  return piece;
};

// Game state functions
let checkGame = function () {
  let validSquares = getValidSquares();
  if (validSquares.length === 0) {
    displayAlert(`No valid moves for ${currentPlayer.colour}, skipping turn`, "lightpink", 750);
    skipped.push(currentPlayer);
    if (skipped.length < 2) {
      changePlayer();
      return;
    } else {
      endGame();
    }
  }
};

let endGame = function () {
  let squares = document.querySelectorAll(".square");
  for (let i = 0; i < squares.length; i++) {
    squares[i].removeEventListener("click", clickHandler);
  }

  let outStr = "Game over!\n";
  if (player1.score > player2.score) {
    outStr += `Winner: ${player1.colour}, ${player1.score} pieces.`;
  } else if (player2.score > player1.score) {
    outStr += `Winner: ${player2.colour}, ${player2.score} pieces.`;
  } else {
    outStr += "Game ended in a draw.";
  }
  displayAlert(outStr, "lightblue");
};

// Turn-related helper functions
let updateScore = function () {
  player1.score = 0;
  player2.score = 0;
  let squares = document.querySelectorAll(".square");
  for (let i = 0; i < squares.length; i++) {
    let square = squares[i];
    if (square.firstChild === null) {
      continue;
    } else if (square.dataset.colour === "black") {
      player1.score++;
    } else {
      player2.score++;
    }

    let p1Score = document.querySelector("#p1-score");
    p1Score.innerText = player1.score;
    let p2Score = document.querySelector("#p2-score");
    p2Score.innerText = player2.score;
  }
};

let findValidSquares = function () {
  let squares = document.querySelectorAll(".square");
  for (let i = 0; i < squares.length; i++) {
    let checkSq = squares[i];

    // if the square is taken, it can't be played
    if (checkSq.firstChild !==null) {
      continue;
    }
    let squaresToFlip = {};
    for (let dir in VECTORS) {
      squaresToFlip[dir] = findSquaresToFlip(checkSq, VECTORS[dir]);
    }

    for (let dir in squaresToFlip) {
      if (squaresToFlip[dir].length > 0) {
        checkSq.classList.add("valid");
      }
    }
  }
};

let getValidSquares = function () {
  let validSquares = document.querySelectorAll(".valid");
  return validSquares;
};

let unsetValidSquares = function () {
  let validSquares = getValidSquares();
  for (let i = 0; i < validSquares.length; i++) {
    validSquares[i].classList.remove("valid");
  }
  return;
};

let findSquaresToFlip = function (squareObj, vec) {
  let squaresToFlip = [];
  let row = Number(squareObj.dataset.row);
  let col = Number(squareObj.dataset.col);

  //row and column to search in
  let sRow = row + vec.row;
  let sCol = col + vec.col;

  //for now, player and opponent colours
  let pColour = currentPlayer.colour;
  let oColour = (pColour === "black" ? "white" : "black");

  while ((sRow >= 0 && sRow < gridSize) &&
         (sCol >= 0 && sCol < gridSize)) {
    let searchSq = gameState[sRow][sCol];
//    let searchPc = searchSq.firstChild;

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

let flipSquares = function (sqArr) {
  let pcArr = [];
  for (let sq = 0; sq < sqArr.length; sq++) {
    let square = gameState[sqArr[sq][0]][sqArr[sq][1]];
    square.dataset.colour = currentPlayer.colour;
    pcArr.push(square.firstChild);
  }
  for (let i = 0; i < pcArr.length; i++) {
    setTimeout(flipPiece, i * 300, pcArr[i]);
  }
};

let flipPiece = function (pc) {
  pc.classList.toggle("white");
  pc.classList.toggle("black");
};

let changePlayer = function () {
  unsetValidSquares();

  currentPlayer = (currentPlayer === player1) ? player2 : player1;
  document.querySelector("#current-player").innerText = currentPlayer.colour;
  findValidSquares();

  checkGame();
};

let autoPlay = function () {
  let squares = getValidSquares();
  if (squares.length === 0) {
    return;
  }
  let i = Math.floor(Math.random() * squares.length);
  let squareToPlay = squares[i];
  setTimeout(playTurnAt, AUTODELAY, squareToPlay);
};

// main turn function
let playTurnAt = function (squareObj) {
  let playedSquare = squareObj;

  if (!playedSquare.classList.contains("valid")) {
    flashSquare(playedSquare);
    return;
  }

  skipped = [];
  let squaresToFlip = {};
  for (let dir in VECTORS) {
    squaresToFlip[dir] = findSquaresToFlip(playedSquare, VECTORS[dir]);
  }

  for (let dir in squaresToFlip) {
    if (squaresToFlip[dir].length > 0) {
      flipSquares(squaresToFlip[dir]);
    }
  }

  let piece = makePiece(currentPlayer.colour);
  playedSquare.dataset.colour = currentPlayer.colour;
  playedSquare.appendChild(piece);

  updateScore();
  changePlayer();
  if (currentPlayer.mode === "auto") {
    autoPlay();
  }
};

//Set up an empty grid and game on page load
document.addEventListener(
  "DOMContentLoaded",
  setup
);
