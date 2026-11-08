# Échecs (Chess)

Play chess against the computer, from beginner to grandmaster level. Every rule is enforced, the game is recorded move by move, and the current game resumes where you left it, even on another PC.

*Version française : [README.md](README.md)*

## How to play

- **Click a piece** then its destination square, or **drag it**.
- When a pawn reaches the last rank, choose its **promotion**: queen, rook, bishop or knight.
- **Undo** takes back your last move (and the computer's reply).
- **New game** starts over; the colour list chooses **I play white**, **I play black** or **Random colour**. White moves first.
- Changing the **level** during a game applies at once, without restarting.

## The rules

All official rules are handled: kingside and queenside **castling**, **en passant**, promotion, and never leaving your king in check. The game announces "Check!" when your king is attacked.

The game ends with:

- **checkmate**: the king is attacked and cannot escape;
- **stalemate** (draw): the player to move has no legal move and is not in check;
- **50-move rule** (draw): 50 moves by each side without a capture or a pawn move;
- **threefold repetition** (draw): the same position occurs three times;
- **insufficient material** (draw): not enough pieces left to checkmate.

## The levels

Beginner, Easy, Medium, Hard, Expert, Master and Grandmaster. The first three look only a few moves ahead, and Beginner and Easy make deliberate mistakes; from Hard onwards the computer searches for the best move without errors, with more and more thinking time (up to 15 seconds per move).

## During the game

The **Moves** panel lists the game in **French notation**: R king (roi), D queen (dame), T rook (tour), F bishop (fou), C knight (cavalier). The header shows your wins, draws and losses at the chosen level.

## Data and sync

Your statistics per level and the current game are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Échecs → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
