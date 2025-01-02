const gameBoard = (function () { //Will control everything relating to the gameboard
    /*
    Below is a 2d Array of objects to store a matrix of game data.
    The 2d array uses the concept of a "magic square" 
    i.e the unique value property of all rows, columns and the two diagonals sum to a number
    or "magical constant" - in this case 15:
    */
    const board = [[{ value: 8, player: null }, { value: 1, player: null }, { value: 6, player: null }],
    [{ value: 3, player: null }, { value: 5, player: null }, { value: 7, player: null }],
    [{ value: 4, player: null }, { value: 9, player: null }, { value: 2, player: null }]];

    const getBoard = () => board; //Exposes board variable while keeping it private in lexical scope/closure.

    const claimCell = (rowSelection, columnSelection, playerSymbol) => {
        if (board[rowSelection][columnSelection].player === null) {
            board[rowSelection][columnSelection].player = `${playerSymbol}`;
        }
    }

    const printBoard = () => {
        for (let row of board) {
            let rowString = row.map(cell => `${cell.value} (${cell.player || " "})`).join(" | ");
            console.log(rowString);
        }
    }

    const getLinesFromSelectedCell = (rowSelection, columnSelection) => { //This will get the row, column and diagonal (if applicable) relevant to the player's selected cell.
        const row = board[rowSelection];
        const col = board.map(row => row[columnSelection]);
        let primaryDiagonal = [];
        let secondaryDiagonal = [];

        if (rowSelection === columnSelection) { //If the row is the same as the column, we could have a diagonal win. 
            primaryDiagonal = [board[0][0], board[1][1], board[2][2]];
        }

        if (rowSelection + columnSelection === 2) { // This checks if the cell is on the secondary diagonal.
            secondaryDiagonal = [board[0][2], board[1][1], board[2][0]];
        }
        return { row, col, primaryDiagonal, secondaryDiagonal }
    };

    return { getBoard, claimCell, printBoard, getLinesFromSelectedCell };
})();

function Player(name, symbol) { //Factory function for player creation.
    const userName = name;
    const userSymbol = symbol;
    return { userName, userSymbol }
};

function GameController() { //will control all aspects of the game.
    let players = {
        playerOne: Player("Player One", "x"),
        playerTwo: Player("Player Two", "o"),
    };

    let currentPlayer = players.playerOne;
    let roundCount = 0;
    let gameResult = "";
    let gameWinner = null;
    let gameOver = false;


    const switchPlayerTurn = () => {
        currentPlayer === players.playerOne ? currentPlayer = players.playerTwo
            : currentPlayer = players.playerOne; //If current turn is player one, then switch to two, and vice versa
    };

    const getCurrentPlayer = () => currentPlayer;

    const playRound = (rowSelection, columnSelection) => {
        if (gameWinner !== null) { //If the game has a winner, the game is over.
            return
        }
        if (gameBoard.getBoard()[rowSelection][columnSelection].player !== null) { //If the cell has already been selected.
            console.log("You can't place here.");
            return;
        }

        roundCount++;
        console.log(`${getCurrentPlayer().userName} has made their decision!`);
        gameBoard.claimCell(rowSelection, columnSelection, getCurrentPlayer().userSymbol);
        gameBoard.printBoard();
        checkForWin(getCurrentPlayer(), rowSelection, columnSelection);
        switchPlayerTurn();
    };

    const checkForWin = (player, rowSelection, columnSelection) => {
        const { row, col, primaryDiagonal, secondaryDiagonal } = gameBoard.getLinesFromSelectedCell(rowSelection, columnSelection); // Destructuring the returned object.

        const isWinningLine = (line) => { //Because of the magic square, we just need to check each line (row, col or diagonal) held by the player to see if they total to the magic constant (15).
            let playerCells = line.filter(cell => cell.player === player.userSymbol);
            let playerSum = playerCells.reduce((sum, cell) => sum + cell.value, 0);
            return playerSum === 15;
        };

        if (isWinningLine(row) || isWinningLine(col) || isWinningLine(primaryDiagonal) || (isWinningLine(secondaryDiagonal))) //If any of the win conditions are met.
        {
            gameWinner = player.userName;
            console.log(`${gameWinner} has won the game!`);
            return gameOver = true;
        }

        else if (roundCount === 9) { //If all 9 turns have been used, the game must be a draw.
            gameResult = "Draw";
            console.log("It's a draw!");
        }

    }

    return { switchPlayerTurn, getCurrentPlayer, playRound, checkForWin };
};

const uiController = (function () { //will control the users interaction with UI elements
    const domElements = {}; //Initialize object to hold dom elements for reusability sake.

    const game = GameController();

    const cacheDOM = () => {
        domElements.cellGrid = document.querySelector(".game-cells-grid");
    };

    const getDOMElements = () => {
        if (Object.keys(domElements).length === 0) { //We want to keep caching to a minimum
            cacheDOM();
        }

        return domElements;
    }

    const addCellEventListener = (() => { //Event delegation to save memory/performance
        const { cellGrid } = getDOMElements();
        cellGrid.addEventListener("click", (e) => {
            if (e.target.classList.contains("cell")) { //Just to make sure we are clicking on a cell item.
                if (e.target.innerHTML === "") {
                    writeToCell(e.target, game.getCurrentPlayer().userSymbol);
                    game.playRound(e.target.getAttribute("row"), e.target.getAttribute("column"));
                }
            } else return;
        });
    });

    const writeToCell = (element, playerSymbol) => {
        element.textContent = playerSymbol;
    }

    const buildTable = (() => { 
        const { cellGrid } = getDOMElements();
        let board = gameBoard.getBoard();
        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) { //Use nested for loops to loop through multi-dimensional array, one to loop through 
            for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
                const gameCell = document.createElement("div");
                gameCell.classList.add("cell");
                gameCell.setAttribute("row", rowIndex);
                gameCell.setAttribute("column", colIndex);
                cellGrid.appendChild(gameCell);
            };
        };
        addCellEventListener();
    })();
})();