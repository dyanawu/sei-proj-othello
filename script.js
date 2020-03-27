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

var gridSize = 8;
var gameState = [];

var player1 = {
  colour: "black"
};

var player2 = {
  colour: "white"
};

var currentPlayer = player1;

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
  container.id = "game-board";

  for (var r = 0; r <gridSize; r++) {
    for (var c = 0; c < gridSize; c++) {
      var square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = `${r}`;
      square.dataset.col = `${c}`;
      gameState[r][c] = square;
      container.appendChild(square);
      square.addEventListener(
        "click",
        function () {
          playTurnAt(this.dataset.row, this.dataset.col);
        }
      );
    }
  }

  document.body.appendChild(container);
}

var makePiece = function (color) {
  /* game piece div
     <div class="piece">
     <div class="piece-black">
     <img src="./img/blackcircle.png">
     </div>
     <div class="piece-white">
     <img src="./img/whitecircle.png">
     </div>
     </div>
  */

}

var flipPiece = function (pc) {
  pc.classList.toggle("flipped");
}

var testFlips = function () {

  var piece = document.querySelector(".piece");
  for (var i = 0; i < 6; i++) {
    var newP = piece.cloneNode(true);
    document.querySelector("body").appendChild(newP);
  }

  var pieces = document.querySelectorAll(".piece");
  for (var i = 0; i < pieces.length; i++) {
    setTimeout(flipPiece, 250 * i, pieces[i]);
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function setup () {
    emptyGame();
    makeBoard();
    console.log(gameState);
  }
);
