(function()  {
  angular
   .module('tttApp')
   .controller('tttController', tttController);

   // Inject firebase database
   tttController.$inject = ['$firebaseObject','$firebaseArray'];

   // ==============================
   // Angular Main Controller Function with Firebase database 
   // ==============================
   function tttController($firebaseObject, $firebaseArray) {
      // LOCAL variables
      // ------------------
      var tc = this;    // Controller reference variable
      var gameURL = "https://tictactoe-r2d2.firebaseio.com/";
      var name1='C-3PO';  // Default player 1 name
      var score1=0;       // Initialize score for player 1
      var name2='R2-D2';  // Default player 2 name
      var score2=0;       // Initialize score for player 2
      var image1='img/C-3PO.png'; // Default player 1 image
      var image2='img/R2-D2.png'; // Default player 2 image

      // Global variables declaration
      // -------------------
      tc.theme = 'Star Wars';  // for dynamic background change for future
      tc.dimention = 3;         // default : 3X3 
      tc.gameId = 0;            // used to identify game to join
      tc.ttt='';  // Points to https://tictactoe-r2d2.firebaseio.com/gameId
      tc.gameOver = false;   
      tc.selfPlayer = 1;   // Default: player 1 is self 
      
      // Global Fuction declaration
      // ---------------------------
      tc.selectCell = selectCell;
      tc.playAgain = playAgain;
      tc.updatePlayer = updatePlayer;
      tc.newGame = newGame;
      tc.joinGame = joinGame;


      //------------------
      // Program starts here / NEW GAME
      // -----------------
      newGame();

       // ---------------------------------------------- 
      // Initialize game board & get database pointers for game board & players
      // ---------------------------------------------- 
      function newGame() {
        // Get random game ID for a new game.
        // This number is displayed on screen and the second player
        // will use it to join the game after pressing 'Join game' button
        tc.gameId = Math.floor(Math.random() * 1000 );  
        
        score1=0; 
        score2=0;
        // Initialize game variables, players, and game variables using saved var
        initializeGame(name1,image1,score1,name2,image2,score2); // pointer to the game board
        initializeBoard();  // call after game is initialized

        // Initial message to wait for the second player        
        tc.ttt.game.message = 'waiting...';
        tc.ttt.$save(tc.ttt.game);
        
        tc.gameOver = false; // gameOver is only true if a winner is determined or the game is tied.
        tc.selfPlayer = 1;   // this player = player 1
      }

      // ---------------------------------------------- 
      // Join game using the game ID of another player 
      // Called from index.html upon 'Join Game' button is clicked
      // ---------------------------------------------- 
      function joinGame() {
        tc.gameId = prompt("Please enter the game ID to join.");

        // Attach to game & initialize game variables, players, and game variables using saved var
        initializeGame(name1,image1,score1,name2,image2,score2);
        initializeBoard();  // call after game is initialized
        
        // Set the game board message to Game On to start playing
        tc.ttt.game.message = 'Game on';
        tc.ttt.$save(tc.ttt.game);

        tc.gameOver = false;  // gameOver is only true if a winner is determined or the game is tied.
        tc.selfPlayer = 2;// joining player = player 2
      }

     /*---------------------
     // Play Again button pressed to reset the game board 
     // Called from index.html upoin 'Play Again' buton is clicked
     //--------------------*/
     function playAgain() {
        // Save current game variables to reinitialize the game board &
        // players using current scores, player names 
        name1 = tc.ttt.player1.name;
        name2 = tc.ttt.player2.name;
        image1 = tc.ttt.player1.image;
        image2 = tc.ttt.player2.image;
        score1 = tc.ttt.player1.score;
        score2 = tc.ttt.player2.score;

        // Reset the game variables, players, and game variables using saved var
        initializeGame(name1,image1,score1,name2,image2,score2);
        initializeBoard();  // call after game is initialized

        // Reset game variables
        tc.ttt.game.winner = '';
        tc.ttt.game.message = '';
        tc.ttt.game.cellsOccupied = 0;
        tc.ttt.$save(tc.ttt.game);

        tc.gameOver = false;
     }
     /*---------------------
      * Called from index.html upon a box is clicked
      * Checks if game is already over.  
      * If not, checks the cell to ensure it's not already marked.
      * Mark the cell and determine if it's a winning combination.  
      * If no win, continue playing - switch currentPlayer
      * If there is a winner, display the message and raise the score
      --------------------*/
      function selectCell($index) {
         // initially whoever clicks first will be the current player
         if (tc.ttt.game.cellsOccupied === 0) { 
            tc.ttt.game.currentPlayerNum = tc.selfPlayer;  
         }
         // perform only if winner is not found yet
         if (!tc.ttt.game.winner) {
            if (emptyCell($index)) {   // check if the cell has not been marked
                markCell ($index);   // mark the board with current player's image
                tc.ttt.game.winner = getWinner();  // determine winner
                tc.ttt.game.message = '';
                tc.ttt.$save(tc.ttt.game);

                // If no winner, switch current player to nxt player & keep going 
                // if game is tied, display the 'Tie' message and end game
                // If there is winner, increment score for the current player and display message
                if (!tc.ttt.game.winner)  
                  switchPlayer();
                else {
                  if(tc.ttt.game.winner === 'Tie') {  // game is tied
                    displayMessage('Tie');
                  }
                  else {   // we have a winner
                    addScore(tc.ttt.game.currentPlayerNum);
                    displayMessage(tc.ttt.game.winner);
                  }
                  // Reset game variables for the next round
                  tc.ttt.game.winner = '';
                  tc.ttt.game.cellsOccupied = 0;
                  tc.ttt.$save(tc.ttt.game);
                }
            }
         }
      }  

      /**
       * [markCell : Mark the selected cell if not taken]
       * @param  {[int]} $index [index of selected cell]
       */
      function markCell($index) {
        if (tc.ttt.game.currentPlayerNum === 1) {
          tc.ttt.board[$index].image = tc.ttt.player1.image;// currentPlayer.image;
          tc.ttt.board[$index].marker = tc.ttt.player1.marker; //currentPlayer.marker;
        }
        else {
          tc.ttt.board[$index].image = tc.ttt.player2.image;// currentPlayer.image;
          tc.ttt.board[$index].marker = tc.ttt.player2.marker; //currentPlayer.marker; 
        }
        tc.ttt.board[$index].displayImage = true;
        tc.ttt.$save(tc.ttt.board[$index]);
        tc.ttt.game.cellsOccupied++ ;
        tc.ttt.$save(tc.ttt.game);
        // for future nXn board - mark w dimentional score board with the player marker 
        // var r = cell.rowcol.substr(0,1);
        // var c = cell.rowcol.substr(1,1);
        // tc.scoreBoard[row][col] = currentPlayer.marker;
      }

      // Next player's turn
      function switchPlayer() {
        tc.ttt.game.currentPlayerNum =  (tc.ttt.game.currentPlayerNum === 1 ? 2 : 1);
        tc.ttt.$save(tc.ttt.game);
      }

      // Add score to the current player who won
      function addScore(playerNum) {
        if (playerNum === 1) {
           tc.ttt.player1.score ++;
           tc.ttt.$save(tc.ttt.player1);
        }
        else{
           tc.ttt.player2.score ++;
           tc.ttt.$save(tc.ttt.player2);
        }
      }

      //-----------------------
      // Called from index.html upon player name/image is changed
      // Update name & image of a player if changed -> called from index.html
      // ----------------------
      function updatePlayer(playerNum,name,image) {
          if (playerNum === 1) {
            tc.ttt.player1.name = name;
            tc.ttt.player1.image = image;
            tc.ttt.$save(tc.ttt.player1);
          } else {
            tc.ttt.player2.name = name;
            tc.ttt.player2.image = image;
            tc.ttt.player2.initiated=true;
            tc.ttt.$save(tc.ttt.player2);
          }
      }

      //----------------------------------
      //Initialize the game board, players, and game variables in firebase
      //and get pointers to the database objects
      //----------------------------------
      function initializeGame(name1,image1,score1,name2,image2,score2) {
        var URL = gameURL + tc.gameId;
        var ref =  new Firebase(URL);

        // tc.ttt points to  thefirebase game objects 
        tc.ttt = $firebaseObject(ref); 

        //Game variables   
        //---------------
        // cellsOccupied: used to determine whether the game is tied without a winner
        //                cellsOccupied will increment when a box is selected
        // theme and game: for future -- used for background image selection     
        // winner : holds the winner's name if there is a einner else ''.
        // message: holds game progress messages  (waiting, game on, winner is ...)
        tc.ttt.game = { "cellsOccupied": 0,    "theme"  : "Star Wars",
                          "dimention" : 3,     "game" : "img/StarWarsBackground.png",
                          "winner" : '',       "message": "",  
                          "gameId": tc.gameId, "currentPlayerNum" : 1} ;
        tc.ttt.$save(tc.ttt.game);

        // Player 1 info
        tc.ttt.player1 = { "autoPlay" : false,  
                  "image" : image1,
                  "marker" : 'X',
                  "name" : name1,  
                  "playerNum" : 1,
                  "score" : score1} ;
        tc.ttt.$save(tc.ttt.player1);
 
        // Player 2 info
        tc.ttt.player2 = { "autoPlay" : false,  
                  "image" : image2,
                  "marker" : 'O',
                  "name" : name2,  
                  "playerNum" : 2,
                  "score" : score2
                };         
        tc.ttt.$save(tc.ttt.player2);
    }
    //-----------------------------
    // INitialize 3X3 GAME BOARD and save in firebase
    // --------------
    // aRowCol serves as index for nXn scoreboard for future
    // image will store player images upon clicking
    // marker will store X for player 1 O for player 2 -> used for winner determination in getWinner()
    // winningCell will be true for cells used to determine the winner
    // -----------------------------
    function initializeBoard() {
        tc.ttt.board = [
              {"aRowCol": "00", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "01", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "02", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "10", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "11", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "12", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "20", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "21", "image": '', "marker": '',"winningCell": false },
              {"aRowCol": "22", "image": '', "marker": '',"winningCell": false }
              ];
        tc.ttt.$save(tc.ttt.board);
    }
    //------------------------
    //Check if cell is already occupid
    //------------------------
    function emptyCell(index) {
      return (tc.ttt.board[index].marker==='');
    }

    //-------------------------
    // Display win or tie message
    //--------------------------
    function displayMessage(winner) {
      tc.ttt.game.message = ((winner === 'Tie') ? "Game is tied!  Try again!" :
                                           winner + " wins the game!");
      tc.ttt.$save(tc.ttt.game);
    }

    //-------------------------
    // determine if game is a tie: if the number of cells clicked equal the total game cells, it's a tie
    //-------------------------
    function isGameTie() {
      return ((tc.ttt.game.cellsOccupied) === (tc.ttt.game.dimention * tc.ttt.game.dimention)) ;
    }

    //-------------------------
    // Determine winner and return winner name
    // If the game is tied, return 'Tie, 
    // If no winner, returns '' (no winner).
    // Game is over if there is any row, column or diagonal line has a winner.
    // 0 1 2
    // 3 4 5
    // 6 7 8
    // ----------------------
   function getWinner() {
        
      if  ((tc.ttt.board[0].marker === tc.ttt.board[1].marker ) &&
           (tc.ttt.board[0].marker === tc.ttt.board[2].marker ) &&
           (tc.ttt.board[0].marker !== '') ) {
          // Save winning cells to highlight the cells once game is over (for future)
          tc.ttt.board[0].winningCell = true;
          tc.ttt.board[1].winningCell = true;
          tc.ttt.board[2].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
        }
      else if 
         ((tc.ttt.board[3].marker === tc.ttt.board[4].marker ) &&
          (tc.ttt.board[3].marker === tc.ttt.board[5].marker ) &&
          (tc.ttt.board[3].marker !== '') ) {
          tc.ttt.board[3].winningCell = true;
          tc.ttt.board[4].winningCell = true;
          tc.ttt.board[5].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         }
      else if   
         ((tc.ttt.board[6].marker === tc.ttt.board[7].marker ) &&
          (tc.ttt.board[6].marker === tc.ttt.board[8].marker )  &&
          (tc.ttt.board[6].marker !== '' ) ) {
          tc.ttt.board[6].winningCell = true;
          tc.ttt.board[7].winningCell = true;
          tc.ttt.board[8].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         }
      else if 
         ((tc.ttt.board[0].marker === tc.ttt.board[3].marker ) &&
          (tc.ttt.board[0].marker === tc.ttt.board[6].marker ) &&
          (tc.ttt.board[0].marker !== '') ) {
          tc.ttt.board[0].winningCell = true;
          tc.ttt.board[3].winningCell = true;
          tc.ttt.board[6].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         }
      else if 
         ((tc.ttt.board[1].marker === tc.ttt.board[4].marker ) &&
          (tc.ttt.board[1].marker === tc.ttt.board[7].marker ) &&
          (tc.ttt.board[1].marker !== '') ) {
          tc.ttt.board[1].winningCell = true;
          tc.ttt.board[4].winningCell = true;
          tc.ttt.board[7].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         }
      else if   
         ((tc.ttt.board[2].marker === tc.ttt.board[5].marker ) &&
          (tc.ttt.board[2].marker === tc.ttt.board[8].marker ) &&
          (tc.ttt.board[2].marker !== '') ) {
          tc.ttt.board[2].winningCell = true;
          tc.ttt.board[5].winningCell = true;
          tc.ttt.board[8].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         } 
      else if 
         ((tc.ttt.board[0].marker === tc.ttt.board[4].marker ) &&
          (tc.ttt.board[0].marker === tc.ttt.board[8].marker ) &&
          (tc.ttt.board[0].marker !== '') ) {
          tc.ttt.board[0].winningCell = true;
          tc.ttt.board[4].winningCell = true;
          tc.ttt.board[8].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         }
      else if   
         ((tc.ttt.board[2].marker === tc.ttt.board[4].marker ) &&
          (tc.ttt.board[2].marker === tc.ttt.board[6].marker ) &&
          (tc.ttt.board[2].marker !== '') ) {
          tc.ttt.board[2].winningCell = true;
          tc.ttt.board[4].winningCell = true;
          tc.ttt.board[6].winningCell = true;
          tc.ttt.$save(tc.ttt.board);
          tc.gameOver = true;
         }

       // If any row/col/diagonal cells are owned by a single player, game is over 
       // return the gamer's name 
       // If no winner but the game is tied, return Tie
       // Otherwise return ''
       if (tc.gameOver) {
          tc.ttt.game.winner = (tc.ttt.game.currentPlayerNum === 1 ? tc.ttt.player1.name : tc.ttt.player2.name);
       }
       else if (isGameTie()) {
          tc.ttt.game.winner = 'Tie'; // game is tied
       }
       else {
          tc.ttt.game.winner =  '';
       }

        //If game is won or tied, save & return the winner name
        tc.ttt.$save(tc.ttt.game);
        return tc.ttt.game.winner;
 
        /**
         * The following logic is reserved for nXn game
         */
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
    }
  /**********************
   * The following functions are reserved for nXn game
   **********************/
    // Initialize blank score board - for future nXn board
    // function initializeScoreBoard() {
    //   var board = [];
    //   var row = [];
    //   // Initialize board cells in rows
    //   for (var i=0; i< tc.dimention; i++) {
    //      row.push('');
    //   }
    //   // Create two-dimentional tic-tac-toe board
    //   for (i=0; i< tc.dimention; i++) {
    //     board.push(row);
    //   }
    //   return board;
    // }
    
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
    } 
    /**
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



    }
})();

