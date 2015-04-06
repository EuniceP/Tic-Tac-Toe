(function()  {
  angular
   .module('tttApp')
   .controller('tttController', tttController);

   function tttController() {
      // LOCAL variables
      var tc = this;
      var currentPlayer;

      // Global variables declaration
      // -------------------
      tc.theme = 'Star Wars';
      tc.dimention = 3;
      tc.imgDir = "img/";
      tc.scoreBoard = [];  // use to scoring for the n-dimentional board - this var is abondaned
      tc.gameBoard = [];   // keeps track of game progress - used to display on screen
      tc.message = '';    // win/tie message
      tc.showMessage = false; // only true when game is over
      tc.gameId = 0;      // used to identify game to join
      tc.winningCells=[]; // use to highlight winning cells at end of game
      tc.playerName1="C-3PO";
      tc.playerName2="R2-D2";
      tc.game=null;

      // Global Fuction declaration
      // ---------------------------
      tc.selectCell = selectCell;
      tc.playAgain = playAgain;

      //------------------------------
      // Program starts here
      // ----------------------------
       init();


       //---------------------------
      // Create player and game objects
      //---------------------------
      function init() {
        // if new game, create blank game board, else set existing game board
        if (tc.gameId === 0) {
          tc.gameId = Math.floor(Math.random() * 1000); // new gameId

          tc.dimention = (tc.dimention || 3) ;
          tc.theme = (tc.theme = 'Star Wars');
 
          tc.playerName1 = (tc.playerName1 || "C-3PO");
          tc.playerName2 = (tc.playerName2 || "R2-D2");

          // Initialize player list with mascots.  
          // Last argument is for 1-person game with a computer (autoPlay=true)
          tc.player1 = new Player(tc.playerName1, 1, 'X',
                               "img/"+ tc.playerName1 + ".png", false);
          tc.player2 = new Player(tc.playerName2, 2, 'O',
                               "img/"+ tc.playerName2 + ".png", false);
  
          currentPlayer = tc.player1;

          // Initialize game board and global variables
          tc.game  = new Game(tc.theme, tc.dimention);  
          tc.gameBoard  = initializeGameBoard();
          tc.scoreBoard = initializeScoreBoard();
        }
        // else {
        //   getGame();
        // }
      }
      


    /*
    // Play Again button pressed to reset the game board
     */
    function playAgain() {
      // Reset game board
      tc.game = new Game(tc.theme,tc.dimention);
  //   console.log(tc.game); 
      tc.gameBoard = null;
      tc.gameBoard = initializeGameBoard(); //resetGameBoard();

      tc.message = '';
      tc.showMessage = false;
      tc.winningCells=[];
      tc.player1.changeImage (tc.imgDir + img1 + '.png');  // Change players' mascots if desired
      tc.player2.changeImage (tc.imgDir + img2 + '.png');
      currentPlayer = tc.player1;
      location.redraw();
    }

    //--------------------- 
    // Define Game object with properties & methods
    //--------------------- 
    function Game(theme, dimention) {
      var g = this;
      g.cellsOccupied = 0;
      g.theme = theme;
      g.dimention = dimention;
      g.maxCells  = dimention * dimention;
      // background image is modified dynamically
      g.backgroundImg = tc.imgDir + g.theme.replace(' ','') + "Background.png";
      g.winner = '';
    }

    function resetGameBoard() {
      for (i=0; i<tc.dimention;i++) {
          tc.gameBoard.image = '';
          tc.gameBoard.marker = '';
          tc.gameBoard.displayImage = false;
          tc.gameBoard.win = false;
      }

        for (i =0; i< tc.dimention ; i++) 
          for (j =0; j <tc.dimention; j++)
            tc.scoreBoard[i][j]='';

        tc.game.backgroundImg = tc.imgDir + tc.theme.replace(' ','') + "Background.png";
        tc.game.winner = '';
        return tc.gameBoard;

      }  
    //initialize the board to empty (zero) - players will have 1 or 2 when box selected
    function initializeGameBoard() {
        var rowcol; 
        var gameBoard=[];
        for (var i=0; i< tc.dimention; i++) {
          for (var j=0; j< tc.dimention; j++) {
            rowcol = i.toString() + j.toString();
            gameBoard.push({rowcol : rowcol, 
                           image  : "", 
                           class  : 'cell', 
                           marker : '',  // filled in when player selects cell
                           displayImage:false, //true when player selects cell
                           win    : false }); //true when GAME won

          }
        }
     
        return gameBoard;
    }

    // blank score board
    function initializeScoreBoard() {
      var board = [];
      var row = [];
      // Initialize board cells in rows
      for (var i=0; i< tc.dimention; i++) {
         row.push('');
      }
      // Create two-dimentional tic-tac-toe board
      for (i=0; i< tc.dimention; i++) {
        board.push(row);
      }
      return board;
    }
    
    
    //--------------------- 
    // Define player object with properties & methods:
    //    name, image to display in cells, and initial scores
    //-------------------
    function Player(name,playerNum,marker,image,autoPlay) {
      var p = this;
      p.name = name;
      p.playerNum = playerNum; // 1 or 2 
      p.marker = marker;       // X or O   
      p.image = image;
      p.score = 0;
      p.autoPlay = autoPlay;
      
      p.addScore = (function() {
        p.score += 1;
      });
      p.resetScore = (function() {
        p.score = 0;
      });
      p.changeImage = (function(img) {
        p.image = img;
      });

    } 
    /*  Called from index.html upon a box is clicked
    Checks if game is already over.  
    If not, checks the cell to ensure it's not already marked.
    Mark the cell and determine if it's a winning combination.  
    If no win, continue playing - switch currentPlayer
    If there is a winner, display the message and raise the score
     */
    function selectCell(cell) {
      // perform only if winner is not found yet
      if (!tc.game.winner) {
          if (emptyCell(cell)) {
              markCell (cell);
              tc.game.winner = getWinner(); 
              
              if (!tc.game.winner)  // no winner
                switchPlayer();
              else {
                if(tc.game.winner === 'Tie') {
                  displayMessage();
                }
                else { 
                  currentPlayer.addScore();
                  displayMessage();
                }
                
              }
          }
        }
    }
    //Check if cell is already occupid
    function emptyCell(cell) {
      return (cell.marker==='');
    }
    // Mak the cell with the currentplayer's marker
    // --> This to be examined later for the score board!
    function markCell(cell,row,col) {
        cell.image = currentPlayer.image;
        cell.marker = currentPlayer.marker;
        cell.displayImage = true;
        tc.game.cellsOccupied++ ;
        row = cell.rowcol.substr(0,1);
        col = cell.rowcol.substr(1,1);
        //mark w dimentional score board with the player marker
        // tc.scoreBoard[row][col] = currentPlayer.marker;
    }
    // Next player's turn
    function switchPlayer() {
      currentPlayer = ((currentPlayer.playerNum === 1) ? tc.player2 : tc.player1); 
    }
    // Display either win or tie on screen
    function displayMessage() {
      tc.message = "Game Over. " + 
                  ((tc.game.winner === 'Tie') ? "We have a tie!  Try again!" :
                                          tc.game.winner + " wins!");
      tc.showMessage = true;
    }
    // check if the board is filled but no winner
    function isGameTie() {
      if (tc.game.cellsOccupied === tc.game.maxCells) 
        return true;
      else return false;
    }
    /**
   * Check if row has a Winner 
   * @param  {[array]} row [one row array]
   * @return {[boolean]}     [true if there is a winner else false]
   */
    function winnerInRow(board, rowIdx) {
      var winningCells = [];
      for (var j = 0; j<board.length; j++) {
        if ((board[rowIdx][0] !== '') && (board[rowIdx][0] === board[rowIdx][j])) // compare column 0 in each row to other columns
          winningCells.push(rowIdx.toString() + j.toString());
        else  
          return false;   // not match
      }
      return winningCells;
    } /**
   * Check if a column with given column index ( 0 through lengh) has a Winner 
   * @return {[boolean]}     [true if there is a winner else false]
   */
    function winnerInColumn(board,colIdx) {
      var winningCells = [];
      for (var i = 0; i < board.length; i++) {
        if ((board[rowIdx][0] !== '') &&(board[0][colIdx] === board[i][colIdx]) )
          winningCells.push(i.toString() + colIdx.toString());
        else
           return false;
      }
      return winningCells;
    }

  /**
   * Check if diagonal (left top to right bottom) has a Winner 
   * @return {[boolean]}     [true if there is a winner else false]
   */
   function winnerInDiag1(board) {
      var winningCells = [];
      for (var i = 0; i < board.length; i++) {
        if ((board[rowIdx][0] !== '') && ( board[0][0] === board[i][i] ) )
          winningCells.push(i.toString() + i.toString());
        else
          return false;
      }
    }
    // check top right corner to bottom left
   function winnerInDiag2(board) {
      var winningCells = [];
      for (var i = 0; i < board.length; i++) {
        if ((board[rowIdx][0] !== '') && (board[0][board.length-1] === board[i][board.length-i-1] ) )
          winningCells.push(i.toString() + (board.length-i-1).toString());
        else
          return false;
      }
      return winningCells;
    }

    // Determine if there is any row, column or diagonal line has a winner.
    // If so return the winner (1 or 2).  If not, returns 0 (no winner).
    // 0 1 2
    // 3 4 5
    // 6 7 8
    function getWinner() {
  
      if  ((tc.gameBoard[0].marker === tc.gameBoard[1].marker ) &&
           (tc.gameBoard[0].marker === tc.gameBoard[2].marker ) &&
           (tc.gameBoard[0].marker !== '') ) {
          tc.winningCells.push(0);
          tc.winningCells.push(1);
          tc.winningCells.push(2);
        }
      else if 
         ((tc.gameBoard[3].marker === tc.gameBoard[4].marker ) &&
           (tc.gameBoard[3].marker === tc.gameBoard[5].marker )  &&
           (tc.gameBoard[3].marker !== '') ) {
          tc.winningCells.push(3);
          tc.winningCells.push(4);
          tc.winningCells.push(5);
         }
      else if   
         ((tc.gameBoard[6].marker === tc.gameBoard[7].marker ) &&
          (tc.gameBoard[6].marker === tc.gameBoard[8].marker )  &&
          (tc.gameBoard[6].marker !== '' ) ) {
          tc.winningCells.push(6);
          tc.winningCells.push(7);
          tc.winningCells.push(8);
         }
      else if 
         ( (tc.gameBoard[0].marker === tc.gameBoard[3].marker ) &&
           (tc.gameBoard[0].marker === tc.gameBoard[6].marker ) &&
           (tc.gameBoard[0].marker !== '' ) ) {
          tc.winningCells.push(0);
          tc.winningCells.push(3);
          tc.winningCells.push(6);
        }
      else if 
         ((tc.gameBoard[1].marker === tc.gameBoard[4].marker ) &&
          (tc.gameBoard[1].marker === tc.gameBoard[7].marker )  &&
          (tc.gameBoard[1].marker !== '' ) ) {
          tc.winningCells.push(1);
          tc.winningCells.push(4);
          tc.winningCells.push(7);
         }
      else if   
         ((tc.gameBoard[2].marker === tc.gameBoard[5].marker ) &&
          (tc.gameBoard[2].marker === tc.gameBoard[8].marker ) &&
          (tc.gameBoard[2].marker !== '' ) ) {
          tc.winningCells.push(2);
          tc.winningCells.push(5);
          tc.winningCells.push(8);
         }
      else if 
         ((tc.gameBoard[0].marker === tc.gameBoard[4].marker ) &&
          (tc.gameBoard[0].marker === tc.gameBoard[8].marker )  &&
          (tc.gameBoard[0].marker !== '' ) ) {
          tc.winningCells.push(0);
          tc.winningCells.push(4);
          tc.winningCells.push(8);
         }
      else if   
         ((tc.gameBoard[2].marker === tc.gameBoard[4].marker ) &&
          (tc.gameBoard[2].marker === tc.gameBoard[6].marker )  &&
          (tc.gameBoard[2].marker !== '' ) ) {
          tc.winningCells.push(2);
          tc.winningCells.push(4);
          tc.winningCells.push(6);
         }


        // // check row
        // for (var i=0; i < tc.dimention; i++) {
        //    tc.winningCells = winnerInRow(tc.scoreBoard,i);
        // }
        // // Check each column
        // if (tc.winningCells.length === 0) {
        //   for (var i = 0; i < tc.dimention; i++ ) {
        //      tc.winningCells = winnerInColumn(tc.scoreBoard,i); //  winner in column
        // } }

    
        // // Check diagonal from left top to right bottom
        // if (tc.winningCells.length === 0) 
        //   tc.winningCells = winnerInDiag1(tc.scoreBoard); 

        // // Check diagonal from right top to left bottom 
        // if (tc.winningCells.length === 0) 
        //   tc.winningCells = winnerInDiag2(tc.scoreBoard);

        if (tc.winningCells.length > 0) {
          
            return currentPlayer.name; 
        }
        else if ((tc.winningCells.length === 0) && (isGameTie()))
          return 'Tie'; // game is tied
        else return ''; // no winner yet
    }



    }
})();

