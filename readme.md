## Single-page Othello

### 1. Technologies used

   This project was written in HTML/CSS/JavaScript.

### 2. Approach taken

   I had some existing knowledge coming into this - we'd already made a tictactoe game for homework, so I know at least that I can generate a grid of game cells, with coordinates as data attributes. This also means I can store the game state in an array of arrays, and look up the state of a given cell.


1. Skim the rules because I remember being rubbish at this game, confirm being rubbish at this game

    Sources:

    1. [Ultra Board Games](https://www.ultraboardgames.com/othello/game-rules.php)
    2. [Masters of Games](https://www.mastersofgames.com/rules/reversi-othello-rules.htm)

2. Find out how to flip a single piece and write styles and functions for it elsewhere, then throw it away

    This wasn't too hard - a quick google turned up [a W3Schools tutorial](https://www.w3schools.com/howto/howto_css_flip_card.asp). All I really changed was the transform, from rotateY to rotate3d, for a diagonal flip axis, and a bit of CSS class twiddling, because I didn't want a 'flipped' state, but 'black' or 'white' states.

3. Bring in my existing tictactoe grid generation function and modify it to generate the Othello grid instead

    I also updated the game state storage AoA to store object references to the created squares on the grid, instead of just strings representing the owner of the square. This greatly reduced the number of `querySelector`s I had to use throughout the rest of the code, since I could now refer to any cell node object (and hence manipulate it) on the grid with `gameState[r][c]` where `r` was the data attribute `row`, and `c` the data attribute `col`, populated during grid creation. (_If I want to work on the entire grid, it's actually easier to `querySelectorAll` the squares, then loop once over that resulting array. It's still 64 operations either way, but at least if I break something in this loop it's easier to debug with just one counter variable!_)

4. Build game functionality

    As it turned out, placing pieces was not too difficult, just `appendChild` piece `div`s into each game cell object in `gameState`. Alternating between inputs was also simple enough, by keeping `currentPlayer` updated on each turn played. The detection of invalid moves basically was the same algorithm as for finding opponent pieces to flip:

        - given an origin and a vector (representing the number of rows/columns to move for each step):
          - search in the next square according to the vector
            - if the edge of the board is encountered, return an empty array
            - if an empty square is encountered, return an empty array
            - if an opponent piece is encountered, record that piece to be flipped,
              and proceed to the next square to search
            - if own piece is encountered, end search and return whatever was previously recorded

          - repeat above, for each direction (8 directions in total)

    Once I had an array of arrays of pieces to flip, I could then determine if a selected square was valid: if all arrays were empty, the move was invalid.

    Now I had another problem: what if a player just didn't have any valid moves left? Okay, that would be trivial enough to detect - I could grab all pieces marked valid previously, and if that was a 0-length list, clearly a player is stuck. I could then skip that player's turn with the same player change mechanism as for alternating inputs. If I have to change over for both players without any moves being made in the meantime, then the game would be over and I could proceed to announce a winner.

    A pretty value-for-money thing to implement once there was an ability to find valid moves was an autoplay - not an intelligent one, just a random one. All this took was `Math.random()`-ly selecting a valid square to play on, then calling the usual turn play function. (_Side and entertaining note: setting `const AUTODELAY` to 0 and both players to autoplay makes for an instantaneous game. Potential applications in screensaver generation?_)

5. Fix bugs

    Among the more interesting bugs was related to the game reset button: if a user tries to reset the game when both colours are being autoplayed, the game continues running while the control pane resets. Hitting start and then reset again then actually ends the game. What I think was happening was that the autoplay would already have queued an autoplay event, which would play _after_ the reset button had been clicked, then continue triggering additional turns. What solved it was adding a global variable to track the autoplay event's timer ID, which then allowed a reset game function to clear any existing timer before setting both colours to human mode, and calling the usual game setup functions. There was some experimentation that led me to think the timer was the issue, like - throwing up a modal to pretend work was being done, then delaying the call of the setup functions by longer than `AUTODELAY` seemed to also solve it, but was discarded for being brittle.

### 3. Install instructions

[Play online](https://dyanawu.github.io/sei-proj-othello/)

### 4. Unsolved problems

I originally really wanted to make pieces flip in the direction of play (i.e., away from the played piece), but this turned out to be really involved. The last thing I tried was using CSS animations instead of transitions, which _sort_ of worked, but turned out pretty glitchy. An partial implementation of directional flipping (one direction only) can be found in the `css-foolery` branch.