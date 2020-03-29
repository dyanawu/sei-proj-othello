## Single-page Othello

1. Technologies used
2. Approach taken

    I had some existing knowledge coming into this - we'd already made a tictactoe game for homework, so I know at least that I can generate a grid of game cells, with coordinates as data attributes. This also means I can store the game state in an array of arrays, and look up the state of a given cell.

    a. Skim the rules because I remember being rubbish at this game, confirm being rubbish at this game

    Source: [Masters of Games](https://www.mastersofgames.com/rules/reversi-othello-rules.htm)

    b. Find out how to flip a single piece and write styles and functions for it elsewhere, then throw it away

    This wasn't too hard - a quick google turned up [a W3Schools tutorial](https://www.w3schools.com/howto/howto_css_flip_card.asp). All I really changed was the transform, from rotateY to rotate3d, for a diagonal flip axis, and a bit of CSS class twiddling, because I didn't want a 'flipped' state, but 'black' or 'white' states.

    c. Bring in my existing tictactoe grid generation function and modify it to generate the Othello grid instead

    I also updated the game state storage AoA to store object references to the created squares on the grid, instead of just strings representing the owner of the square. This greatly reduced the number of `querySelector`s I had to use throughout the rest of the code, since I could now refer to any cell node object (and hence manipulate it) on the grid with `gameState[r][c]` where `r` was the data attribute `row`, and `c` the data attribute `col`, populated during grid creation.

    d. Build game functionality

    As it turned out, placing pieces was not too difficult, just `appendChild` piece `div`s into each game cell object in `gameState`.

3. Install instructions

    [Play online](https://dyanawu.github.io/sei-proj-othello/)

4. Unsolved problems

    Finding all possible move locations and validity
