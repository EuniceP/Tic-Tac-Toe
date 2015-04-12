(function()  {
  angular
   .module('tttApp')
   .controller('tttController', tttController);

   // Inject firebase database
   tttController.$inject = ['$firebaseObject','$firebaseArray'];
 
   // Angular Main Controller Function with Firebase database 
   function tttController($firebaseObject, $firebaseArray) {
      // LOCAL variables
      var tc = this;
      var selfPlayer = [];
      var gameURL = "https://tictactoe-r2d2.firebaseio.com/";
      var name1='C-3PO';
      var score1=0;
      var name2='R2-D2';
      var score2=0;
      var image1='img/C-3PO.png';
      var image2='img/R2-D2.png';


      // Global variables declaration
      // -------------------
      tc.theme = 'Star Wars'; // for dynamic background change
      tc.dimention = 3;       // default : 3X3 
      tc.message = '';     // win/tie message at end of game
      //tc.showMessage = false; // only true when game is over to disply message
      tc.gameId = 0;      // used to identify game to join
      tc.ttt='';  // Points to https://tictactoe-r2d2.firebaseio.com/gameId
      tc.gameIdInfo = "";
      tc.gameOver = false;
      
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
      // Get database pointers for game board & players
      // ---------------------------------------------- 
      function newGame() {
        // Use the gameId to join game
        tc.gameId = Math.floor(Math.random() * 10 );  
        
        initializeGame(name1,image1,score1,name2,image2,score2); // pointer to the game board
        
        tc.ttt.game.message = 'waiting...';
        tc.showMessage = true;
        tc.ttt.$save(tc.ttt.game);
        
        tc.gameOver = false;
      }

      // ---------------------------------------------- 
      // Join game
      // ---------------------------------------------- 
      function joinGame() {
        tc.gameId = prompt("Please enter the game ID to join.");
        tc.gameOver = false;
        //resetGame();//name1,image1,score1,name2,image2,score2);
        initializeGame(name1,image1,score1,name2,image2,score2);
        tc.ttt.game.message = 'Game on';
  
        tc.ttt.game.currentPlayerNum = 1;
        tc.ttt.$save(tc.ttt.game);

        tc.ttt.player2.initiated = true;
        tc.ttt.$save(tc.ttt.player2);
      }

     /*---------------------
     // Play Again button pressed to reset the game board
     //--------------------*/
     function playAgain() {
        // Reset game board , players, game variables
        tc.gameOver = false;
        name1 = tc.ttt.player1.name;
        name2 = tc.ttt.player2.name;
        image1 = tc.ttt.player1.image;
        image2 = tc.ttt.player2.image;
        score1 = tc.ttt.player1.score;
        score2 = tc.ttt.player2.score;

        initializeGame(name1,image1,score1,name2,image2,score2);
        tc.game.winner = '';
        tc.game.cellsOccupied = 0;
        tc.game.currentPlayerNum = 1;
        // location.redraw();
     }

      /*  Called from index.html upon a box is clicked
      Checks if game is already over.  
      If not, checks the cell to ensure it's not already marked.
      Mark the cell and determine if it's a winning combination.  
      If no win, continue playing - switch currentPlayer
      If there is a winner, display the message and raise the score
       */
      function selectCell($index) {
         // perform only if winner is not found yet
         if (!tc.ttt.game.winner) {
            if (emptyCell($index)) {
                markCell ($index);
                tc.ttt.game.winner = getWinner(); 
                
                if (!tc.ttt.game.winner)  // no winner
                  switchPlayer();
                else {
                  if(tc.ttt.game.winner === 'Tie') {
                    displayMessage('Tie');
                  }
                  else { 
                    addScore(tc.ttt.game.currentPlayerNum);
                    displayMessage(tc.ttt.game.winner);
                  }
                }
            }
         }
      }  

      function markCell($index) {
//        console.log("current player = " + tc.ttt.game.currentPlayerNum );
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
        //mark w dimentional score board with the player marker (for future nXn board)
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

      // Update name of the player if changed
      function updatePlayer(playerNum,name,image) {
          if (playerNum === 1) {
            tc.ttt.player1.name = name;
            tc.ttt.player1.image = image;
            tc.ttt.$save(tc.ttt.player1);
            name1 = name;
            image1 = image;

          } else {
            tc.ttt.player2.name = name;
            tc.ttt.player2.image = image;
            tc.ttt.player2.initiated=true;
            tc.ttt.$save(tc.ttt.player2);
            name2 = name;
            image2 = image;
          }
      }

      //----------------------------------
      //Get game board pointer and initialize data
      //----------------------------------
      function initializeGame(name1,image1,score1,name2,image2,score2) {
        var rowcol; 
        var idx = 0;
        var URL = gameURL + tc.gameId;
        var ref =  new Firebase(URL);
         tc.ttt = $firebaseObject(ref);

          // 3X3 GAME BOARD
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

        //Game variables        
        tc.ttt.game = { "cellsOccupied": 0,   "theme" : "Star Wars",
                          "dimention" : 3,      "game"  : "img/StarWarsBackground.png",
                          "winner" : '',    "message": "",  "gameId": tc.gameId,
                          "currentPlayerNum" : 1} ;
        tc.ttt.$save(tc.ttt.game);
 
        // Player 1 info
        tc.ttt.player1 = { "autoPlay" : false,  
                  "currentPlayer" : true,
                  "image" : image1,
                  "initiated" : true,
                  "marker" : 'X',
                  "name" : name1,  
                  "playerNum" : 1,
                  "score" : score1} ;
        tc.ttt.$save(tc.ttt.player1);
 
        // Player 2 info
        tc.ttt.player2 = { "autoPlay" : false,  
                  "currentPlayer" : false,
                  "image" : image2,
                  "initiated" : false,
                  "marker" : 'O',
                  "name" : name2,  
                  "playerNum" : 2,
                  "score" : score2
                };         
        tc.ttt.$save(tc.ttt.player2);
      
    }

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
    
    //Check if cell is already occupid
    function emptyCell(index) {
      return (tc.ttt.board[index].marker==='');
    }


    // Display either win or tie on screen
    function displayMessage(winner) {
      tc.ttt.game.message = "Game Over. " + 
                  ((winner === 'Tie') ? "We have a tie!  Try again!" :
                                          winner + " wins!");
      tc.ttt.$save(tc.ttt.game);
      //alert(tc.ttt.game.message);
      tc.showMessage = true;
    }
    // check if the board is filled but no winner
    function isGameTie() {
      return ((tc.ttt.game.cellsOccupied) === (tc.ttt.game.dimention * tc.ttt.game.dimention)) ;
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
        
      if  ((tc.ttt.board[0].marker === tc.ttt.board[1].marker ) &&
           (tc.ttt.board[0].marker === tc.ttt.board[2].marker ) &&
           (tc.ttt.board[0].marker !== '') ) {
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

       if (tc.gameOver) {
          tc.ttt.game.winner = (tc.ttt.game.currentPlayerNum === 1 ? tc.ttt.player1.name : tc.ttt.player2.name);
          tc.ttt.$save(tc.ttt.game);
       }
       else if (isGameTie()) {
          tc.ttt.game.winner = 'Tie'; // game is tied
       }
       else {
          tc.ttt.game.winner =  '';
       }

        return tc.ttt.game.winner;
 
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



    }
})();

