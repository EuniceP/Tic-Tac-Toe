(function()  {
  angular
   .module('tttApp')
   .controller('tttController', tttController);

   tttController.$inject = ['$firebaseObject','$firebaseArray'];
 
   function tttController($firebaseObject, $firebaseArray) {
      // LOCAL variables
      var tc = this;
      var currentPlayer;

      // Global variables declaration
      // -------------------
      tc.theme = 'Star Wars'; // for dynamic background change
      tc.dimention = 3;       // default : 3X3 
      tc.imgDir = "img/";
      //tc.scoreBoard = [];  // use for the n-dimentional board for future
      tc.gameBoard = [];   // keeps track of game progress - used to display img on screen
      tc.message = 'waiting...';     // win/tie message at end of game
      tc.showMessage = false; // only true when game is over to disply message
      tc.gameId = 0;      // used to identify game to join
      tc.winningCells=[]; // use to highlight winning cells at end of game
      tc.playerName1="C-3PO";  // default player names
      tc.playerName2="R2-D2";
      tc.playerImage1="C-3PO.png";
      tc.playerImage2="R2-D2.png";

      tc.game=null;       // stores game related values

      // Global Fuction declaration
      // ---------------------------
      tc.selectCell = selectCell;
      tc.playAgain = playAgain;
      tc.addPlayer = addPlayer;
      tc.updatePlayer = updatePlayer;
      init();
      //------------------
      // NEW GAME
      // ----------------
      function init() {
         // Get database pointers for players the game board
         // ----------------------------------------------
        if (tc.gameId === 0) 
          tc.gameId = Math.floor(Math.random() * 1000); 

         tc.player1 = getPlayer(1); // get a pointer for the player1 database
         tc.player2= getPlayer(2); // get a pointer for the player2 database

         resetPlayers();
         currentPlayer = tc.player1;

         tc.gameBoard = getGameBoard();
         // run the following only once to insert data
 //        initializeGameBoard();
         tc.gameBoard = getGameBoard(); // pointer the game board
         //tc.game = getGameInfo(); // pointer to the game stat database
         tc.game = new Game(tc.theme,tc.dimention);
        // new gameId to join

        // The following will only need to be done once to create database objects
        // ---------------------------------------------
        // tc.player1.$add(new Player(tc.playerName1, 1, 'X', tc.playerImage1, false));
        // tc.player2.$add(new Player(tc.playerName2, 2, 'O', tc.playerImage2, false));

        // Initialize game board and global variables
        // tc.game.$add(new Game(tc.theme, tc.dimention)); 
        // tc.gameBoard.$add(initializeGameBoard());
        //tc.scoreBoard.$add(initializeScoreBoard());
      }
     /*---------------------
     // Play Again button pressed to reset the game board
     //--------------------*/
     function playAgain() {
      // Reset game board
      resetGameBoard();
      resetPlayers();
      tc.game = new Game(tc.theme,tc.dimention);
      tc.message = '';
      tc.showMessage = false;
      tc.winningCells=[];
      currentPlayer = tc.player1;
      location.redraw();

    }
      //--------------------- 
      // Define player object with properties & methods:
      //    name, image to display in cells, and initial scores
      //-------------------
      function Player(name,playerNum,marker,image) {
        var p = this;
        p.name = name;
        p.playerNum = playerNum; // 1 or 2 
        p.marker = marker;       // X or O   
        p.image = image;
        p.score = 0;
        p.initiated = false;
      }

      function addScore(playerNum) {
        if (playerNum === 1) {
          tc.player1.score ++;
          tc.player1.$save();
        }
        else{
          tc.player2.score ++;
          tc.player2.$save();
        }
      }

       function resetPlayers() {
         tc.player1.score = 0;
         tc.player1.marker='X';
         tc.player1.image = tc.imgDir+tc.playerImage1;
         tc.player1.initialized = false;
         tc.player1.name = tc.playerName1;
         tc.player1.playerNum = 1;
         tc.player2.score = 0;
         tc.player2.marker='O';
         tc.player2.image = tc.imgDir+tc.playerImage2;
         tc.player2.initialized = false;
         tc.player2.name = tc.playerName2;
         tc.player2.playerNum = 2;
         tc.player1.$save();
         tc.player2.$save();
       } 

       function updatePlayer(playerNum,name,image) {
          if (playerNum === 1) {
            tc.player1.name = name;
            tc.player1.image = 'img/'+image;
            tc.player1.initialized=true;
            tc.player1.$save();
            tc.playerName1 = name;
            tc.playerImage1 =  'img/'+image;

          } else {
            tc.player2.name = name;
            tc.player2.image = 'img/'+image;
            tc.player2.initialized=true;
            tc.player2.$save();
            tc.playerName2 = name;
            tc.playerImage2 =  'img/'+image;
          }
         
          console.log(tc.player1, tc.player2);
    }
      
  
      // get firebase database pointer to either player1 or player 2 data
      function getPlayer(playerNum) {
         var ref = new Firebase("https://tictactoe-r2d2.firebaseio.com/player1");
         var player = $firebaseArray(ref);
         // player.$bindTo(tc,"player1");
         return player;
      }
     function getPlayer2(playerNum) {
         var ref = new Firebase("https://tictactoe-r2d2.firebaseio.com/player2");
         var player = $firebaseArray(ref);
         // player.$bindTo(tc,"player2");
         return player;
      }
      // get firebase database pointer to either player1 or player 2 data
     // function getGameInfo() {
     //      var ref =  new Firebase("https://tictactoe-r2d2.firebaseio.com/gameInfo");
     //      var game = $firebaseObject(ref);
     //      return game;
     //  }

      // get the game board pointer
      function getGameBoard() {
          var ref =  new Firebase("https://tictactoe-r2d2.firebaseio.com/gameBoard");
          var board = $firebaseArray(ref);
          // board.$bindTo(tc,"gameBoard");
          return board;
      }
         //initialize the board to empty (zero) - players will have 1 or 2 when box selected
      function initializeGameBoard() {
        var rowcol; 
        var gameBoard=[];
        var idx = 0;
        var temp=[];
        for (var i=0; i< tc.dimention; i++) {
          for (var j=0; j< tc.dimention; j++) {
            rowcol = i.toString() + j.toString();
            temp = { "anIndex": idx,
                     "image"  : '',
                     "marker" : '',   
                     "rowcol" : rowcol, 
                     "winningCell"  : false };
            tc.gameBoard.$add(temp);
            idx ++;
             } //true when GAME won
         }
       return gameBoard;
      }

      // add the new players
      function addPlayer(playerNum, playerName, newImage) {
          var player=[];

          if (playerNum === 1) {
            if (tc.player1.length !== 0) {
                  tc.player1.name = playerName;
                  tc.player1.image = newImage;
                  tc.player1.score = 0;
                  tc.player1.initiated = true;
                  tc.player1.$save();
            }   
            else {
               tc.player1.$add(new Player(playerName1, playerNum, 'X', playerImage, true)); 
               tc.player1.$save();
            }
            tc.thisPlayer = player1;
          }
          else {
             if (tc.player2.length !== 0) {
                  tc.player2.name = playerName;
                  tc.player2.image = newImage;
                  tc.player2.score = 0;
                  tc.player2.initiated = true;
                  tc.player2.$save();
              }
              else {
                tc.player2.$add(new Player(playerName2, playerNum, 'O', playerImage, true)); 
                tc.player2.$save();
              }
              tc.thisPlayer = player2;
          }
        }


          //   .playerName = playerName;
          //   player1.name = ((trim(playerName).length === 0)  ? imgDir+"C-3PO" : playerName);
          //   player1.image =((trim(playerImage).length === 0) ? imgDir+"C-3PO.png" : implDir+newImage);
          //   tc.thisPlayer = player1;
          // }
          // else {
          //   player2.playerName = playerName;
          //   player2.name = ((trim(playerName).length === 0)  ? imgDir+"R2-D2" : playerName);
          //   player2.image =((trim(playerImage).length === 0) ? imgDir+"R2-D2.png" : implDir+newImage);
          //   tc.playersList.$add( player2);
          //   tc.thisPlayer = player2;
          // }

          // if (playersList.length === 0) {
          //   tc.playersList.$add(thisPlayer);
          //   tc.thisPlayerIdx = 0;
          // }
          // else if (tc.playersList.length === 1) {
          //    if (tc.playersList[0].name === playerName) {
          //       tc.playersList[0].image = newImage;
          //       thisPlayerIdx = 0;
          //     }
          //     else {
          //       tc.playersList.$add(thisPlayer);
          //       thisPlayerIdx = 1;
          //     }


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
      for (i=0; i<tc.gameBoard.length;i++) {
          tc.gameBoard[i].image = '';
          tc.gameBoard[i].marker = '';
          tc.gameBoard[i].displayImage = false;
          tc.gameBoard[i].winnningCell = false;
          tc.gameBoard.$save();
      }

        // for (i =0; i< tc.dimention ; i++) 
        //   for (j =0; j <tc.dimention; j++)
        //     tc.scoreBoard[i][j]='';

  //      tc.game.backgroundImg = tc.imgDir + tc.theme.replace(' ','') + "Background.png";
        tc.game.winner = '';
     }  
 

    // blank score board
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
                  
                  addScore(currentPlayer.playerNum);
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
        tc.gameBoard.$save();
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

