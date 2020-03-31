## Single-page Othello

1. Technologies used
2. Approach taken

    I had some existing knowledge coming into this - we'd already made a tictactoe game for homework, so I know at least that I can generate a grid of game cells, with coordinates as data attributes. This also means I can store the game state in an array of arrays, and look up the state of a given cell.

    a. Skim the rules because I remember being rubbish at this game, confirm being rubbish at this game

    Source:

    1. [Ultra Board Games](https://www.ultraboardgames.com/othello/game-rules.php)
    2. [Masters of Games](https://www.mastersofgames.com/rules/reversi-othello-rules.htm)

    b. Find out how to flip a single piece and write styles and functions for it elsewhere, then throw it away

    This wasn't too hard - a quick google turned up [a W3Schools tutorial](https://www.w3schools.com/howto/howto_css_flip_card.asp). All I really changed was the transform, from rotateY to rotate3d, for a diagonal flip axis, and a bit of CSS class twiddling, because I didn't want a 'flipped' state, but 'black' or 'white' states.

    c. Bring in my existing tictactoe grid generation function and modify it to generate the Othello grid instead

    I also updated the game state storage AoA to store object references to the created squares on the grid, instead of just strings representing the owner of the square. This greatly reduced the number of `querySelector`s I had to use throughout the rest of the code, since I could now refer to any cell node object (and hence manipulate it) on the grid with `gameState[r][c]` where `r` was the data attribute `row`, and `c` the data attribute `col`, populated during grid creation.

    d. Build game functionality

    As it turned out, placing pieces was not too difficult, just `appendChild` piece `div`s into each game cell object in `gameState`. Alternating between inputs was also simple enough, by keeping `currentPlayer` updated on each turn played. The detection of invalid moves basically was the same algorithm as for finding opponent pieces to flip:

       - given an origin and a vector (representing the number of rows/columns to move for each step):
         - search in the next square according to the vector
            - if the edge of the board is encountered, return an empty array
            - if an empty square is encountered, return an empty array
            - if an opponent piece is encountered, record that piece to be flipped in an array and proceed to the next square to search
            - if own piece is encountered, end search and return whatever was previously recorded

       - repeat above, for each direction (8 directions in total)


    Once I had an array of arrays of pieces to flip, I could then determine if a selected square was valid: if all arrays were empty, the move was invalid.

    This is great! But now I have another problem: what if a player just does not have any valid moves left? Okay, that's trivial enough to detect - I can grab all pieces marked valid previously, and if that's a 0-length list, clearly a player is stuck. I then mark that player as having skipped their turn, and change over. If I have to change over for both players without any moves being made in the meantime, then the game is over.

3. Install instructions

    [Play online](https://dyanawu.github.io/sei-proj-othello/)

4. Unsolved problems

    I originally really wanted to make pieces flip in the direction of play (i.e., away from the played piece), but this turned out to be really involved.
