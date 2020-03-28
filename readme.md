## Single-page Othello

1. Technologies used
2. Approach taken
  * Problem breakdown

    Existing knowledge: tictactoe grid, the idea of using an array of arrays to store game state

    Things I did:

    1. Skim the rules, because I remember being rubbish at this game. Confirmed I am rubbish at this game.

      Sources:

      1. https://www.mastersofgames.com/rules/reversi-othello-rules.htm

    2. Find out how to flip a single piece and write styles and functions for it elsewhere, then throw it away.
    3. Bring in my existing tictactoe grid generation function and modify it to generate the Othello grid instead. I also updated the game state storage AoA to store object references to the created squares on the grid, instead of just strings representing the owner of the square.
    4. Write helper functions (at least signatures):
      * something to flip individual pieces
      * something that will eventually flip an array of pieces
      * something to find pieces to flip (this doubles as checking if a played move is valid, because Rules.

3. Install instructions
4. Unsolved problems
5. TODO
